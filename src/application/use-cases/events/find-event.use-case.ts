/**
 * @file find-event.use-case
 * @description Use case for finding a single event by ID.
 */

import { Injectable } from '@nestjs/common';
import { EventRepository } from '@/domain/repositories/event.repository.interface';
import { FindEventDto } from '@/application/dtos/events/find-event.dto';
import { Event } from '@/domain/entities/event.entity';

@Injectable()
export class FindEventUseCase {
    constructor(private readonly eventRepository: EventRepository) {}

    async execute(dto: FindEventDto): Promise<Event | null> {
        return this.eventRepository.findById(dto.id);
    }
}
