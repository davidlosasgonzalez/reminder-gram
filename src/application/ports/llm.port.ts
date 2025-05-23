/**
 * Port interface for LLM (Large Language Model) services.
 * Allows application use cases to interact with the LLM regardless of implementation.
 */
export interface LlmPort {
    /**
     * Evaluates the user message and returns relevance and LLM response.
     * @param message - The user message to analyze.
     */
    evaluateMessage(message: string): Promise<{
        relevant: boolean;
        messages: { user?: string; llm: string };
    }>;

    /**
     * Resolves the user's intent (intent detection and slot filling).
     * @param message - The normalized user message.
     * @param context - Optional context such as dates, time, etc.
     */
    resolveIntent(
        message: string,
        context?: Record<string, any>,
    ): Promise<{
        type: string;
        payload: Record<string, any>;
    }>;

    /**
     * Clarifies an ambiguous action (such as a CREATE_EVENT with missing info).
     * @param clarificationPrompt - Prompt for clarification.
     * @param userReply - User's reply to the clarification.
     */
    clarifyAny(
        clarificationPrompt: string,
        userReply: string,
        originalMessage: string,
        intentType: string,
        pendingPayload: Record<string, any>,
    ): Promise<any>;
}
