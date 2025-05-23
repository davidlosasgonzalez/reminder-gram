import {
    ArgumentMetadata,
    BadRequestException,
    Injectable,
    PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ensureValidatableObject } from '@/shared/utils/ensure-validatable-object';

/**
 * Global validation pipe that handles all DTO validations in the application.
 *
 * This pipe:
 * - Transforms plain objects to class instances
 * - Validates objects using class-validator
 * - Provides detailed validation error messages
 * - Whitelists properties to prevent injection
 *
 * Validation error format:
 * {
 *   message: string,
 *   errors: Array<{
 *     property: string,
 *     constraints: Record<string, string>
 *   }>
 * }
 */
@Injectable()
export class GlobalValidationPipe implements PipeTransform {
    async transform<T = unknown>(
        value: T,
        metadata: ArgumentMetadata,
    ): Promise<T> {
        if (!metadata.metatype || !this.toValidate(metadata.metatype)) {
            return value;
        }

        const object = plainToInstance(metadata.metatype, value);
        const validatableObject = ensureValidatableObject(object);
        const errors = await validate(validatableObject, {
            whitelist: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: false,
            validationError: {
                target: false,
                value: false,
            },
        });

        if (errors.length > 0) {
            const formattedErrors = errors.map((err) => ({
                property: err.property,
                constraints: err.constraints,
                value: err.value,
            }));

            throw new BadRequestException({
                message: 'Error de validación',
                errors: formattedErrors,
            });
        }

        return object;
    }

    /**
     * Checks if the given type should be validated.
     * Skips validation for primitive types and arrays of primitives.
     */
    private toValidate(metatype: Function): boolean {
        const types: Function[] = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }
}
