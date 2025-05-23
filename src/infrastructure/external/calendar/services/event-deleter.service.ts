import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleCalendarConfig } from '@/infrastructure/external/calendar/config/google-calendar.config';
import { BaseCalendarService } from './base-calendar.service';

/**
 * Event Deleter Service
 *
 * Handles deletion of calendar events
 */
@Injectable()
export class EventDeleterService extends BaseCalendarService {
    constructor(configService: ConfigService, config: GoogleCalendarConfig) {
        super(configService, config);
    }

    /**
     * Deletes an event from Google Calendar
     * @param eventId - The ID of the event to delete
     */
    async deleteEvent(eventId: string): Promise<void> {
        await this.calendar.events.delete({
            calendarId: this.config.defaultCalendarId,
            eventId,
        });
    }
}
