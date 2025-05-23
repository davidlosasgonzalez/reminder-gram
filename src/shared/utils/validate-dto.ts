import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

/**
 * Validates a plain object against the provided DTO class.
 *
 * @param dtoClass - The class constructor of the DTO.
 * @param raw - The raw object to validate.
 * @returns A validated instance of the DTO or null if invalid.
 */
export async function validateDto<T>(
    dtoClass: new () => T,
    raw: unknown,
): Promise<T | null> {
    const instance = plainToInstance(dtoClass, raw);
    const errors = await validate(instance as object, {
        whitelist: true,
        forbidNonWhitelisted: true,
    });

    return errors.length === 0 ? instance : null;
}
