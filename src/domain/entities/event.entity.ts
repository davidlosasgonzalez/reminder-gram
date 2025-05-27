/**
 * @file Event
 * @description Event domain entity.
 */

import { DateVO } from '@/domain/value-objects/date.vo';

// #region Event
export class Event {
    public readonly id: string;
    private title: string;
    private description?: string;
    private start: DateVO;
    private end: DateVO;
    private isAllDay: boolean;
    private location?: string;
    private calendarId: string;

    /**
     * Creates a new Event instance.
     * @param id Unique identifier for the event.
     * @param title Title of the event.
     * @param start Start date and time.
     * @param end End date and time.
     * @param isAllDay Whether the event is all-day.
     * @param calendarId ID of the calendar.
     * @param description Optional description.
     * @param location Optional location.
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
        this.id = id;
        this.title = title;
        this.start = start;
        this.end = end;
        this.isAllDay = isAllDay;
        this.calendarId = calendarId;
        this.description = description;
        this.location = location;
    }

    //#region Getters
    getId(): string {
        return this.id;
    }

    getTitle(): string {
        return this.title;
    }
    getDescription(): string | undefined {
        return this.description;
    }
    getStart(): DateVO {
        return this.start;
    }
    getEnd(): DateVO {
        return this.end;
    }
    getIsAllDay(): boolean {
        return this.isAllDay;
    }
    getLocation(): string | undefined {
        return this.location;
    }
    getCalendarId(): string {
        return this.calendarId;
    }
    //#endregion

    //#region Setters
    setTitle(title: string): void {
        if (!title?.trim()) {
            throw new Error('Event title is required');
        }
        this.title = title;
    }
    setDescription(description: string | undefined): void {
        this.description = description;
    }
    setStart(start: DateVO): void {
        if (!start) {
            throw new Error('Start date is required');
        }
        this.start = start;
        this.validateDates(this.start, this.end);
    }
    setEnd(end: DateVO): void {
        if (!end) {
            throw new Error('End date is required');
        }
        this.end = end;
        this.validateDates(this.start, this.end);
    }
    setIsAllDay(isAllDay: boolean): void {
        this.isAllDay = isAllDay;
    }
    setLocation(location: string | undefined): void {
        this.location = location;
    }
    setCalendarId(calendarId: string): void {
        this.calendarId = calendarId;
    }
    //#endregion

    //#region BusinessLogic
    update(data: {
        title?: string;
        start?: DateVO;
        end?: DateVO;
        isAllDay?: boolean;
        description?: string;
        location?: string;
    }): void {
        if (data.title) this.setTitle(data.title);
        if (data.start) this.setStart(data.start);
        if (data.end) this.setEnd(data.end);
        if (data.isAllDay !== undefined) this.setIsAllDay(data.isAllDay);
        if (data.description !== undefined)
            this.setDescription(data.description);
        if (data.location !== undefined) this.setLocation(data.location);
    }

    getDuration(): number {
        return this.end.value.getTime() - this.start.value.getTime();
    }

    overlapsWith(other: Event): boolean {
        return (
            this.start.value < other.end.value &&
            this.end.value > other.start.value
        );
    }
    //#endregion

    //#region PrivateMethods
    private validateRequiredFields(
        id: string,
        title: string,
        calendarId: string,
    ): void {
        if (!id) throw new Error('Event ID is required');
        if (!title?.trim()) throw new Error('Event title is required');
        if (!calendarId) throw new Error('Calendar ID is required');
    }

    private validateDates(start: DateVO, end: DateVO): void {
        if (!start || !end) {
            throw new Error('Start and end dates are required');
        }
        if (start.value >= end.value) {
            throw new Error('Start date must be before end date');
        }
    }
    //#endregion

    //#region StaticMethods
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

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            start: this.start.value,
            end: this.end.value,
            isAllDay: this.isAllDay,
            location: this.location,
            calendarId: this.calendarId,
        };
    }
    //#endregion
}
// #endregion
