/**
 * @fileoverview Unit tests for EventCreatorService.
 * @see /tests/infrastructure/external-services/calendar/services/event-creator.service.spec.ts
 */

import { EventCreatorService } from '@/infrastructure/external-services/calendar/services/event-creator.service';

describe('EventCreatorService', () => {
    const mockEvent = { id: '123', title: 'Test Event' };
    const calendarServiceMock = {
        createEvent: jest.fn().mockResolvedValue(mockEvent),
    };

    let service: EventCreatorService;

    /**
     * Initializes the service with a mock calendar service before each test.
     */
    beforeEach(() => {
        service = new EventCreatorService(calendarServiceMock as any);
    });

    /**
     * Should create the service instance.
     */
    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    /**
     * Should call createEvent on the injected calendar service and return the created event.
     */
    it('should create a new event using the calendar service', async () => {
        const result = await service.execute(mockEvent as any);
        expect(calendarServiceMock.createEvent).toHaveBeenCalledWith(mockEvent);
        expect(result).toEqual(mockEvent);
    });
});
