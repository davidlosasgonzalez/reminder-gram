/**
 * @file event.repository
 * @description Event repository implementation for EventPort contract (uses CalendarService).
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { Event } from '@/domain/entities/event.entity';
import { CreateEventDto } from '@/application/dtos/events/create-event.dto';
import { EventPort } from '@/application/ports/event.port';
import { CalendarService } from '@/domain/services/calendar.service.interface';
import { CALENDAR_SERVICE } from '@/infrastructure/external-services/calendar/calendar.tokens';
import { EventPayloadMapper } from '@/application/adapters/event-payload-mapper';

// #region EventRepositoryImpl
/**
 * EventRepositoryImpl for EventPort contract using CalendarService as backend.
 */
@Injectable()
export class EventRepositoryImpl implements EventPort {
    private readonly logger = new Logger(EventRepositoryImpl.name);

    constructor(
        @Inject(CALENDAR_SERVICE)
        private readonly calendarService: CalendarService,
    ) {}

    // #region createEvent

    /**
     * Creates a new event using the calendar service.
     */
    async createEvent(dto: CreateEventDto, calendarId: string): Promise<Event> {
        this.logger.log('Creating event via CalendarService');
        const event = EventPayloadMapper.toEntity(dto);
        return this.calendarService.createEvent(event);
    }

    // #endregion

    // #region findById

    /**
     * Finds a single event by its ID.
     */
    async findById(id: string): Promise<Event | null> {
        this.logger.log(`Finding event by id: ${id}`);
        // TODO: Implement real lookup using CalendarService if possible
        return null;
    }

    // #endregion

    // #region findEvents

    /**
     * Finds events within a date range.
     */
    async findEvents(start: Date, end: Date): Promise<Event[]> {
        this.logger.log(
            `Finding events from ${start.toISOString()} to ${end.toISOString()}`,
        );
        return this.calendarService.findEvents(start, end);
    }

    // #endregion

    // #region deleteEvent

    /**
     * Deletes an event.
     */
    async deleteEvent(id: string): Promise<void> {
        this.logger.log(`Deleting event ${id}`);
        await this.calendarService.deleteEvent(id);
    }

    // #endregion
}

// #endregion
