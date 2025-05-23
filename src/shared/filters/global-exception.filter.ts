import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpExceptionBody,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter that handles all unhandled exceptions in the application.
 *
 * This filter:
 * - Handles HTTP exceptions with proper status codes and messages
 * - Handles non-HTTP exceptions with appropriate error responses
 * - Logs errors in development mode
 * - Provides consistent error response format
 *
 * Error response format:
 * {
 *   statusCode: number,
 *   message: string,
 *   error: string,
 *   timestamp: string,
 *   path: string,
 *   details?: any
 * }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();

        if (exception instanceof HttpException) {
            this.handleHttpException(exception, req, res);
        } else {
            this.handleUnknownException(exception, req, res);
        }
    }

    private handleHttpException(
        exception: HttpException,
        req: Request,
        res: Response,
    ): void {
        const status = exception.getStatus();
        const body = exception.getResponse();

        const parsedBody: Partial<HttpExceptionBody> =
            typeof body === 'string' ? { message: body } : (body as object);

        // Extract additional details if they exist in the response
        const additionalDetails =
            typeof body === 'object' && body !== null
                ? (body as Record<string, unknown>)
                : {};

        const response = {
            statusCode: status,
            message: parsedBody.message ?? 'Unexpected error',
            error: parsedBody.error ?? exception.name,
            timestamp: new Date().toISOString(),
            path: req.url,
            ...(Object.keys(additionalDetails).length > 0 && {
                details: additionalDetails,
            }),
        };

        this.logger.error(
            `HTTP Exception: ${response.message}`,
            exception.stack,
            req.url,
        );

        res.status(status).json(response);
    }

    private handleUnknownException(
        exception: unknown,
        req: Request,
        res: Response,
    ): void {
        const status = HttpStatus.INTERNAL_SERVER_ERROR;
        const err = exception as {
            message?: string;
            name?: string;
            stack?: string;
        };

        if (process.env.NODE_ENV === 'development') {
            this.logger.error(
                `Unhandled Exception: ${err.message}`,
                err.stack,
                req.url,
            );
        }

        const response = {
            statusCode: status,
            message: err.message || 'Error interno del servidor',
            error: err.name || 'InternalServerError',
            timestamp: new Date().toISOString(),
            path: req.url,
        };

        res.status(status).json(response);
    }
}
