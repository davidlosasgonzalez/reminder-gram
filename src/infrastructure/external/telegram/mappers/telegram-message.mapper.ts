import { Context } from 'telegraf';
import { Event } from '../../../../domain/entities/event.entity';
import { DateVO } from '../../../../domain/value-objects/date.vo';

/**
 * Telegram Message Mapper
 *
 * Handles the transformation of:
 * - Telegram messages to domain entities
 * - Domain entities to Telegram message formats
 */
export class TelegramMessageMapper {
    /**
     * Extracts event details from a Telegram message
     * @param message - The Telegram message text
     * @returns Parsed event details or null if invalid format
     */
    parseEventMessage(message: string): Partial<Event> | null {
        const lines = message.split('\n');
        const event: Partial<Event> = {};

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

    /**
     * Formats an event for Telegram message display
     * @param event - The event to format
     * @returns Formatted message string
     */
    formatEventMessage(event: Event): string {
        return `
📅 *${event.title}*
📅 Date: ${event.start.value.toLocaleDateString()}
⏰ Time: ${event.start.value.toLocaleTimeString()}
${event.description ? `📝 Description: ${event.description}` : ''}
${event.location ? `📍 Location: ${event.location}` : ''}
        `.trim();
    }

    /**
     * Formats a list of events for Telegram message display
     * @param events - The events to format
     * @returns Formatted message string
     */
    formatEventsList(events: Event[]): string {
        if (events.length === 0) {
            return 'No upcoming events found.';
        }

        return events
            .map((event) => this.formatEventMessage(event))
            .join('\n\n');
    }

    /**
     * Extracts user information from Telegram context
     * @param ctx - The Telegram context
     * @returns User information
     */
    extractUserInfo(ctx: Context): { userId: number; username?: string } {
        const user = ctx.from;
        if (!user) {
            throw new Error('No user information available');
        }

        return {
            userId: user.id,
            username: user.username,
        };
    }
}
