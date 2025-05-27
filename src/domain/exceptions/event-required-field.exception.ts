/**
 * @file EventRequiredFieldException
 * @description Exception for missing required event fields.
 */

import { DomainException } from './domain.exception';

export class EventRequiredFieldException extends DomainException {
    constructor(field: string) {
        super(`Event required field missing: ${field}`);
        this.name = 'EventRequiredFieldException';
    }
}
