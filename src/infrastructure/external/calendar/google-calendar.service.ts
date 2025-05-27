import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { ICalendarService } from '@/domain/interfaces/services/calendar.service.interface';
import { Event } from '@/domain/entities/event.entity';
import { DateVO } from '@/domain/value-objects/date.vo';
import * as fs from 'fs';

const credentials = JSON.parse(
    fs.readFileSync('private/client_secret.json', 'utf8'),
);

/**
 * Google Calendar Service Implementation
 *
 * This service provides a concrete implementation of the ICalendarService interface
 * using the Google Calendar API. It handles all calendar operations including:
 * - Event creation, retrieval, updating, and deletion
 * - Date range queries
 * - Calendar synchronization
 *
 * The service uses OAuth2 authentication and requires proper configuration
 * of Google API credentials through environment variables.
 *
 * @implements {ICalendarService}
 */
@Injectable()
export class GoogleCalendarService implements ICalendarService {
    private readonly logger = new Logger(GoogleCalendarService.name);
    private calendar;

    constructor(private configService: ConfigService) {
        const auth = new google.auth.JWT(
            credentials.client_email,
            undefined,
            credentials.private_key,
            ['https://www.googleapis.com/auth/calendar'],
        );
        this.calendar = google.calendar({ version: 'v3', auth });
    }

    /**
     * Creates a new event in Google Calendar
     *
     * @param event - The event entity to be created
     * @returns {Promise<Event>} The created event with Google Calendar ID
     * @throws {Error} If the event creation fails
     */
    async createEvent(event: Event): Promise<Event> {
        const calendarEvent: any = {
            summary: event.title,
            description: event.description,
            location: event.location,
        };

        // All-day event (ALWAYS YYYY-MM-DD for Google Calendar)
        if (event.isAllDay) {
            calendarEvent.start = {
                date:
                    event.start.value instanceof Date
                        ? event.start.value.toISOString().slice(0, 10)
                        : new Date(event.start.value)
                              .toISOString()
                              .slice(0, 10),
            };
            calendarEvent.end = {
                date:
                    event.end.value instanceof Date
                        ? event.end.value.toISOString().slice(0, 10)
                        : new Date(event.end.value).toISOString().slice(0, 10),
            };
        } else {
            calendarEvent.start = {
                dateTime: event.start.value.toISOString(),
                timeZone: 'UTC',
            };
            calendarEvent.end = {
                dateTime: event.end.value.toISOString(),
                timeZone: 'UTC',
            };
        }

        this.logger.log(
            '[DEBUG] Attempting to create event in Google Calendar:',
            JSON.stringify(calendarEvent),
        );

        try {
            const response = await this.calendar.events.insert({
                calendarId: event.calendarId,
                requestBody: calendarEvent,
            });

            this.logger.log(
                '[DEBUG] Google insert response:',
                JSON.stringify(response.data),
            );

            if (response.data && response.data.id) {
                return this.mapToEvent(response.data, event.calendarId);
            }
            if (Array.isArray((response.data as any).items)) {
                this.logger.warn(
                    '[WARN] Google insert returned items array instead of single event',
                );
                const items = (response.data as any).items;
                if (items.length > 0) {
                    return this.mapToEvent(items[0], event.calendarId);
                }
            }

            throw new Error(
                'Google Calendar did not return event data after creation',
            );
        } catch (error) {
            this.logger.error(
                '[ERROR] Error creating event in Google Calendar:',
                error,
            );
            throw error;
        }
    }

    /**
     * Retrieves events within a specified date range
     *
     * @param start - The start date of the range
     * @param end - The end date of the range
     * @returns {Promise<Event[]>} Array of events within the date range
     * @throws {Error} If the event retrieval fails
     */
    async findEvents(start: Date, end: Date): Promise<Event[]> {
        this.logger.log(
            `[DEBUG] Buscando eventos entre ${start.toISOString()} y ${end.toISOString()}`,
        );
        try {
            const response = await this.calendar.events.list({
                calendarId: 'davidlosas93@gmail.com',
                timeMin: start.toISOString(),
                timeMax: end.toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            });

            this.logger.log(
                '[DEBUG] Google events.list response:',
                JSON.stringify(response.data),
            );

            const items = response.data?.items || [];
            if (!Array.isArray(items)) {
                this.logger.error(
                    '[ERROR] Google Calendar API items no es array',
                    response.data,
                );
                return [];
            }

            return items.map((ev) =>
                this.mapToEvent(ev, 'davidlosas93@gmail.com'),
            );
        } catch (error) {
            this.logger.error('[ERROR] Error al buscar eventos:', error);
            throw error;
        }
    }

    /**
     * Updates an existing event in Google Calendar
     *
     * @param event - The event entity with updated information
     * @returns {Promise<Event>} The updated event
     * @throws {Error} If the event update fails
     */
    async updateEvent(event: Event): Promise<Event> {
        const calendarEvent = {
            summary: event.title,
            description: event.description,
            start: {
                dateTime: event.start.value.toISOString(),
                timeZone: 'UTC',
            },
            end: {
                dateTime: event.end.value.toISOString(),
                timeZone: 'UTC',
            },
            location: event.location,
        };

        this.logger.log(
            '[DEBUG] Actualizando evento en Google Calendar:',
            JSON.stringify(calendarEvent),
        );

        try {
            const response = await this.calendar.events.update({
                calendarId: event.calendarId,
                eventId: event.id,
                requestBody: calendarEvent,
            });

            this.logger.log(
                '[DEBUG] Google update response:',
                JSON.stringify(response.data),
            );
            return this.mapToEvent(response.data, event.calendarId);
        } catch (error) {
            this.logger.error('[ERROR] Error actualizando evento:', error);
            throw error;
        }
    }

    /**
     * Deletes an event from Google Calendar
     *
     * @param eventId - The ID of the event to delete
     * @returns {Promise<void>}
     * @throws {Error} If the event deletion fails
     */
    async deleteEvent(eventId: string): Promise<void> {
        this.logger.log(
            `[DEBUG] Borrando evento en Google Calendar: ${eventId}`,
        );
        try {
            await this.calendar.events.delete({
                calendarId: 'davidlosas93@gmail.com',
                eventId,
            });
            this.logger.log(`[DEBUG] Evento borrado: ${eventId}`);
        } catch (error) {
            this.logger.error('[ERROR] Error borrando evento:', error);
            throw error;
        }
    }

    /**
     * Maps a Google Calendar event to our domain Event entity
     *
     * @param calendarEvent - The raw Google Calendar event data
     * @param calendarId - Optional calendarId (default 'primary')
     * @returns {Event} A domain Event entity
     */
    private mapToEvent(calendarEvent: any, calendarId?: string): Event {
        this.logger.log(
            '[DEBUG] mapToEvent: Raw event data:',
            JSON.stringify(calendarEvent),
        );
        return Event.create({
            id: calendarEvent.id,
            title: calendarEvent.summary,
            description: calendarEvent.description,
            start: DateVO.create(
                new Date(
                    calendarEvent.start?.dateTime ?? calendarEvent.start?.date,
                ),
            ),
            end: DateVO.create(
                new Date(
                    calendarEvent.end?.dateTime ?? calendarEvent.end?.date,
                ),
            ),
            isAllDay: !!calendarEvent.start?.date,
            location: calendarEvent.location,
            calendarId: calendarId || 'primary',
        });
    }
}
