/**
 * Port interface for clarifying ambiguous actions using an LLM.
 */
export interface ClarifyAnyPort {
    /**
     * Clarifies an ambiguous action (like a CREATE_EVENT with missing information).
     * @param clarificationPrompt - Prompt for clarification.
     * @param userReply - User's reply to the clarification.
     * @param originalMessage - The original message from the user.
     * @param intentType - The type of intent being clarified.
     * @param pendingPayload - The incomplete payload needing clarification.
     */
    clarifyAny(
        clarificationPrompt: string,
        userReply: string,
        originalMessage: string,
        intentType: string,
        pendingPayload: Record<string, any>,
    ): Promise<any>;
}
