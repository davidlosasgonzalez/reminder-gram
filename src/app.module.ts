import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Infrastructure Modules
import { CalendarModule } from './infrastructure/external/calendar/calendar.module';

// Presentation Modules
import { TelegramModule } from './presentation/telegram/telegram.module';

/**
 * Main application module
 *
 * This is the root module of the application that bootstraps all other modules.
 * It configures:
 * - Global configuration using ConfigModule
 * - Infrastructure modules for external services
 * - Presentation modules for user interfaces
 *
 * The module structure follows Clean Architecture principles with clear separation
 * of concerns between different layers of the application.
 */
@Module({
    imports: [
        // Global configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Infrastructure modules
        CalendarModule,

        // Presentation modules
        TelegramModule,
        // Add EventsModule here only if it exists:
        // EventsModule,
    ],
})
export class AppModule {}
