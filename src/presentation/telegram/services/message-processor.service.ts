import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import { session } from 'telegraf/session';
import { BaseTelegramService } from '@/infrastructure/external/telegram/services/base-telegram.service';
import { TelegramMessageMapper } from '@/infrastructure/external/telegram/mappers/telegram-message.mapper';
import { EvaluateMessageService } from '@/infrastructure/external/llm/services/evaluate-message.service';
import { ResolveIntentService } from '@/infrastructure/external/llm/services/resolve-intent.service';
import { ClarifyAnyService } from '@/infrastructure/external/llm/services/clarify-any.service';
import { EventPayloadMapper } from '@/application/adapters/event-payload-mapper';
import { EventAdapter } from '@/application/adapters/event.adapter';
import { ConfirmIntentService } from '@/infrastructure/external/llm/services/confirm-intent.service';

/**
 * Interface for session data.
 */
interface SessionData {
    pendingClarification?: {
        clarification: string;
        originalMessage: string;
        intentType: string;
        pendingPayload: Record<string, any>;
    };
    pendingIntent?: {
        type: string;
        payload: Record<string, any>;
        confirmationPrompt: string;
    };
    conversationState?: string;
}

/**
 * Custom Telegram context with session.
 */
interface MyContext extends Context {
    session: SessionData;
}

