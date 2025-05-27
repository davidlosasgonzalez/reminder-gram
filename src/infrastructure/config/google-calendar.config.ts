/**
 * Configuration for Google Calendar service
 *
 * This configuration class provides:
 * - Default calendar ID
 * - Required OAuth scopes
 * - Other Google Calendar specific settings
 */
export class GoogleCalendarConfig {
    /**
     * The default calendar ID to use for operations
     */
    readonly defaultCalendarId: string = 'primary';

    /**
     * The required OAuth scopes for Google Calendar API
     */
    readonly requiredScopes: string[] = [
        'https://www.googleapis.com/auth/calendar',
    ];

    /**
     * Time zone to use for calendar operations
     */
    readonly timeZone: string = 'UTC';

    /**
     * Maximum number of events to retrieve in a single request
     */
    readonly maxResults: number = 100;
}
