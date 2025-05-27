/**
 * @file EventResponseDto
 * @description DTO for event response.
 */

import { IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { DateVO } from '@/domain/value-objects/date.vo';

export class EventResponseDto {
    @IsString()
    id: string;

    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @Type(() => DateVO)
    start: DateVO;

    @Type(() => DateVO)
    end: DateVO;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    calendarId: string;
}
