import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleCalendarConfig } from './config/google-calendar.config';
import { EventCreatorService } from './services/event-creator.service';
import { EventQueryService } from './services/event-query.service';
import { EventUpdaterService } from './services/event-updater.service';
import { EventDeleterService } from './services/event-deleter.service';

// Inject token
export const CALENDAR_SERVICE = 'CALENDAR_SERVICE';

/**
 * Module for calendar service implementations
 *
 * This module is part of the infrastructure layer and provides:
 * - Implementation of calendar service using Google Calendar API
 * - Configuration for calendar service providers
 */
@Module({
    imports: [ConfigModule],
    providers: [
        GoogleCalendarConfig,
        EventCreatorService,
        EventQueryService,
        EventUpdaterService,
        EventDeleterService,
        {
            provide: CALENDAR_SERVICE,
            useFactory: (
                creator: EventCreatorService,
                query: EventQueryService,
                updater: EventUpdaterService,
                deleter: EventDeleterService,
            ) => ({
                createEvent: (event) => creator.createEvent(event),
                findEvents: (start, end) => query.findEvents(start, end),
                updateEvent: (event) => updater.updateEvent(event),
                deleteEvent: (eventId) => deleter.deleteEvent(eventId),
            }),
            inject: [
                EventCreatorService,
                EventQueryService,
                EventUpdaterService,
                EventDeleterService,
            ],
        },
    ],
    exports: [CALENDAR_SERVICE],
})
export class CalendarModule {}
