/**
 * @file google-calendar.mapper
 * @description Maps Google Calendar event objects to domain Event entities.
 */

import { Event } from '@/domain/entities/event.entity';
import { DateVO } from '@/domain/value-objects/date.vo';

/**
 * Mapper for converting Google Calendar event objects to domain entities.
 */
export class GoogleCalendarMapper {
    /**
     * Maps a Google Calendar API event object to a domain Event entity.
     * @param calendarEvent The raw event object from Google Calendar API.
     * @param calendarId Optional calendar ID to associate with the domain event.
     * @returns Domain Event entity.
     */
    static toDomain(calendarEvent: any, calendarId?: string): Event {
        return Event.create({
            id: calendarEvent.id,
            title: calendarEvent.summary,
            description: calendarEvent.description,
            start: DateVO.create(
                new Date(
                    calendarEvent.start?.dateTime ?? calendarEvent.start?.date,
                ),
            ),
            end: DateVO.create(
                new Date(
                    calendarEvent.end?.dateTime ?? calendarEvent.end?.date,
                ),
            ),
            isAllDay: !!calendarEvent.start?.date,
            location: calendarEvent.location,
            calendarId: calendarId || 'primary',
        });
    }
}
