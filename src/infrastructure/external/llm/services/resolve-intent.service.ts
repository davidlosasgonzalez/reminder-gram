import { Injectable, Logger } from '@nestjs/common';
import { ResolveIntentPort } from '@/application/ports/llm/resolve-intent.port';
import OpenAI from 'openai';
import { env } from '@/config/env/env.config';
import { RESOLVE_INTENT_PROMPT } from '@/infrastructure/external/llm/prompts/resolve-intent.es.prompt';
import { extractJsonFromString } from '@/shared/utils/extractJsonFromString';

/**
 * Service to resolve user intent and extract structured data using OpenAI.
 */
@Injectable()
export class ResolveIntentService implements ResolveIntentPort {
    private readonly logger = new Logger(ResolveIntentService.name);
    private readonly client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    private readonly promptTemplate: string = RESOLVE_INTENT_PROMPT;

    /**
     * Resolves intent from user message using LLM and prompt.
     * @param message - The normalized user message.
     * @param context - Additional date/time context.
     */
    async resolveIntent(message: string, context?: Record<string, any>) {
        let prompt = this.promptTemplate.replace('{user_message}', message);
        if (context) {
            if (context.today)
                prompt = prompt.replace('{current_date}', context.today);
            if (context.tomorrow)
                prompt = prompt.replace('{tomorrow_date}', context.tomorrow);
            if ('isConfusingTime' in context)
                prompt = prompt.replace(
                    '{isConfusingTime}',
                    context.isConfusingTime ? 'Sí' : 'No',
                );
        }

        const { choices } = await this.client.chat.completions.create({
            model: env.LLM_MODEL,
            messages: [{ role: 'system', content: prompt }],
        });
        const rawOutput = choices[0]?.message?.content ?? '';
        try {
            const clean = extractJsonFromString(rawOutput);
            const parsed = JSON.parse(clean || '{}');
            return parsed;
        } catch (e) {
            this.logger.error('Failed to parse LLM response', e);
            return {
                type: 'UNKNOWN',
                payload: { original: message },
            };
        }
    }
}
