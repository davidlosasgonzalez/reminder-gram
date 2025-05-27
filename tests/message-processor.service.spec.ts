/**
 * @fileoverview Unit tests for BaseTelegramService through message processor integration.
 * @see /tests/message-processor.service.spec.ts
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BaseTelegramService } from '@/infrastructure/external-services/telegram/services/base-telegram.service';
import { ConfigService } from '@nestjs/config';

jest.mock('telegraf', () => ({
    Telegraf: jest.fn().mockImplementation(() => ({
        telegram: {
            sendMessage: jest.fn(),
        },
        use: jest.fn(),
        launch: jest.fn().mockResolvedValue(undefined),
    })),
}));

const mockConfigService = {
    get: jest.fn((key: string) => {
        if (key === 'TELEGRAM_BOT_TOKEN') return 'mock-token';
        return null;
    }),
};

describe('BaseTelegramService', () => {
    let service: BaseTelegramService;
    let telegraf: any;

    /**
     * Initializes the test module and injects the required dependencies.
     */
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BaseTelegramService,
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        service = module.get<BaseTelegramService>(BaseTelegramService);
        telegraf = service['bot'];
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
        expect(service).toBeDefined();
    });

    /**
     * Should call Telegraf's sendMessage with correct arguments.
     */
    it('should send a message', async () => {
        const chatId = '123456789';
        const text = 'Test message';

        await service.sendMessage(chatId, text);

        expect(telegraf.telegram.sendMessage).toHaveBeenCalledWith(
            chatId,
            text,
            undefined,
        );
    });
});
