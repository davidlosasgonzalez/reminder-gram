import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { IEventPort } from '@/application/ports/event.port';
import { CreateEventDto } from '@/application/dtos/events/create-event.dto';
import { Event } from '@/domain/entities/event.entity';
import { CreateEventUseCase } from '@/application/use-cases/events/create-event.use-case';
import { UpdateEventUseCase } from '@/application/use-cases/events/update-event.use-case';
import { IEventRepository } from '@/domain/interfaces/repositories/event.repository.interface';
import { EVENT_REPOSITORY } from '@/infrastructure/persistence/repositories/repository.tokens';

/**
 * Adapter for event operations
 *
 * This adapter implements the event port and coordinates:
 * - Event creation
 * - Event updates
 * - Event queries
 * - Event deletion
 */
@Injectable()
export class EventAdapter implements IEventPort {
    constructor(
        private readonly createEventUseCase: CreateEventUseCase,
        private readonly updateEventUseCase: UpdateEventUseCase,
        @Inject(EVENT_REPOSITORY)
        private readonly eventRepository: IEventRepository,
    ) {}

    /**
     * Creates a new event
     * @param dto The event creation data
     * @param calendarId The ID of the calendar
     * @returns The created event or throws ConflictException with details if overlapping
     */
    async createEvent(dto: CreateEventDto, calendarId: string): Promise<Event> {
        try {
            return await this.createEventUseCase.execute(dto, calendarId);
        } catch (error) {
            // Manejo explícito de solapamiento de eventos
            if (error instanceof ConflictException) {
                const response = (error as any).response;
                throw new ConflictException({
                    message: response?.message ?? 'Evento solapado',
                    details: response?.details ?? {},
                });
            }
            throw error;
        }
    }

    /**
     * Finds events within a date range
     * @param start Start date
     * @param end End date
     * @returns Array of events
     */
    async findEvents(start: Date, end: Date): Promise<Event[]> {
        return this.eventRepository.findEvents(start, end);
    }

    /**
     * Updates an existing event
     * @param id The ID of the event to update
     * @param dto The updated event data
     * @returns The updated event
     */
    async updateEvent(id: string, dto: CreateEventDto): Promise<Event> {
        return this.updateEventUseCase.execute(id, dto);
    }

    /**
     * Deletes an event
     * @param id The ID of the event to delete
     */
    async deleteEvent(id: string): Promise<void> {
        await this.eventRepository.delete(id);
    }
}
