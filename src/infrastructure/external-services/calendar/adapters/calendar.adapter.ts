/**
 * @file calendar.adapter
 * @description Adapter for calendar operations, bridges domain services and infrastructure.
 */

import { Injectable, Inject } from '@nestjs/common';
import { CalendarService } from '@/domain/services/calendar.service.interface';
import { Event } from '@/domain/entities/event.entity';
import { CALENDAR_SERVICE } from '../calendar.tokens';

@Injectable()
export class CalendarAdapter {
    constructor(
        @Inject(CALENDAR_SERVICE)
        private readonly calendarService: CalendarService,
    ) {}

    /**
     * Creates a new event in the calendar.
     * @param event The event to create.
     * @returns The created event.
     */
    async createEvent(event: Event): Promise<Event> {
        return this.calendarService.createEvent(event);
    }

    /**
     * Finds events within a date range.
     * @param start Start date.
     * @param end End date.
     * @returns Array of events.
     */
    async findEvents(start: Date, end: Date): Promise<Event[]> {
        return this.calendarService.findEvents(start, end);
    }

    /**
     * Deletes an event.
     * @param eventId The ID of the event to delete.
     */
    async deleteEvent(eventId: string): Promise<void> {
        return this.calendarService.deleteEvent(eventId);
    }
}
