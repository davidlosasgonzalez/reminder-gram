import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

/**
 * Base Telegram Service
 *
 * Provides common functionality and bot instance for Telegram services
 */
@Injectable()
export class BaseTelegramService {
    protected readonly bot: Telegraf;
    protected readonly config: {
        token: string;
        webhookUrl?: string;
    };

    constructor(protected readonly configService: ConfigService) {
        const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
        if (!token) {
            throw new Error('TELEGRAM_BOT_TOKEN is not configured');
        }

        this.config = {
            token,
            webhookUrl: this.configService.get<string>('TELEGRAM_WEBHOOK_URL'),
        };

        this.bot = new Telegraf(this.config.token);
        this.initializeBot();
    }

    /**
     * Initializes the Telegram bot with common middleware and error handling
     * @private
     */
    protected initializeBot(): void {
        // Add common middleware
        this.bot.use(async (ctx, next) => {
            try {
                await next();
            } catch (error) {
                console.error('Telegram bot error:', error);
                await ctx.reply(
                    'Sorry, something went wrong. Please try again later.',
                );
            }
        });
    }
}
