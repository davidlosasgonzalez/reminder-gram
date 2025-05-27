/**
 * @fileoverview Unit tests for EventQueryService.
 * @see /tests/infrastructure/external-services/calendar/services/event-query.service.spec.ts
 */

import { EventQueryService } from '@/infrastructure/external-services/calendar/services/event-query.service';

describe('EventQueryService', () => {
    const mockEvents = [{ id: 'e1' }, { id: 'e2' }];
    const calendarServiceMock = {
        findEvents: jest.fn().mockResolvedValue(mockEvents),
    };

    let service: EventQueryService;

    /**
     * Initializes the service with a mock calendar service before each test.
     */
    beforeEach(() => {
        service = new EventQueryService(calendarServiceMock as any);
    });

    /**
     * Should create the service instance.
     */
    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    /**
     * Should call findEvents on the injected calendar service and return the results.
     */
    it('should query events using the calendar service', async () => {
        const start = new Date();
        const end = new Date(Date.now() + 10000);
        const result = await service.execute(start, end);
        expect(calendarServiceMock.findEvents).toHaveBeenCalledWith(start, end);
        expect(result).toEqual(mockEvents);
    });
});
