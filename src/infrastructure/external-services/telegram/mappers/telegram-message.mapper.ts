/**
 * @file TelegramMessageMapper
 * @description Mapper for transforming Telegram messages to domain entities and vice versa.
 */

import { Logger } from '@nestjs/common';
import { Context } from 'telegraf';
import { Event } from '@/domain/entities/event.entity';
import { DateVO } from '@/domain/value-objects/date.vo';

/**
 * Parsed event data extracted from Telegram message.
 */
export interface ParsedEventData {
    title?: string;
    start?: DateVO;
    description?: string;
    location?: string;
}

// #region TelegramMessageMapper

/**
 * Mapper for Telegram message and event transformations.
 */
export class TelegramMessageMapper {
    private readonly logger = new Logger(TelegramMessageMapper.name);

    // #region parseEventMessage

    /**
     * Extracts event details from a Telegram message.
     * @param message The Telegram message text.
     * @returns Parsed event details or null if invalid format.
     */
    public parseEventMessage(message: string): ParsedEventData | null {
        this.logger.log('Parsing event message from Telegram text');
        const lines = message.split('\n');
        const event: ParsedEventData = {};

        for (const line of lines) {
            const [key, value] = line.split(':').map((s) => s.trim());
            if (!value) continue;

            switch (key.toLowerCase()) {
                case 'title':
                    event.title = value;
                    break;
                case 'date':
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        event.start = DateVO.create(date);
                    }
                    break;
                case 'time':
                    if (event.start) {
                        const [hours, minutes] = value.split(':').map(Number);
                        const date = event.start.value;
                        date.setHours(hours, minutes);
                        event.start = DateVO.create(date);
                    }
                    break;
                case 'description':
                    event.description = value;
                    break;
                case 'location':
                    event.location = value;
                    break;
            }
        }

        return Object.keys(event).length > 0 ? event : null;
    }

    // #endregion

    // #region formatEventMessage
    /**
     * Formats an event for Telegram message display.
     * @param event The event to format.
     * @returns Formatted message string.
     */
    public formatEventMessage(event: Event): string {
        this.logger.log('Formatting single event message for Telegram');
        return `
            📅 *${event.getTitle()}*
            📅 Date: ${event.getStart().value.toLocaleDateString()}
            ⏰ Time: ${event.getStart().value.toLocaleTimeString()}
            ${event.getDescription() ? `📝 Description: ${event.getDescription()}` : ''}
            ${event.getLocation() ? `📍 Location: ${event.getLocation()}` : ''}
        `.trim();
    }

    // #endregion

    // #region formatEventsList

    /**
     * Formats a list of events for Telegram message display.
     * @param events The events to format.
     * @returns Formatted message string.
     */
    public formatEventsList(events: Event[]): string {
        this.logger.log('Formatting event list message for Telegram');
        if (events.length === 0) {
            return 'No upcoming events found.';
        }

        return events
            .map((event) => this.formatEventMessage(event))
            .join('\n\n');
    }

    // #endregion

    // #region extractUserInfo

    /**
     * Extracts user information from Telegram context.
     * @param ctx The Telegram context.
     * @returns User information.
     */
    public extractUserInfo(ctx: Context): {
        userId: number;
        username?: string;
    } {
        this.logger.log('Extracting user info from Telegram context');
        const user = ctx.from;
        if (!user) {
            this.logger.error('No user information available');
            throw new Error('No user information available');
        }

        return {
            userId: user.id,
            username: user.username,
        };
    }

    // #endregion
}

// #endregion
