/**
 * @fileoverview Dummy test for BaseCalendarService to ensure it is abstract.
 * @see /tests/infrastructure/external-services/calendar/services/base-calendar.service.spec.ts
 */

import { BaseCalendarService } from '@/infrastructure/external-services/calendar/services/base-calendar.service';

/**
 * Dummy implementation for abstract class testing.
 */
class DummyCalendarService extends BaseCalendarService {
    async createEvent(...args: any[]): Promise<any> {}
    async findEvents(...args: any[]): Promise<any> {}
    async deleteEvent(...args: any[]): Promise<any> {}
}

describe('BaseCalendarService', () => {
    /**
     * Should instantiate a dummy implementation.
     */
    it('should instantiate a subclass', () => {
        const service = new DummyCalendarService();
        expect(service).toBeDefined();
    });
});
