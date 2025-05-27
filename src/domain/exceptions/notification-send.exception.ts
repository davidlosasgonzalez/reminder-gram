/**
 * @file NotificationSendException
 * @description Exception for notification send failures.
 */

import { DomainException } from './domain.exception';

export class NotificationSendException extends DomainException {
    constructor(message?: string) {
        super(message || 'Failed to send notification.');
        this.name = 'NotificationSendException';
    }
}
