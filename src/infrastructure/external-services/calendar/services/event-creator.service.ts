/**
 * @file event-creator.service
 * @description Service for creating events in calendar providers.
 */

import { Injectable, Logger } from '@nestjs/common';
import { CalendarService } from '@/domain/services/calendar.service.interface';
import { Event } from '@/domain/entities/event.entity';

/**
 * Service responsible for creating events in the calendar provider.
 */
@Injectable()
export class EventCreatorService {
    private readonly logger = new Logger(EventCreatorService.name);

    constructor(private readonly calendarService: CalendarService) {}

    /**
     * Executes the creation of a new event.
     * @param event Event entity to be created.
     * @returns The created event.
     */
    async execute(event: Event): Promise<Event> {
        this.logger.log('Creating event');
        return this.calendarService.createEvent(event);
    }
}
