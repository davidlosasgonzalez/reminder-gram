/**
 * Port interface for evaluating message relevance using an LLM.
 */
export interface EvaluateMessagePort {
    /**
     * Evaluates the user's message to determine relevance and suggestions.
     * @param message - The user message to analyze.
     */
    evaluateMessage(message: string): Promise<{
        relevant: boolean;
        messages: { user?: string; llm: string };
    }>;
}
