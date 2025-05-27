/**
 * @fileoverview Unit tests for DeleteEventService.
 * @see /tests/infrastructure/external-services/llm/services/delete-event.service.spec.ts
 */

import { DeleteEventService } from '@/infrastructure/external-services/llm/services/delete-event.service';
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
                                content: '{"eventId":"evt1"}',
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
    '@/infrastructure/external-services/llm/prompts/delete-event.prompt',
    () => ({
        DELETE_EVENT_PROMPT: 'Prompt with {events_json} {user_message}',
    }),
);

jest.mock('@/shared/utils/extractJsonFromString', () => ({
    extractJsonFromString: jest.fn((raw: string) => raw),
}));

describe('DeleteEventService', () => {
    let service: DeleteEventService;

    /**
     * Initializes the service before each test.
     */
    beforeEach(() => {
        service = new DeleteEventService();
    });

    /**
     * Should create the service instance.
     */
    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    /**
     * Should parse the response and return the eventId.
     */
    it('should return eventId from LLM mock', async () => {
        const result = await service.selectEventToDelete('Borra mi reunión', [
            { id: 'evt1', title: 'Reunión' },
        ]);
        expect(result).toEqual({ eventId: 'evt1' });
    });

    /**
     * Should return clarification if parsing fails.
     */
    it('should return clarification if output is not valid JSON', async () => {
        jest.requireMock(
            '@/shared/utils/extractJsonFromString',
        ).extractJsonFromString.mockReturnValueOnce('not a json');
        const result = await service.selectEventToDelete('Borra algo', []);
        expect(result).toEqual({
            clarification:
                'No se pudo identificar el evento a borrar. ¿Podrías darme más detalles (título, fecha o similar)?',
        });
    });
});
