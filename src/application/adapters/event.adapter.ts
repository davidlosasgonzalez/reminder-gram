/**
 * @file event.adapter
 * @description Adapter to transform between domain Event and DTOs, and delegate use-cases via application ports.
 */

import { Injectable, Inject } from '@nestjs/common';
import { Event } from '@/domain/entities/event.entity';
import { EventResponseDto } from '@/application/dtos/events/event-response.dto';
import { CreateEventDto } from '@/application/dtos/events/create-event.dto';
import { EventPort } from '@/application/ports/event.port';
import { EVENT_PORT } from '@/infrastructure/persistence/repositories/repository.tokens';

@Injectable()
export class EventAdapter {
    /**
     * Constructor with injected event port for application layer operations.
     * @param eventPort Application event port interface.
     */
    constructor(
        @Inject(EVENT_PORT)
        private readonly eventPort: EventPort,
    ) {}

    // #region toResponseDto

    /**
     * Transforms a domain Event entity to EventResponseDto.
     * @param event The domain event entity.
     * @returns EventResponseDto
     */
    static toResponseDto(event: Event): EventResponseDto {
        return {
            id: event.getId(),
            title: event.getTitle(),
            description: event.getDescription(),
            start: event.getStart(),
            end: event.getEnd(),
            location: event.getLocation(),
            calendarId: event.getCalendarId(),
        };
    }

    // #endregion

    // #region createEvent

    /**
     * Creates a new event via the application port.
     * @param dto Event creation DTO.
     * @param calendarId Calendar ID for the event.
     * @returns The created event.
     */
    async createEvent(dto: CreateEventDto, calendarId: string): Promise<Event> {
        return this.eventPort.createEvent(dto, calendarId);
    }

    // #endregion

    // #region findEvents

    /**
     * Finds upcoming events via the application port.
     * @param start Start date.
     * @param end End date.
     * @returns Array of events.
     */
    async findEvents(start: Date, end: Date): Promise<Event[]> {
        return this.eventPort.findEvents(start, end);
    }

    // #endregion

    // #region deleteEvent

    /**
     * Deletes an event by ID via the application port.
     * @param eventId The ID of the event to delete.
     */
    async deleteEvent(eventId: string): Promise<void> {
        return this.eventPort.deleteEvent(eventId);
    }

    // #endregion
}
