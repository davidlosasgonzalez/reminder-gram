import { CreateEventDto } from '@/application/dtos/events/create-event.dto';
import { DateVO } from '@/domain/value-objects/date.vo';

/**
 * EventPayloadMapper
 *
 * Maps payloads from various sources (LLM, API, forms, etc.) into CreateEventDto,
 * ensuring all fields (especially dates) are normalized as DateVO, and sets isAllDay and end accordingly.
 *
 * This mapper always ensures that all-day events provide start/end dates in 'YYYY-MM-DD' format
 * as required by the Google Calendar API.
 */
export class EventPayloadMapper {
    /**
     * Maps a generic payload to CreateEventDto.
     * If isAllDay is true (or detected automatically), formats dates in 'YYYY-MM-DD'.
     * @param payload - The source payload (may have dates as string, Date, DateVO, etc.).
     * @param calendarId - The calendar ID to use.
     * @returns {CreateEventDto}
     */
    static toCreateEventDto(payload: any, calendarId: string): CreateEventDto {
        // Detect all-day: explicitly set, or only a date (YYYY-MM-DD) with no hour
        const isAllDay =
            payload.isAllDay !== undefined
                ? payload.isAllDay
                : typeof payload.start === 'string' &&
                  (/^\d{4}-\d{2}-\d{2}$/.test(payload.start) ||
                      /^\d{4}-\d{2}-\d{2}T00:00(:00)?(\.000)?Z?$/.test(
                          payload.start,
                      ));

        let startVO: DateVO;
        let endVO: DateVO;

        if (isAllDay) {
            // Ensure start is always in 'YYYY-MM-DD'
            let startDateStr: string;
            if (typeof payload.start === 'string') {
                // If string with T, cut to YYYY-MM-DD
                startDateStr = payload.start.slice(0, 10);
            } else if (payload.start instanceof Date) {
                startDateStr = payload.start.toISOString().slice(0, 10);
            } else if (payload.start && payload.start.value instanceof Date) {
                startDateStr = payload.start.value.toISOString().slice(0, 10);
            } else {
                throw new Error('Invalid start date for all-day event');
            }

            // End must be next day (YYYY-MM-DD, exclusive)
            const endDateObj = new Date(startDateStr + 'T00:00:00Z');
            endDateObj.setDate(endDateObj.getDate() + 1);
            const endDateStr = endDateObj.toISOString().slice(0, 10);

            startVO = DateVO.create(startDateStr); // "2025-05-24"
            endVO = DateVO.create(endDateStr); // "2025-05-25"
        } else {
            startVO = toDateVO(payload.start);
            if (payload.end) {
                endVO = toDateVO(payload.end);
            } else {
                const endDate = new Date(startVO.value);
                endDate.setMinutes(endDate.getMinutes() + 5);
                endVO = DateVO.create(endDate);
            }
        }

        return {
            title: payload.title,
            start: startVO,
            end: endVO,
            description: payload.description,
            location: payload.location,
            isAllDay,
            calendarId,
        };
    }
}

/**
 * Converts a date input (string, Date, DateVO) to DateVO, or throws if invalid.
 * @param input - The input to convert
 * @returns {DateVO}
 */
function toDateVO(input: any): DateVO {
    if (!input) {
        throw new Error('Date required');
    }
    if (input instanceof DateVO) return input;
    if (input instanceof Date) return DateVO.create(input);
    if (typeof input === 'string') {
        // All-day: 'YYYY-MM-DD'
        if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
            return DateVO.create(input);
        }
        return DateVO.create(new Date(input));
    }
    if ('value' in input && input.value instanceof Date)
        return DateVO.create(input.value);
    throw new Error('Invalid date');
}
