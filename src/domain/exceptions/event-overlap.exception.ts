/**
 * @file EventOverlapException
 * @description Exception for overlapping events.
 */

import { DomainException } from './domain.exception';

export class EventOverlapException extends DomainException {
    constructor() {
        super('Event overlaps with another event.');
        this.name = 'EventOverlapException';
    }
}
