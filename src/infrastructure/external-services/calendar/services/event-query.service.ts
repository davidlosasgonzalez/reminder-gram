/**
 * @file event-query.service
 * @description Service for querying events in calendar providers.
 */

import { Injectable, Logger } from '@nestjs/common';
import { CalendarService } from '@/domain/services/calendar.service.interface';
import { Event } from '@/domain/entities/event.entity';

@Injectable()
export class EventQueryService {
    private readonly logger = new Logger(EventQueryService.name);

    constructor(private readonly calendarService: CalendarService) {}

    async execute(start: Date, end: Date): Promise<Event[]> {
        this.logger.log(
            `Querying events from ${start.toISOString()} to ${end.toISOString()}`,
        );
        return this.calendarService.findEvents(start, end);
    }
}
