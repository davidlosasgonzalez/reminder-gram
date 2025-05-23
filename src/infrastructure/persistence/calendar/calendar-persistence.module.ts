import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventRepositoryImpl } from '../repositories/event.repository';
import { GoogleCalendarService } from '@/infrastructure/external/calendar/google-calendar.service';
import { CALENDAR_SERVICE } from '../../external/calendar/calendar.module';
import { EVENT_REPOSITORY } from '../repositories/repository.tokens';

/**
 * Calendar Persistence Module
 *
 * Provides persistence layer for calendar events using Google Calendar
 */
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: EVENT_REPOSITORY,
            useClass: EventRepositoryImpl,
        },
        {
            provide: CALENDAR_SERVICE,
            useClass: GoogleCalendarService,
        },
    ],
    exports: [EVENT_REPOSITORY, CALENDAR_SERVICE],
})
export class CalendarPersistenceModule {}
