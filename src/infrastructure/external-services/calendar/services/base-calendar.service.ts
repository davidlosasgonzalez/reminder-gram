/**
 * @file base-calendar.service
 * @description Base class for calendar service implementations.
 */

/**
 * Abstract base class for calendar service implementations.
 */
export abstract class BaseCalendarService {
    /**
     * Creates a new calendar event.
     * @param args Arguments required to create the event.
     */
    abstract createEvent(...args: any[]): Promise<any>;

    /**
     * Finds events within a specified range or based on specific criteria.
     * @param args Arguments for event searching.
     */
    abstract findEvents(...args: any[]): Promise<any>;

    /**
     * Deletes an event from the calendar.
     * @param args Arguments for event deletion.1
     */
    abstract deleteEvent(...args: any[]): Promise<any>;
}
