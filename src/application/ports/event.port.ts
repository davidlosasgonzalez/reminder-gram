/**
 * @file event.port
 * @description Port for event operations in the application layer.
 */

import { Event } from '@/domain/entities/event.entity';
import { CreateEventDto } from '../dtos/events/create-event.dto';

export interface EventPort {
    /**
     * Creates a new event.
     * @param dto The event creation data.
     * @param calendarId The ID of the calendar.
     * @returns The created event.
     */
    createEvent(dto: CreateEventDto, calendarId: string): Promise<Event>;

    /**
     * Finds a single event by its ID.
     * @param id The ID of the event to find.
     * @returns The event if found, or null otherwise.
     */
    findById(id: string): Promise<Event | null>;

    /**
     * Finds events within a date range.
     * @param start Start date.
     * @param end End date.
     * @returns Array of events.
     */
    findEvents(start: Date, end: Date): Promise<Event[]>;

    /**
     * Deletes an event.
     * @param id The ID of the event to delete.
     */
    deleteEvent(id: string): Promise<void>;
}
