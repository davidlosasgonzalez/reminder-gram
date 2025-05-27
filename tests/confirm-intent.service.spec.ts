/**
 * @fileoverview Unit tests for ConfirmIntentService.
 * @see /tests/infrastructure/external-services/llm/services/confirm-intent.service.spec.ts
 */

import { ConfirmIntentService } from '@/infrastructure/external-services/llm/services/confirm-intent.service';

jest.mock('openai', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: jest.fn().mockResolvedValue({
                    choices: [
                        {
                            message: {
                                content: '{"confirmed":true}',
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
    '@/infrastructure/external-services/llm/prompts/confirm-intent.es.prompt',
    () => ({
        CONFIRM_INTENT_PROMPT: 'Prompt with {confirmation_prompt} {user_reply}',
    }),
);

describe('ConfirmIntentService', () => {
    let service: ConfirmIntentService;

    /**
     * Initializes the service before each test.
     */
    beforeEach(() => {
        service = new ConfirmIntentService();
    });

    /**
     * Should create the service instance.
     */
    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    /**
     * Should parse the response and return confirmed true.
     */
    it('should return confirmed true from LLM mock', async () => {
        const result = await service.confirm('¿Confirmar evento?', 'Sí');
        expect(result).toEqual({ confirmed: true });
    });

    /**
     * Should return clarification if JSON is not valid.
     */
    it('should return clarification if output is not valid JSON', async () => {
        jest.spyOn(JSON, 'parse').mockImplementationOnce(() => {
            throw new Error('invalid');
        });
        const result = await service.confirm('¿Confirmar evento?', 'Sí');
        expect(result).toEqual({
            confirmed: false,
            clarification:
                'No entendí tu respuesta. ¿Te gustaría confirmar la acción?',
        });
    });
});
