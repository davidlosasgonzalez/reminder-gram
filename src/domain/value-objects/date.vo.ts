/**
 * @file DateVO
 * @description Value Object for handling dates.
 */

// #region DateVO
export class DateVO {
    public readonly value: Date;

    /**
     * Creates a new DateVO instance.
     * @param value Date or string representation of date.
     */
    constructor(value: Date | string) {
        this.value = value instanceof Date ? value : new Date(value);
        this.validate();
    }

    // #region Validation
    private validate(): void {
        if (isNaN(this.value.getTime())) {
            throw new Error('Invalid date');
        }
    }
    // #endregion

    // #region Methods
    toISOString(): string {
        return this.value.toISOString();
    }

    toString(): string {
        return this.value.toISOString();
    }

    static create(value: Date | string): DateVO {
        return new DateVO(value);
    }

    equals(other: DateVO): boolean {
        return this.value.getTime() === other.value.getTime();
    }

    isBefore(other: DateVO): boolean {
        return this.value.getTime() < other.value.getTime();
    }

    isAfter(other: DateVO): boolean {
        return this.value.getTime() > other.value.getTime();
    }
    // #endregion
}
// #endregion
