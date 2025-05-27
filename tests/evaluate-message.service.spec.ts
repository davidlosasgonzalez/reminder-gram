/**
 * @fileoverview Unit tests for EvaluateMessageService.
 * @see /tests/infrastructure/external-services/llm/services/evaluate-message.service.spec.ts
 */

import { EvaluateMessageService } from '@/infrastructure/external-services/llm/services/evaluate-message.service';

jest.mock('openai', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: jest.fn().mockResolvedValue({
                    choices: [
                        {
                            message: {
                                content:
                                    '{"relevant":true,"messages":{"llm":"Todo bien"}}',
                            },
                        },
                    ],
                }),
            },
        },
    })),
}));

jest.mock('@/config/env/env.config', () => ({
    env: {
        OPENAI_API_KEY: 'fake-api-key',
        LLM_MODEL: 'gpt-4',
    },
}));

jest.mock(
    '@/infrastructure/external-services/llm/prompts/evaluate-message.es.prompt',
    () => ({
        EVALUATE_MESSAGE_PROMPT: 'Prompt with {user_message}',
    }),
);

jest.mock('@/shared/utils/extractJsonFromString', () => ({
    extractJsonFromString: jest.fn((raw: string) => raw),
}));

describe('EvaluateMessageService', () => {
    let service: EvaluateMessageService;

    /**
     * Initializes the service before each test.
     */
    beforeEach(() => {
        service = new EvaluateMessageService();
    });

    /**
     * Should create the service instance.
     */
    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    /**
     * Should parse and return evaluation result.
     */
    it('should return evaluation result from LLM mock', async () => {
        const result = await service.evaluateMessage('¿Qué tal?');
        expect(result).toEqual({
            relevant: true,
            messages: { llm: 'Todo bien' },
        });
    });

    /**
     * Should return fallback if parsing fails.
     */
    it('should return fallback object if output is not valid JSON', async () => {
        jest.requireMock(
            '@/shared/utils/extractJsonFromString',
        ).extractJsonFromString.mockReturnValueOnce('not a json');
        const result = await service.evaluateMessage('fallo');
        expect(result).toEqual({
            relevant: false,
            messages: {
                llm: 'Lo siento, ha ocurrido un error procesando tu mensaje.',
            },
        });
    });
});
