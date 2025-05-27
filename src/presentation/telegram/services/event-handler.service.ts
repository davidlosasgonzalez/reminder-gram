import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context } from 'telegraf';
import { BaseTelegramService } from '@/infrastructure/external/telegram/services/base-telegram.service';
import { TelegramMessageMapper } from '@/infrastructure/external/telegram/mappers/telegram-message.mapper';
import { Event } from '@/domain/entities/event.entity';
import { ICalendarService } from '@/domain/interfaces/services/calendar.service.interface';
import { CALENDAR_SERVICE } from '@/infrastructure/external/calendar/calendar.tokens';
import { DateVO } from '@/domain/value-objects/date.vo';
import { v4 as uuid } from 'uuid';
import { IEventRepository } from '@/domain/interfaces/repositories/event.repository.interface';

/**
 * Event Handler Service
 *
 * Handles calendar event-related commands in the Telegram bot
 */
@Injectable()
export class EventHandlerService extends BaseTelegramService {
    private readonly mapper: TelegramMessageMapper;

    constructor(
        configService: ConfigService,
        @Inject(CALENDAR_SERVICE)
        private readonly calendarService: ICalendarService,
        @Inject('EVENT_REPOSITORY')
        private readonly eventRepository: IEventRepository,
    ) {
        super(configService);
        this.mapper = new TelegramMessageMapper();
        this.setupEventHandlers();
    }

    /**
     * Sets up event-related command handlers
     * @private
     */
    private setupEventHandlers(): void {
        this.bot.command('events', async (ctx) => {
            await this.handleEventsCommand(ctx);
        });

        this.bot.command('create', async (ctx) => {
            await this.handleCreateCommand(ctx);
        });
    }

    /**
     * Handles the /events command
     * @param ctx - The Telegram context
     * @private
     */
    private async handleEventsCommand(ctx: Context): Promise<void> {
        const now = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 30);

        const events = await this.eventRepository.findEvents(now, end);
        const message = this.formatEventsList(events);
        await ctx.reply(message);
    }

    /**
     * Handles the /create command
     * @param ctx - The Telegram context
     * @private
     */
    private async handleCreateCommand(ctx: Context): Promise<void> {
        const message = `
To create a new event, use the following format:
/title [title]
/date [date in DD/MM/YYYY format]
/time [time in HH:mm format]
/location [location]

Example:
/title Team Meeting
/date 25/12/2024
/time 15:30
/location Conference Room
`;
        await ctx.reply(message);
    }

    /**
     * Handles event creation from a message
     * @param ctx - The Telegram context
     * @param eventData - Partial event data
     * @returns Promise that resolves when the message is handled
     */
    async handleEventCreation(
        ctx: Context,
        eventData: Partial<Event>,
    ): Promise<void> {
        try {
            if (!eventData.title || !eventData.start || !eventData.end) {
                await ctx.reply('Missing required fields to create the event.');
                return;
            }

            const event = Event.create({
                id: uuid(),
                title: eventData.title,
                start: eventData.start,
                end: eventData.end,
                isAllDay: false,
                calendarId: eventData.calendarId || 'primary',
                location: eventData.location,
            });

            const savedEvent = await this.eventRepository.save(event);
            await ctx.reply(
                `Event created successfully:\n${this.formatEvent(savedEvent)}`,
            );
        } catch (error) {
            await ctx.reply('Failed to create the event. Please try again.');
        }
    }

    private formatEventsList(events: Event[]): string {
        if (events.length === 0) {
            return 'No upcoming events.';
        }

        return events.map((event) => this.formatEvent(event)).join('\n\n');
    }

    private formatEvent(event: Event): string {
        return `
📅 ${event.title}
📆 ${event.start.value.toLocaleDateString()}
⏰ ${event.start.value.toLocaleTimeString()}
📍 ${event.location || 'No location specified'}
`;
    }
}
