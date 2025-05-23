import { Context } from 'telegraf';
import { Event } from '@/domain/entities/event.entity';
import { CreateEventDto } from '@/application/dtos/events/create-event.dto';

/**
 * Interface defining the contract for Telegram bot operations
 *
 * This interface follows the Interface Segregation Principle by focusing
 * on the core messaging capabilities of the bot.
 */
export interface ITelegramService {
    /**
     * Initializes the Telegram bot
     * @throws {Error} If initialization fails
     */
    initialize(): Promise<void>;

    /**
     * Gracefully stops the bot
     */
    shutdown(): Promise<void>;

    /**
     * Sends a message to a specific chat
     * @param chatId - The chat ID to send the message to
     * @param message - The message to send
     */
    sendMessage(chatId: string, message: string): Promise<void>;

    /**
     * Handles the creation of an event from a message
     * @param ctx - The Telegram context
     * @param eventData - The event data
     * @returns The created event
     */
    handleEventCreation(
        ctx: Context,
        eventData: CreateEventDto,
    ): Promise<Event>;

    /**
     * Finds and returns events within a date range
     * @param start - The start date
     * @param end - The end date
     * @returns Array of events within the range
     */
    findEvents(start: Date, end: Date): Promise<Event[]>;
}
