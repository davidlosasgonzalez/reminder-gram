/**
 * @file normalize-date.util
 * @description Utility function to normalize date values.
 */

/**
 * Normalizes a value to a Date instance. Accepts Date, string, or an object with a .value property (DateVO).
 * @param d Input value.
 * @returns Normalized Date instance.
 */
export function normalizeDate(d: any): Date {
    if (!d) throw new Error('Date value is missing');
    if (d instanceof Date) return d;
    if (typeof d === 'string') return new Date(d);
    if ('value' in d && d.value instanceof Date) return d.value;
    return new Date(d);
}
