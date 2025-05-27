import { IsString, IsOptional, IsBoolean, IsDate } from 'class-validator';
import { DateVO } from '@/domain/value-objects/date.vo';

/**
 * Data Transfer Object for creating events.
 *
 * This DTO is used to validate and transfer event creation data
 * between the presentation and application layers.
 */
export class CreateEventDto {
    /**
     * Title of the event.
     */
    @IsString()
    title: string;

    /**
     * Start date/time as DateVO.
     */
    @IsDate()
    start: DateVO;

    /**
     * End date/time as DateVO (optional).
     */
    @IsDate()
    @IsOptional()
    end?: DateVO;

    /**
     * If the event is all day (optional).
     */
    @IsBoolean()
    @IsOptional()
    isAllDay?: boolean;

    /**
     * Calendar identifier.
     */
    @IsString()
    calendarId: string;

    /**
     * Optional event description.
     */
    @IsString()
    @IsOptional()
    description?: string;

    /**
     * Optional location.
     */
    @IsString()
    @IsOptional()
    location?: string;
}
