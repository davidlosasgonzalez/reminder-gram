/**
 * @file scheduler.module.ts
 * @description Scheduler module for registering and initializing scheduled tasks.
 */

import { Module } from '@nestjs/common';
import { SchedulerService } from '@/infrastructure/scheduler/scheduler.service';
import { TelegramModule } from '@/presentation/telegram/telegram.module';

/**
 * Module that encapsulates all background scheduled jobs for ReminderGram.
 */
@Module({
    imports: [TelegramModule],
    providers: [SchedulerService],
    exports: [SchedulerService],
})
export class SchedulerModule {}
