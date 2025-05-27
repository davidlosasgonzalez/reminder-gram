/**
 * @file DomainException
 * @description Base class for domain exceptions.
 */

export class DomainException extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, DomainException.prototype);
        this.name = 'DomainException';
    }
}
