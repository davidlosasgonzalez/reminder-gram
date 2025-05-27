/**
 * @file /src/infrastructure/external/llm/services/clarify-any.service.ts
 * Service to clarify ambiguous actions or missing information using OpenAI.
 * Always expects JSON output from the LLM.
 */
import { Injectable, Logger } from '@nestjs/common';
import { ClarifyAnyPort } from '@/application/ports/llm/clarify-any.port';
import OpenAI from 'openai';
import { env } from '@/config/env/env.config';
import { CLARIFY_ANY_PROMPT } from '@/infrastructure/external-services/llm/prompts/clarify-any.es.prompt';
import { extractJsonFromString } from '@/shared/utils/extractJsonFromString';

/**
 * Removes non-essential fields and clarification from the payload before sending to LLM.
 * @param payload Original intent payload
 */
function cleanPayload(payload: Record<string, any>) {
    const { clarification, ...rest } = payload;

    if ('location' in rest && (!rest.location || rest.location === '')) {
        const { clarification, location, ...rest } = payload;
        return rest;
    }
    return rest;
}

@Injectable()
export class ClarifyAnyService implements ClarifyAnyPort {
    private readonly logger = new Logger(ClarifyAnyService.name);
    private readonly client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    private readonly promptTemplate: string = CLARIFY_ANY_PROMPT;

    /**
     * Clarifies ambiguous user input to complete or request missing data for an intent.
     * Always returns JSON output, never plain text.
     *
     * @param clarificationPrompt - The clarification message previously shown to the user
     * @param userReply - The user's reply to the clarification
     * @param originalMessage - The original user request
     * @param intentType - The type of intent being processed
     * @param pendingPayload - The current partial payload for the intent
     * @returns {Promise<any>} - JSON for the completed intent, or clarification request
     */
    async clarifyAny(
        clarificationPrompt: string,
        userReply: string,
        originalMessage: string,
        intentType: string,
        pendingPayload: Record<string, any>,
    ): Promise<any> {
        const prompt = this.promptTemplate
            .replace('{original_message}', originalMessage)
            .replace('{clarification_message}', clarificationPrompt)
            .replace('{user_reply}', userReply)
            .replace('{intent_type}', intentType)
            .replace(
                '{pending_payload_json}',
                JSON.stringify(cleanPayload(pendingPayload), null, 2),
            );

        this.logger.log('[INFO] Prompt sent to LLM:', prompt);

        const { choices } = await this.client.chat.completions.create({
            model: env.LLM_MODEL,
            messages: [{ role: 'system', content: prompt }],
            response_format: { type: 'json_object' }, // Force JSON response
        });

        const rawOutput = choices[0]?.message?.content ?? '';
        this.logger.log('[INFO] ClarifyAnyService: LLM raw output:', rawOutput);

        try {
            const clean = extractJsonFromString(rawOutput);
            const parsed = JSON.parse(clean || '{}');
            if (
                typeof parsed === 'object' &&
                (parsed.type || parsed.clarification)
            ) {
                return parsed;
            }
            throw new Error(
                'No valid intent or clarification found in response',
            );
        } catch (e) {
            this.logger.error(
                '[ERROR] Failed to parse LLM clarify response',
                e,
            );
            return {
                clarification:
                    'El sistema no pudo entender la respuesta del modelo. Por favor, repite tu respuesta o prueba con otra expresión.',
            };
        }
    }
}
