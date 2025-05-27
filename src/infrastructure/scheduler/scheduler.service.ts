/**
 * @file scheduler.service.ts
 * @description Schedules periodic event listing and notification using node-cron.
 */

import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import cron from 'node-cron';
import { EventAdapter } from '@/application/adapters/event.adapter';
import { BaseTelegramService } from '@/infrastructure/external-services/telegram/services/base-telegram.service';
import { env } from '@/config/env/env.config';

/**
 * SchedulerService
 *
 * Periodically lists events from the primary calendar and sends notifications
 * via Telegram to the admin user, using the schedule configured in the environment variable CRON_TIME.
 */
@Injectable()
export class SchedulerService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SchedulerService.name);
    private readonly cronTime: string;
    private readonly adminChatId: string;

    /**
     * Constructs the scheduler with config, event adapter, and telegram service.
     * @param eventAdapter Adapter for event-related operations.
     * @param telegramService Service for sending messages via Telegram.
     */
    constructor(
        private readonly eventAdapter: EventAdapter,
        private readonly telegramService: BaseTelegramService,
    ) {
        const time = env.CRON_TIME;
        const [hour, minute] = time.split(':');
        this.cronTime = `${minute} ${hour} * * *`;
        this.adminChatId = env.TELEGRAM_ADMIN_CHAT_ID;
    }

    /**
     * Initializes the scheduler and sets up the cron job on app bootstrap.
     */
    onApplicationBootstrap(): void {
        this.logger.log(
            '[BOOT] SchedulerService onApplicationBootstrap called',
        );
        cron.schedule(this.cronTime, async () => {
            this.logger.log(
                `[CRON] Listing events for admin at ${this.cronTime}`,
            );
            try {
                const start = new Date();
                const end = new Date();
                end.setDate(start.getDate() + 1);

                const events = await this.eventAdapter.findEvents(start, end);
                let msg: string;

                if (!events.length) {
                    msg = 'No tienes eventos próximos.';
                } else {
                    msg = events
                        .map((ev) =>
                            [
                                `💠 ${ev.getTitle()}`,
                                `📆 ${ev.getStart().value.toLocaleDateString()}${ev.getIsAllDay() ? '' : ' ' + ev.getStart().value.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
                                `📍 ${ev.getLocation() || 'Sin ubicación especificada'}`,
                            ].join('\n'),
                        )
                        .join('\n\n');
                }

                await this.telegramService.sendMessage(this.adminChatId, msg, {
                    parse_mode: 'Markdown',
                });
            } catch (err) {
                this.logger.error(
                    '[CRON] Error sending scheduled event list',
                    err,
                );
            }
        });

        this.logger.log(
            `[CRON] Event listing scheduled at ${this.cronTime} every day.`,
        );
    }
}
