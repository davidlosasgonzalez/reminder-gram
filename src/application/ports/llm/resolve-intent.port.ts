/**
 * Port interface for resolving user intent using an LLM.
 */
export interface ResolveIntentPort {
    /**
     * Resolves the user's intent and extracts structured data from the message.
     * @param message - The normalized user message.
     * @param context - Optional context such as dates, times, etc.
     */
    resolveIntent(
        message: string,
        context?: Record<string, any>,
    ): Promise<{
        type: string;
        payload: Record<string, any>;
    }>;
}
