/**
 * Value Object for handling dates
 * This class ensures that dates are handled consistently throughout the application
 */
export class DateVO {
    private readonly _value: Date;

    constructor(value: Date | string) {
        this._value = value instanceof Date ? value : new Date(value);
        this.validate();
    }

    /**
     * Validates that the date is valid
     * @throws Error if the date is invalid
     */
    private validate(): void {
        if (isNaN(this._value.getTime())) {
            throw new Error('Invalid date');
        }
    }

    /**
     * Gets the date value
     */
    get value(): Date {
        return new Date(this._value);
    }

    /**
     * Converts the date to ISO string
     */
    toISOString(): string {
        return this._value.toISOString();
    }

    /**
     * Converts the date to string
     */
    toString(): string {
        return this._value.toISOString();
    }

    /**
     * Creates a new DateVO instance from a string or Date
     */
    static create(value: Date | string): DateVO {
        return new DateVO(value);
    }

    /**
     * Checks if two dates are equal
     */
    equals(other: DateVO): boolean {
        return this._value.getTime() === other._value.getTime();
    }

    /**
     * Checks if this date is before another date
     */
    isBefore(other: DateVO): boolean {
        return this._value.getTime() < other._value.getTime();
    }

    /**
     * Checks if this date is after another date
     */
    isAfter(other: DateVO): boolean {
        return this._value.getTime() > other._value.getTime();
    }
}
