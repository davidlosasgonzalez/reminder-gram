/**
 * @file app.module
 * @description Main application module. Bootstraps all infrastructure and presentation modules.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CalendarModule } from '@/infrastructure/external-services/calendar/calendar.module';
import { TelegramModule } from '@/presentation/telegram/telegram.module';
import { SchedulerModule } from '@/infrastructure/scheduler/scheduler.module';
import { SchedulerService } from '@/infrastructure/scheduler/scheduler.service';

/**
 * Main application module that imports global config, infrastructure and presentation modules.
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        CalendarModule,
        TelegramModule,
        SchedulerModule,
    ],
})
export class AppModule {
    // Force SchedulerService instantiation to ensure cron starts
    constructor(private readonly _: SchedulerService) {}
}
