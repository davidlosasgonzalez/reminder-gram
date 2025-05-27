import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Event } from '@/domain/entities/event.entity';
import { GoogleCalendarConfig } from '@/infrastructure/external/calendar/config/google-calendar.config';
import { GoogleCalendarMapper } from '@/infrastructure/external/calendar/mappers/google-calendar.mapper';
import { BaseCalendarService } from './base-calendar.service';

/**
 * Event Updater Service
 *
 * Handles updating existing calendar events
 */
@Injectable()
export class EventUpdaterService extends BaseCalendarService {
    private readonly mapper: GoogleCalendarMapper;

    constructor(configService: ConfigService, config: GoogleCalendarConfig) {
        super(configService, config);
        this.mapper = new GoogleCalendarMapper();
    }

    /**
     * Updates an existing event in Google Calendar
     * @param event - The event entity with updated information
     * @returns The updated event
     */
    async updateEvent(event: Event): Promise<Event> {
        const calendarEvent = this.mapper.toGoogleCalendarEvent(event);
        const response = await this.calendar.events.update({
            calendarId: event.calendarId,
            eventId: event.id,
            requestBody: calendarEvent,
        });

        return this.mapper.toDomainEvent(response.data, event.calendarId);
    }
}