@Injectable()
export class MessageProcessorService
    extends BaseTelegramService
    implements OnModuleInit
{
    protected override bot: Telegraf<MyContext>;
    private readonly mapper: TelegramMessageMapper;
    private readonly logger = new Logger(MessageProcessorService.name);

    // Update this to the correct calendarId
    private readonly CALENDAR_ID = 'davidlosas93@gmail.com';

    constructor(
        configService: ConfigService,
        private readonly evaluateMessageService: EvaluateMessageService,
        private readonly resolveIntentService: ResolveIntentService,
        private readonly clarifyAnyService: ClarifyAnyService,
        private readonly eventAdapter: EventAdapter,
        private readonly confirmIntentService: ConfirmIntentService,
    ) {
        super(configService);
        this.mapper = new TelegramMessageMapper();

        this.bot = new Telegraf<MyContext>(this.config.token);
        this.bot.use(session());

        this.logger.log(
            'MessageProcessorService initialized, setting up handlers',
        );
        this.setupMessageHandlers();
    }

    async onModuleInit(): Promise<void> {
        this.logger.log('Launching Telegram bot...');
        await this.bot.launch();
        this.logger.log('Telegram bot launched and listening for messages');
    }

    private setupMessageHandlers(): void {
        this.bot.on('text', async (ctx) => {
            await this.handleConversationalMessage(ctx);
        });
        this.bot.command('start', async (ctx) => {
            await this.handleStartCommand(ctx);
        });
        this.bot.command('help', async (ctx) => {
            await this.handleHelpCommand(ctx);
        });
    }

    private extractPayloadIfNeeded(obj: any): any {
        if (
            obj &&
            typeof obj === 'object' &&
            'payload' in obj &&
            typeof obj.payload === 'object'
        ) {
            this.logger.log(
                '[DEBUG] Nested payload detected. Using .payload:',
                JSON.stringify(obj.payload),
            );
            return obj.payload;
        }
        this.logger.log(
            '[DEBUG] Plain payload detected. Using as is:',
            JSON.stringify(obj),
        );
        return obj;
    }

    private buildEventSummary(dto: any): string {
        let replyMsg = `He creado el evento "${dto.title}"`;
        const fecha = dto.start.value.toLocaleDateString();
        const hora =
            dto.isAllDay || !dto.start.value.getHours()
                ? ''
                : ` de ${dto.start.value
                      .toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                      })
                      .replace(/^(\d{1,2}):(\d{2})$/, '$1:$2')}` +
                  ` a ${dto.end.value
                      .toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                      })
                      .replace(/^(\d{1,2}):(\d{2})$/, '$1:$2')}`;

        replyMsg += dto.isAllDay
            ? ` para el día ${fecha} (todo el día).`
            : ` para el día ${fecha}${hora}.`;

        if (dto.location) {
            replyMsg += `\nLugar: ${dto.location}`;
        }
        if (dto.description) {
            replyMsg += `\nDescripción: ${dto.description}`;
        }

        return replyMsg;
    }

    // Nueva función: formatea conflicto para el usuario
    private buildConflictMessage(e: any): string {
        let overlappingEvents =
            e?.response?.details?.overlappingEvents ||
            e?.details?.overlappingEvents ||
            [];
        if (!Array.isArray(overlappingEvents) || overlappingEvents.length === 0)
            return 'No he podido crear el evento porque solapa con otro evento existente.';
        const eventos = overlappingEvents
            .map(
                (ev: any) =>
                    `- "${ev.title}", de ${this.formatFechaHora(ev.start)} a ${this.formatFechaHora(ev.end)}`,
            )
            .join('\n');
        return `No se ha podido crear el evento porque solapa con otro evento existente:\n${eventos}`;
    }

    // Helper para formato fecha/hora
    private formatFechaHora(dateString: string): string {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    private async handleConversationalMessage(ctx: MyContext): Promise<void> {
        try {
            if (!ctx.session) {
                this.logger.warn(
                    'Session object was undefined, initializing new session object',
                );
                ctx.session = {};
            }

            if (!ctx.message || typeof (ctx.message as any).text !== 'string') {
                this.logger.warn('Received message without text property');
                return;
            }
            const text = (ctx.message as any).text;

            // --- Pending intent confirmations (LLM) ---
            if (ctx.session.pendingIntent) {
                this.logger.log(
                    'Pending intent detected. Analyzing human confirmation with LLM...',
                );
                const { type, payload, confirmationPrompt } =
                    ctx.session.pendingIntent;
                this.logger.log(
                    `Pending intent payload: ${JSON.stringify(payload)}`,
                );
                const confirmResult = await this.confirmIntentService.confirm(
                    confirmationPrompt,
                    text,
                );
                this.logger.log(
                    `ConfirmIntentService: LLM result: ${JSON.stringify(confirmResult)}`,
                );
                if (confirmResult.confirmed) {
                    try {
                        if (type === 'CREATE_EVENT') {
                            this.logger.log(
                                'Creating event after confirmation...',
                            );
                            this.logger.log(
                                'Payload before mapping DTO:',
                                JSON.stringify(payload),
                            );
                            const payloadToMap =
                                this.extractPayloadIfNeeded(payload);
                            const dto = EventPayloadMapper.toCreateEventDto(
                                payloadToMap,
                                this.CALENDAR_ID,
                            );
                            this.logger.log('Mapped DTO:', JSON.stringify(dto));
                            await this.eventAdapter.createEvent(
                                dto,
                                this.CALENDAR_ID,
                            );
                            this.logger.log('Event created after confirmation');
                            await ctx.reply(this.buildEventSummary(dto));
                        }
                    } catch (e: any) {
                        this.logger.error(
                            'Error creating event after confirmation:',
                            e,
                            JSON.stringify(e),
                        );
                        // CONFLICT HANDLING
                        if (
                            e?.response?.message ===
                            'Event overlaps with existing events'
                        ) {
                            await ctx.reply(this.buildConflictMessage(e));
                        } else {
                            await ctx.reply(
                                'No he podido crear el evento. ¿Podrías intentarlo de nuevo asegurando que incluyes el título, la fecha y la hora (o marca como todo el día)?',
                            );
                        }
                    }
                    ctx.session.pendingIntent = undefined;
                    ctx.session.conversationState = undefined;
                    return;
                } else {
                    this.logger.log(
                        `ConfirmIntentService: confirmation rejected or ambiguous`,
                    );
                    await ctx.reply(
                        confirmResult.clarification ||
                            '¿Te gustaría confirmar la acción?',
                    );
                    return;
                }
            }

            // --- Clarification flow ---
            if (ctx.session.pendingClarification) {
                const {
                    clarification,
                    originalMessage,
                    intentType,
                    pendingPayload,
                } = ctx.session.pendingClarification;
                const userReply = text;

                this.logger.log(
                    'Clarification pending. Current data:',
                    JSON.stringify({
                        clarification,
                        originalMessage,
                        intentType,
                        pendingPayload,
                        userReply,
                    }),
                );

                const { clarification: clar, ...payloadCleaned } =
                    pendingPayload;

                const clarificationResult =
                    await this.clarifyAnyService.clarifyAny(
                        clarification,
                        userReply,
                        originalMessage,
                        intentType,
                        payloadCleaned,
                    );
                this.logger.log(
                    `LLM ClarifyAny result: ${JSON.stringify(clarificationResult)}`,
                );

                const mergedPayload = {
                    ...payloadCleaned,
                    ...clarificationResult,
                };

                const payloadToMap = this.extractPayloadIfNeeded(mergedPayload);

                this.logger.log(
                    '[DEBUG] Payload after clarification (ready for mapper):',
                    JSON.stringify(payloadToMap),
                );

                if (
                    intentType === 'CREATE_EVENT' &&
                    payloadToMap.title &&
                    payloadToMap.start
                ) {
                    try {
                        this.logger.log(
                            '[INFO] Event data is complete, creating event and ignoring further clarifications.',
                        );
                        const dto = EventPayloadMapper.toCreateEventDto(
                            payloadToMap,
                            this.CALENDAR_ID,
                        );
                        await this.eventAdapter.createEvent(
                            dto,
                            this.CALENDAR_ID,
                        );
                        this.logger.log('Event created after clarification');
                        await ctx.reply(this.buildEventSummary(dto));
                    } catch (e: any) {
                        this.logger.error(
                            'Error creating event (clarification):',
                            e,
                            JSON.stringify(e),
                        );
                        // CONFLICT HANDLING
                        if (
                            e?.response?.message ===
                            'Event overlaps with existing events'
                        ) {
                            await ctx.reply(this.buildConflictMessage(e));
                        } else {
                            await ctx.reply(
                                'No he podido crear el evento. ¿Podrías intentarlo de nuevo asegurando que incluyes el título, la fecha y la hora (o marca como todo el día)?',
                            );
                        }
                    }
                    ctx.session.pendingClarification = undefined;
                    ctx.session.conversationState = undefined;
                    return;
                }

                if (clarificationResult.clarification) {
                    ctx.session.pendingClarification = {
                        clarification: clarificationResult.clarification,
                        originalMessage,
                        intentType,
                        pendingPayload: mergedPayload,
                    };
                    this.logger.log(
                        '[CLARIFY] Additional question to user:',
                        clarificationResult.clarification,
                    );
                    await ctx.reply(clarificationResult.clarification);
                    return;
                }

                ctx.session.pendingClarification = undefined;
                ctx.session.conversationState = undefined;
                return;
            }

            // --- Normal conversational pipeline ---
            const userInfo = this.mapper.extractUserInfo(ctx);
            const message = text;
            this.logger.log(
                `Received message: "${message}" from user ${userInfo.username || userInfo.userId}`,
            );
            const evalResult =
                await this.evaluateMessageService.evaluateMessage(message);
            this.logger.log(
                `LLM evaluation result: ${JSON.stringify(evalResult)}`,
            );

            if (!evalResult.relevant || !evalResult.messages.user) {
                this.logger.log(
                    '[DEBUG] Message not relevant or missing user intent',
                );
                await ctx.reply(evalResult.messages.llm);
                return;
            }
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const currentHour = today.getHours();
            const isConfusingTime = currentHour >= 23 || currentHour < 5;

            this.logger.log('[DEBUG] Resolving intent...');
            const interpreted = await this.resolveIntentService.resolveIntent(
                evalResult.messages.user,
                {
                    today: today.toISOString(),
                    tomorrow: tomorrow.toISOString(),
                    isConfusingTime,
                },
            );
            this.logger.log(
                `Intent detected: "${interpreted.type}", Payload: ${JSON.stringify(interpreted.payload)}`,
            );

            if (interpreted.payload?.confirmation) {
                this.logger.log(
                    '[CONFIRM] User confirmation required:',
                    interpreted.payload.confirmation,
                );
                ctx.session.pendingIntent = {
                    type: interpreted.type,
                    payload: interpreted.payload,
                    confirmationPrompt: interpreted.payload.confirmation,
                };
                await ctx.reply(interpreted.payload.confirmation);
                return;
            }

            if (interpreted.payload?.clarification) {
                this.logger.log(
                    '[CLARIFY] User clarification required:',
                    interpreted.payload.clarification,
                );
                ctx.session.pendingClarification = {
                    clarification: interpreted.payload.clarification,
                    originalMessage: evalResult.messages.user,
                    intentType: interpreted.type,
                    pendingPayload: interpreted.payload,
                };
                await ctx.reply(interpreted.payload.clarification);
                return;
            }

            if (interpreted.type === 'CREATE_EVENT') {
                try {
                    this.logger.log(
                        '[DEBUG] Creating event from direct intent...',
                    );
                    this.logger.log(
                        'Payload before mapping DTO:',
                        JSON.stringify(interpreted.payload),
                    );
                    const payloadToMap = this.extractPayloadIfNeeded(
                        interpreted.payload,
                    );
                    const dto = EventPayloadMapper.toCreateEventDto(
                        payloadToMap,
                        this.CALENDAR_ID,
                    );
                    this.logger.log('Mapped DTO:', JSON.stringify(dto));
                    await this.eventAdapter.createEvent(dto, this.CALENDAR_ID);
                    this.logger.log('Event created from intent');
                    await ctx.reply(this.buildEventSummary(dto));
                } catch (e: any) {
                    this.logger.error(
                        'Error creating event (direct intent):',
                        e,
                        JSON.stringify(e),
                    );
                    // CONFLICT HANDLING
                    if (
                        e?.response?.message ===
                        'Event overlaps with existing events'
                    ) {
                        await ctx.reply(this.buildConflictMessage(e));
                    } else {
                        await ctx.reply(
                            'No he podido crear el evento. ¿Podrías intentarlo de nuevo asegurando que incluyes el título, la fecha y la hora (o marca como todo el día)?',
                        );
                    }
                }
                return;
            }
            if (interpreted.type === 'LIST_EVENTS') {
                try {
                    const start = new Date();
                    const end = new Date();
                    end.setDate(start.getDate() + 7);
                    this.logger.log(
                        '[DEBUG] Requesting calendar events from adapter...',
                    );
                    const events = await this.eventAdapter.findEvents(
                        start,
                        end,
                    );
                    this.logger.log(`[DEBUG] Events found: ${events.length}`);
                    if (!events.length) {
                        await ctx.reply('No tienes eventos próximos.');
                    } else {
                        const msg = events
                            .map(
                                (ev) =>
                                    `📅 ${ev.title}\n📆 ${ev.start.value.toLocaleDateString()} ${ev.start.value.toLocaleTimeString()}\n📍 ${ev.location || 'No especificada'}`,
                            )
                            .join('\n\n');
                        await ctx.reply(msg);
                    }
                } catch (e) {
                    this.logger.error('Error listing events:', e);
                    await ctx.reply(
                        'No he podido obtener tus eventos, prueba más tarde.',
                    );
                }
                return;
            }
            await ctx.reply(
                'No he entendido tu solicitud. Recuerda que puedo ayudarte a crear eventos o decirte tus próximos eventos.',
            );
        } catch (e) {
            this.logger.error('[FATAL] Unexpected error in main flow:', e);
            await ctx.reply(
                'Ha ocurrido un error inesperado. Por favor, repite tu petición o contacta con soporte.',
            );
        }
    }

    private async handleStartCommand(ctx: MyContext): Promise<void> {
        try {
            const userInfo = this.mapper.extractUserInfo(ctx);
            const welcomeMessage = `¡Bienvenido ${userInfo.username || 'usuario'}! Puedo ayudarte a gestionar tus eventos de calendario. Escribe lo que necesites, por ejemplo: "crear un evento mañana a las 2 con Marta". Usa /help para ver más ejemplos.`;
            await ctx.reply(welcomeMessage);
        } catch (error) {
            this.logger.error('Error in start command', error);
            await ctx.reply(
                '¡Bienvenido! Puedo ayudarte a gestionar tus eventos de calendario. Usa /help para ver ejemplos.',
            );
        }
    }

    private async handleHelpCommand(ctx: MyContext): Promise<void> {
        const helpMessage = `
            Ejemplos de cosas que puedes pedirme:
            - Crear un evento mañana a las 10 para desayunar con Ana.
            - ¿Qué tengo programado la semana que viene?
            - Quiero un evento el 25 de mayo a las 15:30, cita con el dentista.

            Solo tienes que escribir tu petición de forma natural, yo te ayudo con el resto.
        `.trim();
        await ctx.reply(helpMessage);
    }
}
