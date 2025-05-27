/**
 * @file message-processor.service
 * @description Dynamic entrypoint for Telegram conversational bot (ReminderGram).
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import { session } from 'telegraf/session';
import { BaseTelegramService } from '@/infrastructure/external-services/telegram/services/base-telegram.service';
import { EvaluateMessageService } from '@/infrastructure/external-services/llm/services/evaluate-message.service';
import { ResolveIntentService } from '@/infrastructure/external-services/llm/services/resolve-intent.service';
import { ClarifyAnyService } from '@/infrastructure/external-services/llm/services/clarify-any.service';
import { EventPayloadMapper } from '@/application/adapters/event-payload-mapper';
import { EventAdapter } from '@/application/adapters/event.adapter';
import { ConfirmIntentService } from '@/infrastructure/external-services/llm/services/confirm-intent.service';
import { DeleteEventService } from '@/infrastructure/external-services/llm/services/delete-event.service';
import { env } from '@/config/env/env.config';

/**
 * Represents session data for each Telegram conversation.
 * @interface SessionData
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
 * Extends the Telegram Context with a session object for storing conversation state.
 * @interface MyContext
 */
interface MyContext extends Context {
    session: SessionData;
}

/**
 * Main entrypoint for Telegram conversational bot.
 * Handles user messages, orchestrates the LLM intent/clarification/confirmation pipeline,
 * and communicates responses back to Telegram.
 */
