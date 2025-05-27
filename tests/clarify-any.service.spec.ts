/**
 * @fileoverview Unit tests for ClarifyAnyService.
 * @see /tests/infrastructure/external-services/llm/services/clarify-any.service.spec.ts
 */

import { ClarifyAnyService } from '@/infrastructure/external-services/llm/services/clarify-any.service';

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
                                    '{"type":"clarification","clarification":"Mock response"}',
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
    '@/infrastructure/external-services/llm/prompts/clarify-any.es.prompt',
    () => ({
        CLARIFY_ANY_PROMPT:
            'Prompt with {original_message} {clarification_message} {user_reply} {intent_type} {pending_payload_json}',
    }),
);

jest.mock('@/shared/utils/extractJsonFromString', () => ({
    extractJsonFromString: jest.fn((raw: string) => raw),
}));

describe('ClarifyAnyService', () => {
    let service: ClarifyAnyService;

    /**
     * Initializes the service before each test.
     */
    beforeEach(() => {
        service = new ClarifyAnyService();
    });

    /**
     * Should create the service instance.
     */
    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    /**
     * Should return parsed JSON with clarification type from mock response.
     */
    it('should clarify ambiguous input and return JSON', async () => {
        const result = await service.clarifyAny(
            '¿Qué fecha?',
            'El miércoles',
            'Quiero una reunión',
            'create_event',
            { title: 'reunión', clarification: '¿Qué fecha?' },
        );
        expect(result).toEqual({
            type: 'clarification',
            clarification: 'Mock response',
        });
    });

    /**
     * Should return clarification error message if parsing fails.
     */
    it('should return default clarification when response is not valid JSON', async () => {
        // Forzar extractJsonFromString a devolver algo no JSON
        jest.requireMock(
            '@/shared/utils/extractJsonFromString',
        ).extractJsonFromString.mockReturnValueOnce('not a json');
        const result = await service.clarifyAny(
            '¿Qué fecha?',
            'El miércoles',
            'Quiero una reunión',
            'create_event',
            { title: 'reunión', clarification: '¿Qué fecha?' },
        );
        expect(result).toEqual({
            clarification:
                'El sistema no pudo entender la respuesta del modelo. Por favor, repite tu respuesta o prueba con otra expresión.',
        });
    });
});
