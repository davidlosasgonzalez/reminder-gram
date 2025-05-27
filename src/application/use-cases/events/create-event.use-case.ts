import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Event } from '@/domain/entities/event.entity';
import { IEventRepository } from '@/domain/interfaces/repositories/event.repository.interface';
import { CreateEventDto } from '@/application/dtos/events/create-event.dto';
import { DateVO } from '@/domain/value-objects/date.vo';

/**
 * Use case for creating a new calendar event.
 *
 * Handles event creation, validation, and overlapping logic for both all-day and timed events.
 * Permite múltiples eventos all-day solapados.
 * Permite coexistir eventos all-day y timed en la misma fecha.
 * Bloquea solapamiento solo entre eventos con hora real.
 */
@Injectable()
export class CreateEventUseCase {
    private readonly logger = new Logger(CreateEventUseCase.name);

    constructor(private readonly eventRepository: IEventRepository) {}

    /**
     * Executes the event creation use case.
     * @param dto - The event creation data.
     * @param calendarId - The ID of the calendar.
     * @returns The created event.
     * @throws {ConflictException} When there are overlapping timed events or duplicate exact events.
     */
    async execute(dto: CreateEventDto, calendarId: string): Promise<Event> {
        try {
            this.logger.log(`Creating event: ${dto.title}`);

            // Validate DTO
            await this.validateDto(dto);

            // Create event entity
            const event = this.createEventEntity(dto, calendarId);

            // Check for overlapping events
            await this.checkOverlappingEvents(event);

            // Save event
            const savedEvent = await this.eventRepository.save(event);

            this.logger.log(`Event created successfully: ${savedEvent.id}`);

            return savedEvent;
        } catch (error) {
            this.logger.error('Failed to create event:', error);
            throw error;
        }
    }

    /**
     * Validates the event creation DTO.
     * @param dto - The event creation data.
     */
    private async validateDto(dto: CreateEventDto): Promise<void> {
        const getDateValue = (d: any): Date =>
            d instanceof Date
                ? d
                : d.value instanceof Date
                  ? d.value
                  : new Date(d);

        const start = getDateValue(dto.start);
        const end = getDateValue(dto.end);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Invalid date format in event payload');
        }

        if (start >= end) {
            throw new Error('Start date must be before end date');
        }

        if (!dto.title?.trim()) {
            throw new Error('Event title is required');
        }

        if (dto.description && dto.description.length > 1000) {
            throw new Error('Description must be less than 1000 characters');
        }
    }

    /**
     * Creates a new event entity from the DTO.
     * @param dto - The event creation data.
     * @param calendarId - The ID of the calendar.
     * @returns The created event entity.
     */
    private createEventEntity(dto: CreateEventDto, calendarId: string): Event {
        const startVO = dto.start;
        let endVO = dto.end;

        if (!endVO) {
            // Default duration: 5 min (if not all-day)
            const startDate = startVO.value;
            const endDate = new Date(startDate.getTime() + 5 * 60 * 1000);
            endVO = DateVO.create(endDate);
        }

        return Event.create({
            id: uuid(),
            title: dto.title,
            start: startVO,
            end: endVO,
            isAllDay: dto.isAllDay ?? false,
            calendarId,
            description: dto.description,
            location: dto.location,
        });
    }

    /**
     * Checks for overlapping timed events and exact duplicates.
     * Permite solapamiento de eventos all-day entre sí y entre all-day y timed.
     * Solo lanza conflicto si hay dos eventos con hora real que se solapan, o si hay un evento exactamente igual.
     * @param event - The event to check.
     * @throws {ConflictException} When there are overlapping timed events or duplicate exact event.
     */
    private async checkOverlappingEvents(event: Event): Promise<void> {
        const overlappingEvents =
            await this.eventRepository.findOverlappingEvents(event);

        // Duplicado exacto (título, start y end)
        const exactMatch = overlappingEvents.find(
            (e) =>
                e.title === event.title &&
                e.start.equals(event.start) &&
                e.end.equals(event.end),
        );
        if (exactMatch) {
            this.logger.warn(
                `[WARN] Intento de crear un evento duplicado: ${event.title} (${event.start.toString()} - ${event.end.toString()})`,
            );
            throw new ConflictException({
                message: `Ya existe un evento idéntico: '${event.title}' para el día ${event.start.value.toLocaleDateString()} de ${event.start.value.toLocaleTimeString()} a ${event.end.value.toLocaleTimeString()}.`,
                details: {
                    duplicateEvent: {
                        id: exactMatch.id,
                        title: exactMatch.title,
                        start: exactMatch.start.toString(),
                        end: exactMatch.end.toString(),
                    },
                },
            });
        }

        // Solo hay conflicto si AMBOS eventos tienen hora (no all-day)
        const timedConflicts = overlappingEvents.filter((ev) => {
            if (event.isAllDay || ev.isAllDay) return false;
            return (
                event.start.value < ev.end.value &&
                event.end.value > ev.start.value
            );
        });

        if (timedConflicts.length > 0) {
            this.logger.warn(
                `Found ${timedConflicts.length} overlapping timed events for: ${event.title}`,
            );

            const overlappingDetails = timedConflicts.map((e) => ({
                id: e.id,
                title: e.title,
                start: e.start.toString(),
                end: e.end.toString(),
            }));

            throw new ConflictException({
                message: 'Event overlaps with existing events',
                details: {
                    overlappingEvents: overlappingDetails,
                },
            });
        }
    }
}
