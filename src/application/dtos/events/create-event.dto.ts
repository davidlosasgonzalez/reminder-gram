/**
 * @file CreateEventDto
 * @description DTO for creating a new event.
 */

import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { DateVO } from '@/domain/value-objects/date.vo';

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @Type(() => DateVO)
    start: DateVO;

    @Type(() => DateVO)
    end: DateVO;

    @IsBoolean()
    isAllDay: boolean;

    @IsString()
    @IsNotEmpty()
    calendarId: string;

    @IsOptional()
    @IsString()
    location?: string;
}
