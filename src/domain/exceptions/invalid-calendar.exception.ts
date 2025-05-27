/**
 * @file InvalidCalendarException
 * @description Exception for invalid calendar data.
 */

import { DomainException } from './domain.exception';

export class InvalidCalendarException extends DomainException {
    constructor() {
        super('Invalid calendar data.');
        this.name = 'InvalidCalendarException';
    }
}
