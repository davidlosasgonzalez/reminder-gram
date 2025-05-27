/**
 * @file calendar-persistence.module
 * @description Provides persistence layer for calendar events using Google Calendar.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventRepositoryImpl } from '@/infrastructure/persistence/repositories/event.repository';
import { GoogleCalendarService } from '@/infrastructure/external-services/calendar/services/google-calendar.service';
import { CALENDAR_SERVICE } from '@/infrastructure/external-services/calendar/calendar.tokens';
import { EVENT_PORT } from '@/infrastructure/persistence/repositories/repository.tokens';

/**
 * Calendar Persistence Module.
 * Provides persistence layer for calendar events using Google Calendar.
 */
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: EVENT_PORT,
            useClass: EventRepositoryImpl,
        },
        {
            provide: CALENDAR_SERVICE,
            useClass: GoogleCalendarService,
        },
    ],
    exports: [EVENT_PORT, CALENDAR_SERVICE],
})
export class CalendarPersistenceModule {}
