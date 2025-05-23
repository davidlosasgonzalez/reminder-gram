import { NestFactory } from '@nestjs/core';
import * as morgan from 'morgan';
import { AppModule } from './app.module';
import { env } from './config/env/env.config';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { GlobalValidationPipe } from './shared/pipes/global-validation.pipe';

/**
 * Initializes and starts the NestJS application.
 */
async function bootstrap() {
    try {
        const app = await NestFactory.create(AppModule);

        app.useGlobalPipes(new GlobalValidationPipe());
        app.useGlobalFilters(new GlobalExceptionFilter());

        app.use(morgan('dev'));

        const port = env.PORT ?? 3000;
        await app.listen(port);

        console.log(`Backend started: http://localhost:${port}`);
    } catch (err) {
        console.error('Error during NestJS bootstrap:', err);
    }
}

void bootstrap();

/**
 * Handles uncaught exceptions.
 */
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

/**
 * Handles unhandled promise rejections.
 */
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});
