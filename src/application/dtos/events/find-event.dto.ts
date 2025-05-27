/**
 * @file FindEventDto
 * @description DTO for finding a single event by ID.
 */

import { IsString } from 'class-validator';

export class FindEventDto {
    @IsString()
    id: string;
}
