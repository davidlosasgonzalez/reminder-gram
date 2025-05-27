/**
 * @fileoverview Unit tests for GoogleCalendarService (findEvents).
 * @see /tests/infrastructure/external-services/calendar/services/google-calendar.service.spec.ts
 */

import { GoogleCalendarService } from '@/infrastructure/external-services/calendar/services/google-calendar.service';
import { env } from '@/config/env/env.config';

jest.mock('@/config/env/env.config', () => ({
    env: {
        GOOGLE_OAUTH_USER_EMAIL: 'user@email.com',
        GOOGLE_CALENDAR_ID: 'test-calendar-id',
        IGNORED_EVENT_TITLES: '',
    },
}));

jest.mock('path', () => ({
    resolve: jest.fn(() => '/fake/path'),
}));

jest.mock('fs/promises', () => ({
    readdir: jest.fn().mockResolvedValue(['mock_token_token.json']),
}));

jest.mock(
    '@/infrastructure/external-services/calendar/adapters/google-auth.helper',
    () => ({
        getUserGoogleAuth: jest.fn(() => ({})),
    }),
);

jest.mock('googleapis', () => ({
    google: {
        calendar: jest.fn(() => ({
            calendarList: {
                list: jest.fn().mockResolvedValue({
                    data: {
                        items: [
                            { id: 'calendar1', primary: true, summary: 'test' },
                        ],
                    },
                }),
            },
            events: {
                list: jest.fn().mockResolvedValue({
                    data: {
                        items: [
                            {
                                id: 'event1',
                                summary: 'Test Event',
                                start: {},
                                end: {},
                            },
                        ],
                    },
                }),
            },
        })),
    },
}));

jest.mock(
    '@/infrastructure/external-services/calendar/mappers/google-calendar.mapper',
    () => ({
        GoogleCalendarMapper: {
            toDomain: jest.fn((event: any) => ({
                ...event,
                getTitle: () => event.summary || '',
            })),
        },
    }),
);

describe('GoogleCalendarService', () => {
    /**
     * Should instantiate the service if env vars are present.
     */
    it('should be defined', () => {
        const service = new GoogleCalendarService();
        expect(service).toBeDefined();
    });

    /**
     * Should return events from the mocked Google Calendar API.
     */
    it('should return events from findEvents', async () => {
        const service = new GoogleCalendarService();
        const result = await service.findEvents(new Date(), new Date());
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].id).toBe('event1');
    });

    /**
     * Should return an empty array if the tokens directory cannot be read.
     */
    it('should return empty array if tokens directory is not readable', async () => {
        const fs = require('fs/promises');
        fs.readdir.mockRejectedValueOnce(new Error('Directory not found'));
        const service = new GoogleCalendarService();
        const result = await service.findEvents(new Date(), new Date());
        expect(result).toEqual([]);
    });
});
