/**
 * @file event-deleter.service
 * @description Service for deleting events in calendar providers.
 */

import { Injectable, Logger } from '@nestjs/common';
import { CalendarService } from '@/domain/services/calendar.service.interface';

/**
 * Service responsible for deleting events from the calendar provider.
 */
@Injectable()
export class EventDeleterService {
    private readonly logger = new Logger(EventDeleterService.name);

    constructor(private readonly calendarService: CalendarService) {}

    /**
     * Executes the deletion of an event.
     * @param eventId ID of the event to delete.
     */
    async execute(eventId: string): Promise<void> {
        this.logger.log(`Deleting event: ${eventId}`);
        return this.calendarService.deleteEvent(eventId);
    }
}
