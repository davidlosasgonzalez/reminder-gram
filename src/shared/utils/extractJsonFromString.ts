/**
 * Extracts a potentially valid JSON string from the first opening curly brace `{`
 * to the last closing brace `}` within the input string.
 *
 * This is useful for cleaning up malformed or wrapped JSON content.
 *
 * @param input - The raw string containing JSON-like content.
 * @returns A trimmed substring from the first `{` to the last `}`, or null if invalid.
 */
export function extractJsonFromString(input: string): string | null {
    if (!input || typeof input !== 'string') return null;

    const startIndex = input.indexOf('{');
    const endIndex = input.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
        return null;
    }

    return input.slice(startIndex, endIndex + 1).trim();
}
