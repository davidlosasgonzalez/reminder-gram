import { z } from 'zod';

/**
 * @file env.validation.ts
 * @description Validation schema for environment variables using Zod.
 * Defines and groups all environment variables required for ReminderGram.
 */
export const envSchema = z.object({
    // Telegram Configuration
    TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN cannot be empty'),
    TELEGRAM_ADMIN_CHAT_ID: z
        .string()
        .min(1, 'TELEGRAM_ADMIN_CHAT_ID cannot be empty'),

    // Google Calendar Configuration
    GOOGLE_OAUTH_USER_EMAIL: z
        .string()
        .min(1, 'GOOGLE_OAUTH_USER_EMAIL cannot be empty'),
    GOOGLE_CALENDAR_ID: z.string().min(1, 'GOOGLE_CALENDAR_ID cannot be empty'),
    CREDENTIALS_PATH: z.string().min(1, 'CREDENTIALS_PATH cannot be empty'),
    IGNORED_EVENT_TITLES: z.string().default(''),

    // LLM (OpenAI) Configuration
    OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY cannot be empty'),
    LLM_MODEL: z.string().min(1, 'LLM_MODEL cannot be empty'),

    // Cron / Scheduler Configuration
    CRON_TIME: z.string().min(1, 'CRON_TIME cannot be empty'),

    // Application Settings
    PORT: z.coerce.number().int().positive().default(3000),
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
});

/**
 * Inferred type from the validation schema for environment variables.
 */
export type EnvSchema = z.infer<typeof envSchema>;
