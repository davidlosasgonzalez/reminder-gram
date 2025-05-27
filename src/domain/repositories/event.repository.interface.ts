/**
 * @file EventRepository
 * @description Interface for event repository operations.
 */

import { Event } from '@/domain/entities/event.entity';

export interface EventRepository {
    save(event: Event): Promise<Event>;
    findById(id: string): Promise<Event | null>;
    findEvents(start: Date, end: Date, userEmail: string): Promise<Event[]>;
    findOverlappingEvents(event: Event): Promise<Event[]>;
    delete(id: string): Promise<void>;
}
