import { Event } from '@/domain/entities/event.entity';

/**
 * Interface for event repository operations
 *
 * This interface defines the contract for event repositories,
 * allowing different implementations (Google Calendar, database, etc.)
 * while maintaining a consistent API.
 */
export interface IEventRepository {
    /**
     * Saves an event
     * @param event The event to save
     * @returns The saved event
     */
    save(event: Event): Promise<Event>;

    /**
     * Finds events within a date range
     * @param start Start date
     * @param end End date
     * @returns Array of events
     */
    findEvents(start: Date, end: Date): Promise<Event[]>;

    /**
     * Finds events that overlap with the given event
     * @param event The event to check for overlaps
     * @returns Array of overlapping events
     */
    findOverlappingEvents(event: Event): Promise<Event[]>;

    /**
     * Updates an existing event
     * @param event The event to update
     * @returns The updated event
     */
    update(event: Event): Promise<Event>;

    /**
     * Deletes an event
     * @param id The ID of the event to delete
     */
    delete(id: string): Promise<void>;
}
