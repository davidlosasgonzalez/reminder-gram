import { Injectable, Inject } from '@nestjs/common';
import { Event } from '../../../domain/entities/event.entity';
import { IEventRepository } from '../../../domain/interfaces/repositories/event.repository.interface';
import { ICalendarService } from '../../../domain/interfaces/services/calendar.service.interface';
import { CALENDAR_SERVICE } from '../../external/calendar/calendar.module';

/**
 * Concrete implementation of the EventRepository interface
 *
 * Handles event persistence operations using Google Calendar.
 */
@Injectable()
export class EventRepositoryImpl implements IEventRepository {
    constructor(
        @Inject(CALENDAR_SERVICE)
        private readonly calendarService: ICalendarService,
    ) {}

    async save(event: Event): Promise<Event> {
        return this.calendarService.createEvent(event);
    }

    async findEvents(start: Date, end: Date): Promise<Event[]> {
        return this.calendarService.findEvents(
            normalizeDate(start),
            normalizeDate(end),
        );
    }

    /**
     * Finds events that overlap with the given event (time interval overlap, same calendar).
     * @param event The event to check for overlaps
     * @returns Array of overlapping events
     */
    async findOverlappingEvents(event: Event): Promise<Event[]> {
        const start = normalizeDate(event.start);
        const end = normalizeDate(event.end);

        const events = await this.calendarService.findEvents(start, end);
        return events.filter(
            (e) =>
                e.id !== event.id &&
                e.calendarId === event.calendarId &&
                areIntervalsOverlapping(
                    start,
                    end,
                    normalizeDate(e.start),
                    normalizeDate(e.end),
                ),
        );
    }

    async update(event: Event): Promise<Event> {
        return this.calendarService.updateEvent(event);
    }

    async delete(id: string): Promise<void> {
        await this.calendarService.deleteEvent(id);
    }

    async findByCalendarId(calendarId: string): Promise<Event[]> {
        // TODO: Implement actual persistence
        return [];
    }

    async findByTitle(title: string): Promise<Event[]> {
        // TODO: Implement actual persistence
        return [];
    }
}

/**
 * Converts value to Date, supporting Date, string, and DateVO (with .value).
 */
function normalizeDate(d: any): Date {
    if (!d) throw new Error('Date value is missing');
    if (d instanceof Date) return d;
    if (typeof d === 'string') return new Date(d);
    if ('value' in d && d.value instanceof Date) return d.value;
    return new Date(d);
}

/**
 * Checks if two time intervals overlap.
 * @param start1 Start of first interval
 * @param end1 End of first interval
 * @param start2 Start of second interval
 * @param end2 End of second interval
 * @returns True if intervals overlap
 */
function areIntervalsOverlapping(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date,
): boolean {
    return start1 < end2 && end1 > start2;
}
