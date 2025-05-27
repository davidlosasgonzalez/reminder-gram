/**
 * @fileoverview Unit tests for ResolveIntentService.
 * @see /tests/infrastructure/external-services/llm/services/resolve-intent.service.spec.ts
 */

import { ResolveIntentService } from '@/infrastructure/external-services/llm/services/resolve-intent.service';
import { Logger } from '@nestjs/common';

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
                                    '{"type":"MEETING","payload":{"title":"Reunión"}}',
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
    '@/infrastructure/external-services/llm/prompts/resolve-intent.es.prompt',
    () => ({
        RESOLVE_INTENT_PROMPT:
            'Prompt with {user_message} {current_date} {tomorrow_date} {isConfusingTime}',
    }),
);

jest.mock('@/shared/utils/extractJsonFromString', () => ({
    extractJsonFromString: jest.fn((raw: string) => raw),
}));

describe('ResolveIntentService', () => {
    let service: ResolveIntentService;

    /**
     * Initializes the service before each test.
     */
    beforeEach(() => {
        service = new ResolveIntentService();
    });

    /**
     * Should create the service instance.
     */
    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    /**
     * Should parse and return resolved intent object.
     */
    it('should return resolved intent from LLM mock', async () => {
        const result = await service.resolveIntent('Quiero una reunión');
        expect(result).toEqual({
            type: 'MEETING',
            payload: { title: 'Reunión' },
        });
    });

    /**
     * Should return fallback object if parsing fails.
     */
    it('should return fallback object if output is not valid JSON', async () => {
        jest.requireMock(
            '@/shared/utils/extractJsonFromString',
        ).extractJsonFromString.mockReturnValueOnce('not a json');
        const result = await service.resolveIntent('fallo');
        expect(result).toEqual({
            type: 'UNKNOWN',
            payload: { original: 'fallo' },
        });
    });
});
