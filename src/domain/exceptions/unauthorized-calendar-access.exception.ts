/**
 * @file UnauthorizedCalendarAccessException
 * @description Exception for unauthorized calendar access.
 */

import { DomainException } from './domain.exception';

export class UnauthorizedCalendarAccessException extends DomainException {
    constructor(calendarId: string) {
        super(`Unauthorized access to calendar: ${calendarId}`);
        this.name = 'UnauthorizedCalendarAccessException';
    }
}
