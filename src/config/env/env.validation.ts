import { z } from 'zod';

/**
 * Validation schema for environment variables using Zod.
 * This schema defines all required and optional environment variables
 * for the application, with appropriate validation rules and defaults.
 */
export const envSchema = z.object({
    /**
     * Telegram Bot configuration.
     * Required for the bot to function properly.
     */
    TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN cannot be empty'),
    TELEGRAM_ADMIN_CHAT_ID: z
        .string()
        .min(1, 'TELEGRAM_ADMIN_CHAT_ID cannot be empty'),

    /**
     * OpenAI LLM configuration.
     * Required for using language model services (OpenAI, GPT, etc).
     */
    OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY cannot be empty'),
    LLM_MODEL: z.string().min(1, 'LLM_MODEL cannot be empty'),

    /**
     * Server configuration.
     * Optional settings for the application server.
     */
    PORT: z.coerce.number().int().positive().default(3000),
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
});

/**
 * Inferred type from the validation schema for environment variables.
 * Use this type when you need to reference the environment variables type.
 */
export type EnvSchema = z.infer<typeof envSchema>;
