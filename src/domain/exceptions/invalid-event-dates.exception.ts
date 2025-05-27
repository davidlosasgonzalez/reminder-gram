/**
 * @file InvalidEventDatesException
 * @description Exception for invalid event dates.
 */

import { DomainException } from './domain.exception';

export class InvalidEventDatesException extends DomainException {
    constructor() {
        super('Start date must be before end date.');
        this.name = 'InvalidEventDatesException';
    }
}
