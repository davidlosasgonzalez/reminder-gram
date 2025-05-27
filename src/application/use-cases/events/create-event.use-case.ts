/**
 * @file create-event.use-case
 * @description Use case for creating a new event.
 */

import { Injectable } from '@nestjs/common';
import { Event } from '@/domain/entities/event.entity';
import { EventRepository } from '@/domain/repositories/event.repository.interface';
import { CreateEventDto } from '@/application/dtos/events/create-event.dto';

@Injectable()
export class CreateEventUseCase {
    constructor(private readonly eventRepository: EventRepository) {}

    async execute(dto: CreateEventDto): Promise<Event> {
        const event = Event.create({
            id: crypto.randomUUID(),
            title: dto.title,
            start: dto.start,
            end: dto.end,
            isAllDay: dto.isAllDay,
            calendarId: dto.calendarId,
            description: dto.description,
            location: dto.location,
        });
        return this.eventRepository.save(event);
    }
}
