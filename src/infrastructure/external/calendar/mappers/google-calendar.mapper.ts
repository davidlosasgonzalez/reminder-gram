import { Event } from '@/domain/entities/event.entity';
import { DateVO } from '@/domain/value-objects/date.vo';
import { calendar_v3 } from 'googleapis';

/**
 * Mapper for converting between Google Calendar events and domain events
 */
export class GoogleCalendarMapper {
    /**
     * Converts a Google Calendar event to a domain Event entity
     *
     * @param calendarEvent - The Google Calendar event data
     * @param calendarId - The ID of the calendar containing the event
     */
    toDomainEvent(
        calendarEvent: calendar_v3.Schema$Event,
        calendarId: string,
    ): Event {
        const start = calendarEvent.start?.dateTime
            ? new Date(calendarEvent.start.dateTime)
            : calendarEvent.start?.date
              ? new Date(calendarEvent.start.date)
              : new Date();

        const end = calendarEvent.end?.dateTime
            ? new Date(calendarEvent.end.dateTime)
            : calendarEvent.end?.date
              ? new Date(calendarEvent.end.date)
              : new Date();

        return Event.create({
            id: calendarEvent.id || '',
            title: calendarEvent.summary || '',
            description: calendarEvent.description || '',
            start: DateVO.create(start),
            end: DateVO.create(end),
            isAllDay: !!calendarEvent.start?.date,
            location: calendarEvent.location || '',
            calendarId,
        });
    }

    /**
     * Converts a domain Event entity to a Google Calendar event format
     */
    toGoogleCalendarEvent(event: Event): calendar_v3.Schema$Event {
        // Helper para robustez máxima
        const toDate = (d: any): Date => {
            if (!d) throw new Error('Missing date value');
            if (d instanceof Date) return d;
            if (typeof d === 'string') return new Date(d);
            if (d.value instanceof Date) return d.value;
            return new Date(d);
        };

        if (event.isAllDay) {
            // All-day events: Google espera solo YYYY-MM-DD, end es exclusivo (+1)
            const startDate = toDate(event.start);
            const endDate = toDate(event.end);
            const formatDateOnly = (date: Date) =>
                date.toISOString().split('T')[0];
            return {
                summary: event.title,
                description: event.description,
                start: {
                    date: formatDateOnly(startDate),
                    timeZone: 'UTC',
                },
                end: {
                    date: formatDateOnly(
                        new Date(endDate.getTime() + 24 * 60 * 60 * 1000),
                    ),
                    timeZone: 'UTC',
                },
                location: event.location,
            };
        } else {
            return {
                summary: event.title,
                description: event.description,
                start: {
                    dateTime: toDate(event.start).toISOString(),
                    timeZone: 'UTC',
                },
                end: {
                    dateTime: toDate(event.end).toISOString(),
                    timeZone: 'UTC',
                },
                location: event.location,
            };
        }
    }
}
