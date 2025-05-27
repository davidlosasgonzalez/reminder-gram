/**
 * @file calendar.tokens
 * @description Dependency injection tokens for calendar and telegram services.
 */

/**
 * Injection token for the CalendarService implementation.
 */
export const CALENDAR_SERVICE = Symbol('CALENDAR_SERVICE');

/**
 * Injection token for the TelegramService implementation.
 */
export const TELEGRAM_SERVICE = Symbol('TELEGRAM_SERVICE');
