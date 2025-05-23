import { Event } from '@/domain/entities/event.entity';

/**
 * Interface for calendar service operations
 *
 * This interface defines the contract for calendar services,
 * allowing different implementations (Google Calendar, Outlook, etc.)
 * while maintaining a consistent API.
 */
export interface ICalendarService {
    /**
     * Creates a new event in the calendar
     * @param event The event to create
     * @returns The created event
     */
    createEvent(event: Event): Promise<Event>;

    /**
     * Finds events within a date range
     * @param start Start date
     * @param end End date
     * @returns Array of events
     */
    findEvents(start: Date, end: Date): Promise<Event[]>;

    /**
     * Updates an existing event
     * @param event The event to update
     * @returns The updated event
     */
    updateEvent(event: Event): Promise<Event>;

    /**
     * Deletes an event
     * @param id The ID of the event to delete
     */
    deleteEvent(id: string): Promise<void>;
}
