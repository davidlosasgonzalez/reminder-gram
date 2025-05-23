import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { env } from '@/config/env/env.config';
import { CONFIRM_INTENT_PROMPT } from '@/infrastructure/external/llm/prompts/confirm-intent.es.prompt';

/**
 * Service for confirming intent via LLM (handles fuzzy human yes/affirmation in Spanish).
 */
@Injectable()
export class ConfirmIntentService {
    private readonly logger = new Logger(ConfirmIntentService.name);
    private readonly client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    /**
     * Uses LLM to determine if user's reply confirms a pending intent.
     * @param confirmationPrompt - The previous confirmation message.
     * @param userReply - The user's reply (affirmative, negative, or ambiguous).
     */
    async confirm(
        confirmationPrompt: string,
        userReply: string,
    ): Promise<{ confirmed: boolean; clarification?: string }> {
        const prompt = CONFIRM_INTENT_PROMPT.replace(
            '{confirmation_prompt}',
            confirmationPrompt,
        ).replace('{user_reply}', userReply);

        this.logger.log('ConfirmIntentService: prompt before LLM', prompt);

        const { choices } = await this.client.chat.completions.create({
            model: env.LLM_MODEL,
            messages: [{ role: 'system', content: prompt }],
        });

        const rawOutput = choices[0]?.message?.content ?? '';
        this.logger.log('ConfirmIntentService: LLM raw output', rawOutput);

        try {
            // Parse only the first JSON found in the string
            const jsonMatch = rawOutput.match(/\{[\s\S]*?\}/);
            const clean = jsonMatch ? jsonMatch[0] : '{}';
            const parsed = JSON.parse(clean);
            return parsed;
        } catch (e) {
            this.logger.error('Failed to parse LLM confirmation response', e);
            // If not valid JSON, always ask for clarification in Spanish
            return {
                confirmed: false,
                clarification:
                    'No entendí tu respuesta. ¿Te gustaría confirmar la acción?',
            };
        }
    }
}
