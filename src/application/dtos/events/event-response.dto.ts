import { Event } from '@/domain/entities/event.entity';

/**
 * Data Transfer Object for event responses
 *
 * This DTO is used to format event data for responses,
 * ensuring consistent data structure across the application.
 */
export class EventResponseDto {
    id: string;
    title: string;
    description?: string;
    start: string;
    end: string;
    isAllDay: boolean;
    location?: string;
    calendarId: string;

    /**
     * Creates a new EventResponseDto from an Event entity
     * @param event The event entity to convert
     * @returns A new EventResponseDto instance
     */
    static fromEvent(event: Event): EventResponseDto {
        const dto = new EventResponseDto();
        dto.id = event.id;
        dto.title = event.title;
        dto.description = event.description;
        dto.start = event.start.toString();
        dto.end = event.end.toString();
        dto.isAllDay = event.isAllDay;
        dto.location = event.location;
        dto.calendarId = event.calendarId;
        return dto;
    }
}
