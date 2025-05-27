/**
 * @file BaseTelegramService
 * @description Provides common Telegram bot functionality and base configuration.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

// #region BaseTelegramService
/**
 * Base service for shared Telegram bot logic and initialization.
 */
@Injectable()
export class BaseTelegramService {
    protected readonly logger = new Logger(BaseTelegramService.name);
    protected readonly bot: Telegraf;
    protected readonly config: {
        token: string;
        webhookUrl?: string;
    };

    /**
     * Initializes the Telegram bot with base configuration.
     * @param configService The configuration service.
     */
    constructor(protected readonly configService: ConfigService) {
        const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
        if (!token) {
            this.logger.error('TELEGRAM_BOT_TOKEN is not configured');
            throw new Error('TELEGRAM_BOT_TOKEN is not configured');
        }

        this.config = {
            token,
            webhookUrl: this.configService.get<string>('TELEGRAM_WEBHOOK_URL'),
        };

        this.bot = new Telegraf(this.config.token);
        this.initializeBot();
    }

    // #region initializeBot

    /**
     * Initializes the Telegram bot with middleware and error handling.
     */
    protected initializeBot(): void {
        this.bot.use(async (ctx, next) => {
            try {
                await next();
            } catch (error) {
                this.logger.error('Telegram bot error', error);
            }
        });
    }
    // #endregion

    // #region sendMessage

    /**
     * Sends a message to a Telegram chat.
     * @param chatId The chat ID to send the message to.
     * @param text The message text.
     * @param options Telegram sendMessage options.
     */
    public async sendMessage(
        chatId: string,
        text: string,
        options?: Record<string, unknown>,
    ): Promise<void> {
        await this.bot.telegram.sendMessage(chatId, text, options);
    }
}
// #endregion
