/**
 * @file UnauthorizedEventAccessException
 * @description Exception for unauthorized event access.
 */

import { DomainException } from './domain.exception';

export class UnauthorizedEventAccessException extends DomainException {
    constructor(eventId: string) {
        super(`Unauthorized access to event: ${eventId}`);
        this.name = 'UnauthorizedEventAccessException';
    }
}
