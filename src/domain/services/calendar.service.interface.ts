/**
 * @file CalendarService
 * @description Interface for domain calendar service operations.
 */

import { Event } from '@/domain/entities/event.entity';

export interface CalendarService {
    createEvent(event: Event): Promise<Event>;
    findEvents(start: Date, end: Date): Promise<Event[]>;
    deleteEvent(eventId: string): Promise<void>;
}
