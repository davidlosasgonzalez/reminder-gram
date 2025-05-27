/**
 * @file event-payload-mapper
 * @description Utility for mapping payloads to Event entities and DTOs.
 */

import { CreateEventDto } from '@/application/dtos/events/create-event.dto';
import { Event } from '@/domain/entities/event.entity';
import { DateVO } from '@/domain/value-objects/date.vo';

export class EventPayloadMapper {
    // #region toEntity

    /**
     * Maps a CreateEventDto to a domain Event entity.
     * @param dto Event creation DTO.
     * @param id Optional event id for updates.
     * @returns Event domain entity.
     */
    static toEntity(dto: CreateEventDto, id?: string): Event {
        return Event.create({
            id: id ?? crypto.randomUUID(),
            title: dto.title,
            start: dto.start,
            end: dto.end,
            isAllDay: dto.isAllDay,
            calendarId: dto.calendarId,
            description: dto.description,
            location: dto.location,
        });
    }

    // #endregion

    // #region toCreateEventDto

    /**
     * Maps a plain payload (from LLM, user input, etc.) to a CreateEventDto.
     * Normalizes all-day and no-hour situations to prevent DateVO errors.
     * @param payload Plain object with event fields.
     * @param calendarId Calendar ID for the event.
     * @returns CreateEventDto
     */
    static toCreateEventDto(payload: any, calendarId: string): CreateEventDto {
        const isAllDay = !!payload.isAllDay;
        let start: Date;
        let end: Date;

        if (typeof payload.start === 'string') {
            if (/^\d{4}-\d{2}-\d{2}$/.test(payload.start)) {
                start = new Date(`${payload.start}T00:00:00`);
            } else {
                start = new Date(payload.start);
            }
        } else if (payload.start instanceof Date) {
            start = payload.start;
        } else if (payload.start instanceof DateVO) {
            start = payload.start.value;
        } else {
            start = new Date();
        }

        if (isAllDay) {
            end = new Date(start);
            end.setDate(start.getDate() + 1);
        } else {
            if (payload.end) {
                const proposedEnd =
                    payload.end instanceof DateVO
                        ? payload.end.value
                        : payload.end instanceof Date
                          ? payload.end
                          : typeof payload.end === 'string'
                            ? new Date(payload.end)
                            : null;

                if (
                    proposedEnd &&
                    proposedEnd.getTime() - start.getTime() >= 5 * 60 * 1000
                ) {
                    end = proposedEnd;
                } else {
                    end = new Date(start);
                    end.setMinutes(start.getMinutes() + 5);
                }
            } else {
                end = new Date(start);
                end.setMinutes(start.getMinutes() + 5);
            }
        }

        return {
            title: payload.title,
            description: payload.description || '',
            start: DateVO.create(start),
            end: DateVO.create(end),
            isAllDay,
            calendarId,
            location: payload.location || '',
        };
    }

    // #endregion
}
