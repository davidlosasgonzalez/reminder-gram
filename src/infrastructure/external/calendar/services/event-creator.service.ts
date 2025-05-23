import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Event } from '@/domain/entities/event.entity';
import { GoogleCalendarConfig } from '@/infrastructure/external/calendar/config/google-calendar.config';
import { GoogleCalendarMapper } from '@/infrastructure/external/calendar/mappers/google-calendar.mapper';
import { BaseCalendarService } from './base-calendar.service';

/**
 * Event Creator Service
 *
 * Handles the creation of new calendar events
 */
@Injectable()
export class EventCreatorService extends BaseCalendarService {
    private readonly mapper: GoogleCalendarMapper;

    constructor(configService: ConfigService, config: GoogleCalendarConfig) {
        super(configService, config);
        this.mapper = new GoogleCalendarMapper();
    }

    /**
     * Creates a new event in Google Calendar
     * @param event - The event entity to be created
     * @returns The created event with Google Calendar ID
     */
    async createEvent(event: Event): Promise<Event> {
        const calendarEvent = this.mapper.toGoogleCalendarEvent(event);
        const response = await this.calendar.events.insert({
            calendarId: event.calendarId,
            requestBody: calendarEvent,
        });

        return this.mapper.toDomainEvent(response.data, event.calendarId);
    }
}
