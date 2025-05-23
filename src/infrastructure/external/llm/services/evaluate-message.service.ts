import { Injectable, Logger } from '@nestjs/common';
import { EvaluateMessagePort } from '@/application/ports/llm/evaluate-message.port';
import OpenAI from 'openai';
import { env } from '@/config/env/env.config';
import { EVALUATE_MESSAGE_PROMPT } from '@/infrastructure/external/llm/prompts/evaluate-message.es.prompt';
import { extractJsonFromString } from '@/shared/utils/extractJsonFromString';

/**
 * Service to evaluate message relevance and generate user guidance using OpenAI.
 */
@Injectable()
export class EvaluateMessageService implements EvaluateMessagePort {
    private readonly logger = new Logger(EvaluateMessageService.name);
    private readonly client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    private readonly prompt: string = EVALUATE_MESSAGE_PROMPT;

    /**
     * Evaluates a user message and returns relevance and suggestions.
     * @param message - The user message.
     */
    async evaluateMessage(message: string) {
        const systemPrompt = this.prompt.replace('{user_message}', message);

        this.logger.log(
            'EvaluateMessageService: prompt before LLM',
            systemPrompt,
        );

        const { choices } = await this.client.chat.completions.create({
            model: env.LLM_MODEL,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
            ],
        });

        const rawOutput = choices[0]?.message?.content ?? '';
        this.logger.log('EvaluateMessageService: LLM raw output', rawOutput);

        try {
            const clean = extractJsonFromString(rawOutput);
            const parsed = JSON.parse(clean || '{}');
            return parsed;
        } catch (e) {
            this.logger.error('Failed to parse LLM response', e);
            return {
                relevant: false,
                messages: {
                    llm: 'Lo siento, ha ocurrido un error procesando tu mensaje.',
                },
            };
        }
    }
}
