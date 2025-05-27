/**
 * @file TelegramService
 * @description Interface for domain telegram service operations.
 */

export interface TelegramService {
    sendMessage(chatId: string, message: string): Promise<void>;
    receiveMessage(): Promise<string>;
}
