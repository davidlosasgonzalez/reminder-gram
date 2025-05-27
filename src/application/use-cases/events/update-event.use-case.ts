import {
    Injectable,
    Logger,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { Event } from '@/domain/entities/event.entity';
import { IEventRepository } from '@/domain/interfaces/repositories/event.repository.interface';
import { CreateEventDto } from '@/application/dtos/events/create-event.dto';

/**
 * Use case for updating an existing calendar event.
 *
 * Handles event update, validation, overlapping logic and persistence.
 * Permite múltiples eventos all-day solapados.
 * Permite coexistir eventos all-day y timed en la misma fecha.
 * Bloquea solapamiento solo entre eventos con hora real.
 */
@Injectable()
export class UpdateEventUseCase {
    private readonly logger = new Logger(UpdateEventUseCase.name);

    constructor(private readonly eventRepository: IEventRepository) {}

    /**
     * Executes the event update use case
     * @param id - The ID of the event to update
     * @param dto - The updated event data
     * @returns The updated event
     * @throws {NotFoundException} When the event is not found
     * @throws {Error} When event update fails
     */
    async execute(id: string, dto: CreateEventDto): Promise<Event> {
        try {
            this.logger.log(`Updating event: ${id}`);

            // Find existing event
            const existingEvent = await this.findEvent(id);

            // Update event entity
            const updatedEvent = this.updateEventEntity(existingEvent, dto);

            // Check for overlapping events
            await this.checkOverlappingEvents(updatedEvent, id);

            // Save updated event
            const savedEvent = await this.eventRepository.update(updatedEvent);

            this.logger.log(`Event updated successfully: ${savedEvent.id}`);

            return savedEvent;
        } catch (error) {
            this.logger.error('Failed to update event:', error);
            throw error;
        }
    }

    /**
     * Finds an existing event by ID
     * @param id - The ID of the event to find
     * @returns The found event
     * @throws {NotFoundException} When the event is not found
     */
    private async findEvent(id: string): Promise<Event> {
        const events = await this.eventRepository.findEvents(
            new Date(0),
            new Date(),
        );
        const event = events.find((e) => e.id === id);
        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
        return event;
    }

    /**
     * Updates an existing event entity with new data
     * @param existingEvent - The existing event
     * @param dto - The updated event data
     * @returns The updated event entity
     */
    private updateEventEntity(
        existingEvent: Event,
        dto: CreateEventDto,
    ): Event {
        existingEvent.update({
            title: dto.title,
            start: dto.start,
            end: dto.end,
            isAllDay: dto.isAllDay,
            description: dto.description,
            location: dto.location,
        });
        return existingEvent;
    }

    /**
     * Checks for overlapping events and handles them according to business rules.
     * Permite solapamiento de eventos all-day entre sí y entre all-day y timed.
     * Solo lanza conflicto si hay dos eventos con hora real que se solapan, o si hay un evento exactamente igual (ignorando el propio evento).
     * @param event - The event to check
     * @param selfId - The ID of the event being updated (para no autocompararse)
     * @throws {ConflictException} When there are overlapping timed events or duplicate exact event
     */
    private async checkOverlappingEvents(
        event: Event,
        selfId: string,
    ): Promise<void> {
        const overlappingEvents =
            await this.eventRepository.findOverlappingEvents(event);

        // Duplicado exacto (título, start y end), ignorando el propio evento
        const exactMatch = overlappingEvents.find(
            (e) =>
                e.id !== selfId &&
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
