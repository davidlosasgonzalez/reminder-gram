/**
 * @file CalendarNotFoundException
 * @description Exception for missing calendar.
 */

import { DomainException } from './domain.exception';

export class CalendarNotFoundException extends DomainException {
    constructor(calendarId: string) {
        super(`Calendar with id ${calendarId} not found.`);
        this.name = 'CalendarNotFoundException';
    }
}
