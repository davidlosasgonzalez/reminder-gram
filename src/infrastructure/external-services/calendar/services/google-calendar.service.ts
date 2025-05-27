/**
 * @file google-calendar.service
 * @description Infrastructure implementation of CalendarService using Google Calendar API and user OAuth tokens.
 */

import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { CalendarService } from '@/domain/services/calendar.service.interface';
import { Event } from '@/domain/entities/event.entity';
import { getUserGoogleAuth } from '../adapters/google-auth.helper';
import { GoogleCalendarMapper } from '../mappers/google-calendar.mapper';
import { env } from '@/config/env/env.config';
import * as path from 'path';
import * as fs from 'fs/promises';

// #region Google Calendar Service

/**
 * Google Calendar service for event CRUD operations using user OAuth tokens.
 * Only writes (create/delete) to GOOGLE_CALENDAR_ID.
 */
@Injectable()
export class GoogleCalendarService implements CalendarService {
    private readonly logger = new Logger(GoogleCalendarService.name);
    private readonly userEmail: string = env.GOOGLE_OAUTH_USER_EMAIL;
    private readonly calendarId: string = env.GOOGLE_CALENDAR_ID;
    private readonly ignoredEventTitles: string[] =
        env.IGNORED_EVENT_TITLES.toLowerCase().split(',');

    constructor() {
        if (!this.userEmail || !this.calendarId) {
            throw new Error(
                '[GoogleCalendarService] GOOGLE_CALENDAR_ID must be set as a non-empty string in your environment variables.',
            );
        }
    }

    // #region findEvents

    /**
     * Lists all events from the primary calendar of every user for which a token exists.
     * @param start The start date.
     * @param end The end date.
     * @returns Array of events from all users' primary calendars.
     */
    async findEvents(start: Date, end: Date): Promise<Event[]> {
        this.logger.log(
            `Listing events from all users' primary calendars from ${start.toISOString()} to ${end.toISOString()}`,
        );

        const tokensDir = path.resolve(process.cwd(), 'private', 'tokens');
        let tokenFiles: string[] = [];
        try {
            tokenFiles = (await fs.readdir(tokensDir)).filter((file) =>
                file.endsWith('_token.json'),
            );
        } catch (err) {
            this.logger.error(`Could not read tokens directory: ${err}`);
            return [];
        }

        const allEvents: Event[] = [];

        for (const tokenFile of tokenFiles) {
            // Este método recupera el email original del nombre del archivo de token
            const email = tokenFile
                .replace('_token.json', '')
                .replace(/_gmail_com$/, '@gmail.com')
                .replace(/_([a-z0-9]+)_com$/, (_, domain) => `@${domain}.com`)
                .replace(/_/g, '.');

            try {
                const oauth2Client = getUserGoogleAuth(email);
                const calendar = google.calendar({
                    version: 'v3',
                    auth: oauth2Client,
                });

                const calendarList = await calendar.calendarList.list();
                const calendars = calendarList.data.items || [];
                const primary = calendars.find((c) => c.primary);

                if (!primary || !primary.id) {
                    this.logger.warn(
                        `[${email}] No primary calendar found, skipping.`,
                    );
                    continue;
                }

                const response = await calendar.events.list({
                    calendarId: primary.id,
                    timeMin: start.toISOString(),
                    timeMax: end.toISOString(),
                    singleEvents: true,
                    orderBy: 'startTime',
                });

                const items = response.data?.items || [];
                this.logger.log(
                    `[${email}] (${primary.summary}) -> ${items.length} events found.`,
                );

                allEvents.push(
                    ...items.map((ev) =>
                        GoogleCalendarMapper.toDomain(ev, primary.id as string),
                    ),
                );
            } catch (error: any) {
                this.logger.warn(
                    `[${email}] Could not read primary calendar: ${error.message}`,
                );
            }
        }

        this.logger.log(
            `Total events retrieved from all primary calendars: ${allEvents.length}`,
        );

        return allEvents.filter(
            (event) =>
                !this.ignoredEventTitles.includes(
                    event.getTitle().toLowerCase(),
                ),
        );
    }

    // #endregion

    // #region createEvent

    /**
     * Creates a new event in the main calendar.
     * @param event The event to create.
     * @returns The created event.
     */
    async createEvent(event: Event): Promise<Event> {
        this.logger.log(
            `Creating event in main calendar for user ${this.userEmail}`,
        );
        const calendarEvent = this.mapToGoogleEvent(event);

        const oauth2Client = getUserGoogleAuth(this.userEmail);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        try {
            const response = await calendar.events.insert({
                calendarId: this.calendarId,
                requestBody: calendarEvent,
            });

            if (response.data && response.data.id) {
                return GoogleCalendarMapper.toDomain(
                    response.data,
                    this.calendarId,
                );
            }

            if (
                Array.isArray((response.data as any).items) &&
                (response.data as any).items.length > 0
            ) {
                return GoogleCalendarMapper.toDomain(
                    (response.data as any).items[0],
                    this.calendarId,
                );
            }

            throw new Error(
                'Google Calendar did not return event data after creation',
            );
        } catch (error) {
            this.logger.error('Error creating event in main calendar', error);
            throw error;
        }
    }

    // #endregion

    // #region deleteEvent

    /**
     * Deletes an event from the main calendar.
     * @param eventId The ID of the event to delete.
     */
    async deleteEvent(eventId: string): Promise<void> {
        this.logger.log(
            `Deleting event in main calendar: ${eventId} for user ${this.userEmail}`,
        );

        const oauth2Client = getUserGoogleAuth(this.userEmail);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        try {
            await calendar.events.delete({
                calendarId: this.calendarId,
                eventId,
            });
            this.logger.log(`Event deleted: ${eventId}`);
        } catch (error) {
            this.logger.error('Error deleting event in main calendar', error);
            throw error;
        }
    }

    // #endregion

    // #region mapToGoogleEvent

    /**
     * Maps a domain event to a Google Calendar event object.
     * @param event The domain event entity.
     * @returns Google Calendar event object.
     */
    private mapToGoogleEvent(event: Event): any {
        if (event.getIsAllDay()) {
            return {
                summary: event.getTitle(),
                description: event.getDescription(),
                location: event.getLocation(),
                start: {
                    date: event.getStart().value.toISOString().slice(0, 10),
                },
                end: {
                    date: event.getEnd().value.toISOString().slice(0, 10),
                },
            };
        }
        return {
            summary: event.getTitle(),
            description: event.getDescription(),
            location: event.getLocation(),
            start: {
                dateTime: event.getStart().value.toISOString(),
                timeZone: 'UTC',
            },
            end: {
                dateTime: event.getEnd().value.toISOString(),
                timeZone: 'UTC',
            },
        };
    }

    // #endregion
}

// #endregion
