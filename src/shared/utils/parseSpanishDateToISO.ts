/**
 * Utility for parsing Spanish date strings into ISO format.
 * Supports various Spanish date formats and relative terms.
 *
 * Supported formats:
 * - Relative terms: "hoy", "mañana", "pasado mañana"
 * - Full date: "24 de mayo de 2025"
 * - Short date: "24/05/2025"
 * - Date with time: "24 de mayo de 2025 a las 15:30"
 *
 * @param input - The date string in Spanish
 * @param baseDate - Optional base date for relative terms. Defaults to today
 * @returns ISO8601 date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss), or null if not recognized
 * @throws Error if the input is invalid or the date cannot be parsed
 */
export function parseSpanishDateToISO(
    input: string,
    baseDate: Date = new Date(),
): string | null {
    if (!input || typeof input !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    const clean = input.toLowerCase().trim();

    try {
        // Handle relative terms
        if (clean === 'hoy') {
            return baseDate.toISOString().slice(0, 10);
        }
        if (clean === 'mañana') {
            const tomorrow = new Date(baseDate);
            tomorrow.setDate(baseDate.getDate() + 1);
            return tomorrow.toISOString().slice(0, 10);
        }
        if (clean === 'pasado mañana') {
            const dayAfterTomorrow = new Date(baseDate);
            dayAfterTomorrow.setDate(baseDate.getDate() + 2);
            return dayAfterTomorrow.toISOString().slice(0, 10);
        }

        // Parse full date format: "24 de mayo de 2025"
        const fullDateRegex =
            /^(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})(?:\s+a\s+las\s+(\d{1,2}):(\d{2}))?$/i;
        const fullDateMatch = clean.match(fullDateRegex);
        if (fullDateMatch) {
            const [, day, spanishMonth, year, hours, minutes] = fullDateMatch;
            const months: Record<string, number> = {
                enero: 0,
                febrero: 1,
                marzo: 2,
                abril: 3,
                mayo: 4,
                junio: 5,
                julio: 6,
                agosto: 7,
                septiembre: 8,
                octubre: 9,
                noviembre: 10,
                diciembre: 11,
            };
            const month =
                months[
                    spanishMonth
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                ];
            if (typeof month === 'number') {
                const date = new Date(Number(year), month, Number(day));
                if (hours && minutes) {
                    date.setHours(Number(hours), Number(minutes));
                    return date.toISOString();
                }
                return date.toISOString().slice(0, 10);
            }
        }

        // Parse short date format: "24/05/2025"
        const shortDateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        const shortDateMatch = clean.match(shortDateRegex);
        if (shortDateMatch) {
            const [, day, month, year] = shortDateMatch;
            const date = new Date(Number(year), Number(month) - 1, Number(day));
            return date.toISOString().slice(0, 10);
        }

        return null;
    } catch (error) {
        throw new Error(`Failed to parse date: ${error.message}`);
    }
}
