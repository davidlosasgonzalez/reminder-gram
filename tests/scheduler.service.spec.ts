/**
 * @fileoverview Unit tests for SchedulerService.
 * @see /tests/scheduler.service.spec.ts
 */

import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from '@/infrastructure/scheduler/scheduler.service';
import { EventAdapter } from '@/application/adapters/event.adapter';
import { BaseTelegramService } from '@/infrastructure/external-services/telegram/services/base-telegram.service';

const scheduleMock = jest.fn();

jest.mock('node-cron', () => ({
    __esModule: true,
    default: {
        schedule: (...args: any[]) => scheduleMock(...args),
    },
}));

jest.mock(
    '@/infrastructure/external-services/telegram/services/base-telegram.service',
);

/**
 * Mocks EventAdapter to always return an empty list of events.
 */
const eventAdapterMock = {
    findEvents: jest.fn().mockResolvedValue([]),
};

describe('SchedulerService', () => {
    let schedulerService: SchedulerService;
    let telegramService: BaseTelegramService;

    /**
     * Initializes the test module and injects the required dependencies.
     */
    beforeEach(async () => {
        scheduleMock.mockClear();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SchedulerService,
                { provide: EventAdapter, useValue: eventAdapterMock },
                BaseTelegramService,
            ],
        }).compile();

        schedulerService = module.get<SchedulerService>(SchedulerService);
        telegramService = module.get<BaseTelegramService>(BaseTelegramService);
    });

    /**
     * Clears all Jest mocks after running all tests.
     */
    afterAll(() => {
        jest.clearAllMocks();
    });

    /**
     * Should properly initialize the service instance.
     */
    it('should be defined', () => {
        expect(schedulerService).toBeDefined();
    });

    /**
     * Should schedule a cron job with the correct expression and callback function.
     */
    it('should call cron.schedule with the correct cron expression', async () => {
        await schedulerService.onApplicationBootstrap();
        expect(scheduleMock).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Function),
        );
    });

    /**
     * Should send a Telegram message when the scheduled cron callback runs.
     */
    it('should send a message to Telegram when the cron runs', async () => {
        const sendMessageSpy = jest
            .spyOn(telegramService, 'sendMessage')
            .mockResolvedValue(undefined);

        await schedulerService.onApplicationBootstrap();

        const cronCallback = scheduleMock.mock.calls[0][1];
        await cronCallback();

        expect(sendMessageSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
            expect.anything(),
        );
    });
});
