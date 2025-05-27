/**
 * @fileoverview Unit tests for EventDeleterService.
 * @see /tests/infrastructure/external-services/calendar/services/event-deleter.service.spec.ts
 */

import { EventDeleterService } from '@/infrastructure/external-services/calendar/services/event-deleter.service';

describe('EventDeleterService', () => {
    const calendarServiceMock = {
        deleteEvent: jest.fn().mockResolvedValue(undefined),
    };

    let service: EventDeleterService;

    /**
     * Initializes the service with a mock calendar service before each test.
     */
    beforeEach(() => {
        service = new EventDeleterService(calendarServiceMock as any);
    });

    /**
     * Should create the service instance.
     */
    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    /**
     * Should call deleteEvent on the injected calendar service with the correct event ID.
     */
    it('should delete an event using the calendar service', async () => {
        const eventId = 'evt-123';
        await service.execute(eventId);
        expect(calendarServiceMock.deleteEvent).toHaveBeenCalledWith(eventId);
    });
});