@Injectable()
export class MessageProcessorService
    extends BaseTelegramService
    implements OnModuleInit
{
    protected override bot: Telegraf<MyContext>;
    protected override readonly logger = new Logger(
        MessageProcessorService.name,
    );

    private readonly CALENDAR_ID = env.GOOGLE_CALENDAR_ID;

    /**
     * Constructs the message processor and sets up Telegram bot handlers.
     * @param configService The configuration service instance.
     * @param evaluateMessageService Service for evaluating message relevance.
     * @param resolveIntentService Service for resolving user intent.
     * @param clarifyAnyService Service for clarifying incomplete intents.
     * @param eventAdapter Adapter for event-related use-cases.
     * @param confirmIntentService Service for intent confirmation via LLM.
     * @param deleteEventService Service for event deletion.
     */
    constructor(
        configService: ConfigService,
        private readonly evaluateMessageService: EvaluateMessageService,
        private readonly resolveIntentService: ResolveIntentService,
        private readonly clarifyAnyService: ClarifyAnyService,
        private readonly eventAdapter: EventAdapter,
        private readonly confirmIntentService: ConfirmIntentService,
        private readonly deleteEventService: DeleteEventService,
    ) {
        super(configService);

        // Initialize the bot
        this.bot = new Telegraf<MyContext>(this.config.token);
        this.bot.use(session());
        this.logger.log('MessageProcessorService initialized');
        this.setupMessageHandlers();
    }

    /**
     * Initializes the Telegram bot asynchronously after module initialization.
     * This allows the app to boot up without waiting for the bot to be ready.
     * @async
     */
    async onModuleInit(): Promise<void> {
        this.logger.log('Initializing Telegram bot...');

        // Using setTimeout to prevent blocking the application bootstrap process
        setTimeout(() => {
            this.bot
                .launch()
                .then(() => {
                    this.logger.log('Telegram bot launched and ready!');
                })
                .catch((err) => {
                    this.logger.error('Error launching Telegram bot', err);
                });
        }, 0); // Executes after the application completes its initialization
    }

    /**
     * Sets up Telegram handlers for text messages and standard commands.
     * @private
     */
    private setupMessageHandlers(): void {
        this.bot.on('text', async (ctx) => {
            await this.handleConversationalMessage(ctx);
        });
        this.bot.command('start', async (ctx) => {
            await ctx.reply(
                '¡Bienvenido! Te ayudo a gestionar eventos de tu calendario. Escribe tu petición.',
            );
        });
        this.bot.command('help', async (ctx) => {
            await ctx.reply(
                `Ejemplos:\n- Crea un evento mañana a las 10 para desayunar con Ana.\n- ¿Qué tengo la próxima semana?\n- Quiero un evento el 25 de mayo a las 15:30, cita dentista.\n\nSolo escribe tu solicitud y te ayudaré.`,
            );
        });
    }

    /**
     * Main conversational handler for dynamic user messages.
     * Handles confirmation, clarification, and LLM-based intent resolution.
     * @async
     * @param ctx Telegram context for the message.
     */
    private async handleConversationalMessage(ctx: MyContext): Promise<void> {
        try {
            if (!ctx.session) ctx.session = {};

            const message = ctx.message;
            if (!message || typeof (message as any).text !== 'string') {
                await ctx.reply('Solo se permiten mensajes de texto.');
                return;
            }
            const text = (message as any).text;

            // --- Pending Intent Confirmation (LLM) ---
            if (ctx.session.pendingIntent) {
                const { type, payload, confirmationPrompt } =
                    ctx.session.pendingIntent;
                const confirmResult = await this.confirmIntentService.confirm(
                    confirmationPrompt,
                    text,
                );
                if (confirmResult.confirmed) {
                    if (type === 'CREATE_EVENT') {
                        const dto = EventPayloadMapper.toCreateEventDto(
                            this.extractPayloadIfNeeded(payload),
                            this.CALENDAR_ID,
                        );
                        await this.eventAdapter.createEvent(
                            dto,
                            this.CALENDAR_ID,
                        );
                        await ctx.reply(this.buildEventSummary(dto));
                    }
                    ctx.session.pendingIntent = undefined;
                    ctx.session.conversationState = undefined;
                    return;
                } else {
                    await ctx.reply(
                        confirmResult.clarification ||
                            '¿Deseas confirmar esta acción?',
                    );
                    return;
                }
            }

            // --- Clarification Flow ---
            if (ctx.session.pendingClarification) {
                const {
                    clarification,
                    originalMessage,
                    intentType,
                    pendingPayload,
                } = ctx.session.pendingClarification;
                const userReply = text;
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

                const mergedPayload = {
                    ...payloadCleaned,
                    ...clarificationResult,
                };
                const payloadToMap = this.extractPayloadIfNeeded(mergedPayload);

                if (
                    intentType === 'CREATE_EVENT' &&
                    payloadToMap.title &&
                    payloadToMap.start
                ) {
                    const dto = EventPayloadMapper.toCreateEventDto(
                        payloadToMap,
                        this.CALENDAR_ID,
                    );
                    await this.eventAdapter.createEvent(dto, this.CALENDAR_ID);
                    await ctx.reply(this.buildEventSummary(dto));
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
                    await ctx.reply(clarificationResult.clarification);
                    return;
                }

                ctx.session.pendingClarification = undefined;
                ctx.session.conversationState = undefined;
                return;
            }

            // --- Main LLM Intent Pipeline ---
            const evalResult =
                await this.evaluateMessageService.evaluateMessage(text);

            if (!evalResult.relevant || !evalResult.messages.user) {
                await ctx.reply(evalResult.messages.llm);
                return;
            }
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const currentHour = today.getHours();
            const isConfusingTime = currentHour >= 23 || currentHour < 5;

            const interpreted = await this.resolveIntentService.resolveIntent(
                evalResult.messages.user,
                {
                    today: today.toISOString(),
                    tomorrow: tomorrow.toISOString(),
                    isConfusingTime,
                },
            );

            if (interpreted.payload?.confirmation) {
                ctx.session.pendingIntent = {
                    type: interpreted.type,
                    payload: interpreted.payload,
                    confirmationPrompt: interpreted.payload.confirmation,
                };
                await ctx.reply(interpreted.payload.confirmation);
                return;
            }

            if (interpreted.payload?.clarification) {
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
                const dto = EventPayloadMapper.toCreateEventDto(
                    this.extractPayloadIfNeeded(interpreted.payload),
                    this.CALENDAR_ID,
                );
                await this.eventAdapter.createEvent(dto, this.CALENDAR_ID);
                await ctx.reply(this.buildEventSummary(dto));
                return;
            }
            if (interpreted.type === 'LIST_EVENTS') {
                const start = new Date();
                const end = new Date();
                end.setDate(start.getDate() + 7);
                const events = await this.eventAdapter.findEvents(start, end);
                if (!events.length) {
                    await ctx.reply('No tienes eventos próximos.');
                } else {
                    const msg = events
                        .map((ev) => {
                            const isAllDay = ev.getIsAllDay();
                            const dateStr = ev
                                .getStart()
                                .value.toLocaleDateString();

                            // If it's an all-day event, don't show time
                            const horaStr = isAllDay
                                ? ''
                                : ' ' +
                                  ev
                                      .getStart()
                                      .value.toLocaleTimeString('es-ES', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: false,
                                      });

                            return [
                                `💠 ${ev.getTitle()}`,
                                `📆 ${dateStr}${horaStr}`,
                                `📍 ${ev.getLocation() || 'Sin ubicación especificada'}`,
                            ].join('\n');
                        })
                        .join('\n\n');

                    await ctx.reply(msg);
                }
                return;
            }
            if (interpreted.type === 'DELETE_EVENT') {
                const start = new Date();
                const end = new Date();
                end.setDate(start.getDate() + 30);

                const events = await this.eventAdapter.findEvents(start, end);

                const eventList = events.map((ev) => ({
                    id: ev.getId(),
                    title: ev.getTitle(),
                    start: ev.getStart().value.toISOString(),
                    end: ev.getEnd().value.toISOString(),
                    location: ev.getLocation(),
                }));

                const selection =
                    await this.deleteEventService.selectEventToDelete(
                        evalResult.messages.user,
                        eventList,
                    );

                if (selection.eventId) {
                    await this.eventAdapter.deleteEvent(selection.eventId);
                    await ctx.reply('Evento eliminado correctamente.');
                } else if (selection.clarification) {
                    await ctx.reply(selection.clarification);
                } else {
                    await ctx.reply(
                        'No se pudo identificar el evento a borrar. Por favor, proporciona más detalles.',
                    );
                }
                return;
            }
            await ctx.reply(
                'No he entendido tu solicitud. Puedes pedirme crear o listar eventos.',
            );
        } catch (e) {
            this.logger.error('Unexpected error in main flow', e);
            await ctx.reply(
                'Ha ocurrido un error inesperado. Intenta de nuevo o contacta con soporte.',
            );
        }
    }

    // #endregion

    // #region extractPayloadIfNeeded

    /**
     * Extracts the correct payload object for event creation,
     * supporting nested LLM outputs.
     * @param obj The raw or LLM response object.
     * @returns The payload object.
     */
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

    // #endregion

    // #region buildEventSummary

    /**
     * Builds a user-facing summary message for a created event.
     * @param dto Event DTO for display.
     * @returns Formatted summary string.
     */
    private buildEventSummary(dto: any): string {
        let replyMsg = `Evento creado "${dto.title}"`;
        const fecha = dto.start.value.toLocaleDateString();
        const hora =
            dto.isAllDay || !dto.start.value.getHours()
                ? ''
                : ` de ${dto.start.value.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                  })}` +
                  ` a ${dto.end.value.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                  })}`;

        replyMsg += dto.isAllDay
            ? ` para el ${fecha} (todo el día).`
            : ` para el ${fecha}${hora}.`;

        if (dto.location) {
            replyMsg += `\nUbicación: ${dto.location}`;
        }
        if (dto.description) {
            replyMsg += `\nDescripción: ${dto.description}`;
        }

        return replyMsg;
    }

    // #endregion
}
// #endregion
