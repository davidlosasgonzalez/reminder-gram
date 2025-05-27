import { DateVO } from '@/domain/value-objects/date.vo';

/**
 * Entity representing a calendar event in the system.
 *
 * This entity encapsulates all business rules and validation logic for calendar events.
 * It ensures that:
 * - Events have valid dates (start before end)
 * - Events have required fields (title, dates, calendar)
 * - Events can be updated while maintaining data integrity
 * - Events can be checked for overlaps and date ranges
 *
 * @class Event
 */
export class Event {
    //#region Properties
    private readonly _id: string;
    private _title: string;
    private _description?: string;
    private _start: DateVO;
    private _end: DateVO;
    private _isAllDay: boolean;
    private _location?: string;
    private _calendarId: string;
    //#endregion

    //#region Constructor
    /**
     * Creates a new Event instance
     * @param id - Unique identifier for the event
     * @param title - Title of the event
     * @param start - Start date and time
     * @param end - End date and time
     * @param isAllDay - Whether the event is an all-day event
     * @param calendarId - ID of the calendar this event belongs to
     * @param description - Optional description of the event
     * @param location - Optional location of the event
     * @throws Error if dates are invalid or required fields are missing
     */
    constructor(
        id: string,
        title: string,
        start: DateVO,
        end: DateVO,
        isAllDay: boolean,
        calendarId: string,
        description?: string,
        location?: string,
    ) {
        this.validateRequiredFields(id, title, calendarId);
        this.validateDates(start, end);

        this._id = id;
        this._title = title;
        this._start = start;
        this._end = end;
        this._isAllDay = isAllDay;
        this._calendarId = calendarId;
        this._description = description;
        this._location = location;
    }
    //#endregion

    //#region Getters
    /**
     * Gets the event's unique identifier
     * @returns The event ID
     */
    get id(): string {
        return this._id;
    }

    /**
     * Gets the event's title
     * @returns The event title
     */
    get title(): string {
        return this._title;
    }

    /**
     * Gets the event's description
     * @returns The event description or undefined
     */
    get description(): string | undefined {
        return this._description;
    }

    /**
     * Gets the event's start date and time
     * @returns The start date
     */
    get start(): DateVO {
        return this._start;
    }

    /**
     * Gets the event's end date and time
     * @returns The end date
     */
    get end(): DateVO {
        return this._end;
    }

    /**
     * Gets whether the event is an all-day event
     * @returns True if the event is all-day
     */
    get isAllDay(): boolean {
        return this._isAllDay;
    }

    /**
     * Gets the event's location
     * @returns The event location or undefined
     */
    get location(): string | undefined {
        return this._location;
    }

    /**
     * Gets the ID of the calendar this event belongs to
     * @returns The calendar ID
     */
    get calendarId(): string {
        return this._calendarId;
    }
    //#endregion

    //#region Setters
    /**
     * Sets the event's title
     * @param title - The new title for the event
     */
    set title(title: string) {
        if (!title?.trim()) {
            throw new Error('Event title is required');
        }
        this._title = title;
    }

    /**
     * Sets the event's description
     * @param description - The new description for the event
     */
    set description(description: string | undefined) {
        this._description = description;
    }

    /**
     * Sets the event's start date and time
     * @param start - The new start date for the event
     */
    set start(start: DateVO) {
        if (!start) {
            throw new Error('Start date is required');
        }
        this._start = start;
        this.validateDates(this._start, this._end);
    }

    /**
     * Sets the event's end date and time
     * @param end - The new end date for the event
     */
    set end(end: DateVO) {
        if (!end) {
            throw new Error('End date is required');
        }
        this._end = end;
        this.validateDates(this._start, this._end);
    }

    /**
     * Sets whether the event is an all-day event
     * @param isAllDay - True if the event is an all-day event
     */
    set isAllDay(isAllDay: boolean) {
        this._isAllDay = isAllDay;
    }

    /**
     * Sets the event's location
     * @param location - The new location for the event
     */
    set location(location: string | undefined) {
        this._location = location;
    }

    /**
     * Sets the ID of the calendar this event belongs to
     * @param calendarId - The new calendar ID for the event
     */
    set calendarId(calendarId: string) {
        this._calendarId = calendarId;
    }
    //#endregion

    //#region Business Logic
    /**
     * Updates the event with new data while maintaining data integrity
     * @param data - The data to update the event with
     * @throws Error if the update would result in invalid dates
     */
    update(data: {
        title?: string;
        start?: DateVO;
        end?: DateVO;
        isAllDay?: boolean;
        description?: string;
        location?: string;
    }): void {
        if (data.title) this.title = data.title;
        if (data.start) this.start = data.start;
        if (data.end) this.end = data.end;
        if (data.isAllDay !== undefined) this.isAllDay = data.isAllDay;
        if (data.description !== undefined) this.description = data.description;
        if (data.location !== undefined) this.location = data.location;
    }

    /**
     * Gets the duration of the event in milliseconds
     * @returns The duration in milliseconds
     */
    getDuration(): number {
        return this.end.value.getTime() - this.start.value.getTime();
    }

    /**
     * Checks if this event overlaps with another event
     * @param other - The other event to check for overlap
     * @returns True if the events overlap, false otherwise
     */
    overlapsWith(other: Event): boolean {
        return (
            this.start.value < other.end.value &&
            this.end.value > other.start.value
        );
    }
    //#endregion

    //#region Private Methods
    /**
     * Validates that all required fields are present and valid
     * @param id - The event ID
     * @param title - The event title
     * @param calendarId - The calendar ID
     * @throws Error if any required field is missing or invalid
     */
    private validateRequiredFields(
        id: string,
        title: string,
        calendarId: string,
    ): void {
        if (!id) throw new Error('Event ID is required');
        if (!title?.trim()) throw new Error('Event title is required');
        if (!calendarId) throw new Error('Calendar ID is required');
    }

    /**
     * Validates that the start date is before the end date
     * @param start - The start date
     * @param end - The end date
     * @throws Error if dates are invalid
     */
    private validateDates(start: DateVO, end: DateVO): void {
        if (!start || !end) {
            throw new Error('Start and end dates are required');
        }
        if (start.value >= end.value) {
            throw new Error('Start date must be before end date');
        }
    }
    //#endregion

    //#region Static Methods
    /**
     * Creates a new Event instance from a plain object
     */
    static create(props: {
        id: string;
        title: string;
        start: DateVO;
        end: DateVO;
        isAllDay: boolean;
        calendarId: string;
        description?: string;
        location?: string;
    }): Event {
        return new Event(
            props.id,
            props.title,
            props.start,
            props.end,
            props.isAllDay,
            props.calendarId,
            props.description,
            props.location,
        );
    }

    /**
     * Converts the event to a plain object
     */
    toJSON() {
        return {
            id: this._id,
            title: this._title,
            description: this._description,
            start: this._start.value,
            end: this._end.value,
            isAllDay: this._isAllDay,
            location: this._location,
            calendarId: this._calendarId,
        };
    }
    //#endregion
}
