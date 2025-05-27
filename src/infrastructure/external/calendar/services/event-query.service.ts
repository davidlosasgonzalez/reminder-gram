import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Event } from '@/domain/entities/event.entity';
import { GoogleCalendarConfig } from '@/infrastructure/external/calendar/config/google-calendar.config';
import { GoogleCalendarMapper } from '@/infrastructure/external/calendar/mappers/google-calendar.mapper';
import { BaseCalendarService } from './base-calendar.service';

/**
 * Event Query Service
 *
 * Handles querying and retrieving calendar events
 */
@Injectable()
export class EventQueryService extends BaseCalendarService {
    private readonly mapper: GoogleCalendarMapper;

    constructor(configService: ConfigService, config: GoogleCalendarConfig) {
        super(configService, config);
        this.mapper = new GoogleCalendarMapper();
    }

    /**
     * Retrieves events within a specified date range
     * @param start - The start date of the range
     * @param end - The end date of the range
     * @returns Array of events within the date range
     */
    async findEvents(start: Date, end: Date): Promise<Event[]> {
        const response = await this.calendar.events.list({
            calendarId: this.config.defaultCalendarId,
            timeMin: start.toISOString(),
            timeMax: end.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: this.config.maxResults,
        });

        return (response.data.items || []).map((event) =>
            this.mapper.toDomainEvent(event, this.config.defaultCalendarId),
        );
    }
}
