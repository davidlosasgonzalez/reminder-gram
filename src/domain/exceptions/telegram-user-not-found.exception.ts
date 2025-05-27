/**
 * @file TelegramUserNotFoundException
 * @description Exception for missing Telegram user.
 */

import { DomainException } from './domain.exception';

export class TelegramUserNotFoundException extends DomainException {
    constructor(userId: string) {
        super(`Telegram user with id ${userId} not found.`);
        this.name = 'TelegramUserNotFoundException';
    }
}
