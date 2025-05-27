import { Injectable, Inject } from '@nestjs/common';
import { ICalendarService } from '@/domain/interfaces/services/calendar.service.interface';
import { Event } from '@/domain/entities/event.entity';
import { CALENDAR_SERVICE } from './calendar.module';

/**
 * Adapter for calendar operations
 * This class adapts the calendar service to the application's needs
 */
@Injectable()
export class CalendarAdapter {
    constructor(
        @Inject(CALENDAR_SERVICE)
        private readonly calendarService: ICalendarService,
    ) {}

    /**
     * Creates a new event in the calendar
     * @param event The event to create
     * @returns The created event
     */
    async createEvent(event: Event): Promise<Event> {
        return this.calendarService.createEvent(event);
    }

    /**
     * Finds events within a date range
     * @param start Start date
     * @param end End date
     * @returns Array of events
     */
    async findEvents(start: Date, end: Date): Promise<Event[]> {
        return this.calendarService.findEvents(start, end);
    }

    /**
     * Updates an existing event
     * @param event The event to update
     * @returns The updated event
     */
    async updateEvent(event: Event): Promise<Event> {
        return this.calendarService.updateEvent(event);
    }

    /**
     * Deletes an event
     * @param eventId The ID of the event to delete
     */
    async deleteEvent(eventId: string): Promise<void> {
        return this.calendarService.deleteEvent(eventId);
    }
}
