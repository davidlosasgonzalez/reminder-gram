/**
 * @file calendar.module
 * @description Infrastructure module for calendar integration.
 */

import { Module } from '@nestjs/common';
import { CalendarAdapter } from './adapters/calendar.adapter';
import { GoogleCalendarService } from './services/google-calendar.service';
import { CALENDAR_SERVICE } from './calendar.tokens';

@Module({
    providers: [
        CalendarAdapter,
        {
            provide: CALENDAR_SERVICE,
            useClass: GoogleCalendarService,
        },
    ],
    exports: [CalendarAdapter],
})
export class CalendarModule {}
