import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { calendar_v3, Auth } from 'googleapis';
import { GoogleCalendarConfig } from '@/infrastructure/external/calendar/config/google-calendar.config';

/**
 * Base Calendar Service
 *
 * Provides common functionality and authentication for Google Calendar services
 */
@Injectable()
export class BaseCalendarService {
    protected readonly calendar: calendar_v3.Calendar;
    protected readonly config: GoogleCalendarConfig;

    constructor(
        protected readonly configService: ConfigService,
        config: GoogleCalendarConfig,
    ) {
        this.config = config;
        const authClient = this.initializeAuth();
        this.calendar = new calendar_v3.Calendar({ auth: authClient });
    }

    /**
     * Initializes Google OAuth2 authentication
     * @private
     */
    protected initializeAuth(): Auth.GoogleAuth {
        return new Auth.GoogleAuth({
            credentials: {
                client_email: this.configService.get('GOOGLE_CLIENT_EMAIL'),
                private_key: this.configService.get('GOOGLE_PRIVATE_KEY'),
            },
            scopes: this.config.requiredScopes,
        });
    }
}
