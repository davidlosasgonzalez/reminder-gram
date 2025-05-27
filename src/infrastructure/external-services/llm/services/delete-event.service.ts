/**
 * @file delete-event.service
 * @description Service for selecting which calendar event to delete, using LLM and contextual event list.
 */

import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { env } from '@/config/env/env.config';
import { DELETE_EVENT_PROMPT } from '@/infrastructure/external-services/llm/prompts/delete-event.prompt';
import { extractJsonFromString } from '@/shared/utils/extractJsonFromString';

/**
 * Service for selecting which event to delete using LLM given user intent and a list of events.
 */
@Injectable()
export class DeleteEventService {
    private readonly logger = new Logger(DeleteEventService.name);
    private readonly client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    /**
     * Uses LLM to determine which event matches the user's delete request.
     * @param userMessage The user's deletion request (natural language).
     * @param events List of available events in the calendar (array of objects).
     * @returns An object with eventId to delete or clarification prompt.
     */
    async selectEventToDelete(
        userMessage: string,
        events: any[],
    ): Promise<{ eventId?: string; clarification?: string }> {
        const eventsJson = JSON.stringify(events, null, 2);
        const prompt = DELETE_EVENT_PROMPT.replace(
            '{events_json}',
            eventsJson,
        ).replace('{user_message}', userMessage);

        this.logger.log(
            'DeleteEventSelectionService: prompt before LLM',
            prompt,
        );

        const { choices } = await this.client.chat.completions.create({
            model: env.LLM_MODEL,
            messages: [{ role: 'system', content: prompt }],
        });

        const rawOutput = choices[0]?.message?.content ?? '';
        this.logger.log(
            'DeleteEventSelectionService: LLM raw output',
            rawOutput,
        );

        try {
            const clean = extractJsonFromString(rawOutput);
            const parsed = JSON.parse(clean || '{}');
            return parsed;
        } catch (e) {
            this.logger.error(
                'Failed to parse LLM delete selection response',
                e,
            );
            return {
                clarification:
                    'No se pudo identificar el evento a borrar. ¿Podrías darme más detalles (título, fecha o similar)?',
            };
        }
    }
}
