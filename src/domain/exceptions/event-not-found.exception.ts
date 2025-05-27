/**
 * @file EventNotFoundException
 * @description Exception for missing event.
 */

import { DomainException } from './domain.exception';

export class EventNotFoundException extends DomainException {
    constructor(eventId: string) {
        super(`Event with id ${eventId} not found.`);
        this.name = 'EventNotFoundException';
    }
}
