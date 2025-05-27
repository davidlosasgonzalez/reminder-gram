import { Event } from '@/domain/entities/event.entity';
import { CreateEventDto } from '../dtos/events/create-event.dto';

/**
 * Port for event operations
 *
 * This port defines the contract for event operations in the application layer,
 * allowing different implementations while maintaining a consistent API.
 */
export interface IEventPort {
    /**
     * Creates a new event
     * @param dto The event creation data
     * @param calendarId The ID of the calendar
     * @returns The created event
     */
    createEvent(dto: CreateEventDto, calendarId: string): Promise<Event>;

    /**
     * Finds events within a date range
     * @param start Start date
     * @param end End date
     * @returns Array of events
     */
    findEvents(start: Date, end: Date): Promise<Event[]>;

    /**
     * Updates an existing event
     * @param id The ID of the event to update
     * @param dto The updated event data
     * @returns The updated event
     */
    updateEvent(id: string, dto: CreateEventDto): Promise<Event>;

    /**
     * Deletes an event
     * @param id The ID of the event to delete
     */
    deleteEvent(id: string): Promise<void>;
}
