/**
 * @file are-intervals-overlapping.util
 * @description Utility to check if two time intervals overlap.
 */

/**
 * Checks if two time intervals overlap.
 * @param start1 Start of first interval.
 * @param end1 End of first interval.
 * @param start2 Start of second interval.
 * @param end2 End of second interval.
 * @returns True if intervals overlap.
 */
export function areIntervalsOverlapping(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date,
): boolean {
    return start1 < end2 && end1 > start2;
}
