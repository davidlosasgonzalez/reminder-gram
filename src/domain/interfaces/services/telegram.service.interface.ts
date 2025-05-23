import { Context } from 'telegraf';
import { Event } from '@/domain/entities/event.entity';

/**
 * Interface for Telegram service operations
 *
 * This interface defines the contract for Telegram bot operations in the application.
 * It follows the Interface Segregation Principle by focusing on core messaging capabilities
 * and event handling.
 */
export interface ITelegramService {
    /**
     * Processes incoming messages from Telegram
     * @param ctx - The Telegram context containing the message
     */
    processMessage(ctx: Context): Promise<void>;

    /**
     * Handles event creation from a message
     * @param ctx - The Telegram context
     * @param eventData - The event data to create
     */
    handleEventCreation(ctx: Context, eventData: Partial<Event>): Promise<void>;
}
