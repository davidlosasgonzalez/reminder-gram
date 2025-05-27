/**
 * @file telegram.module
 * @description Telegram presentation module for conversational bot integration.
 */

import { Module } from '@nestjs/common';
import { MessageProcessorService } from '@/presentation/telegram/services/message-processor.service';
import { EventAdapter } from '@/application/adapters/event.adapter';
import { CreateEventUseCase } from '@/application/use-cases/events/create-event.use-case';
import { LlmModule } from '@/infrastructure/external-services/llm/llm.module';
import { EvaluateMessageService } from '@/infrastructure/external-services/llm/services/evaluate-message.service';
import { ResolveIntentService } from '@/infrastructure/external-services/llm/services/resolve-intent.service';
import { ClarifyAnyService } from '@/infrastructure/external-services/llm/services/clarify-any.service';
import { EVENT_PORT } from '@/infrastructure/persistence/repositories/repository.tokens';
import { EventRepository } from '@/domain/repositories/event.repository.interface';
import { CalendarPersistenceModule } from '@/infrastructure/persistence/calendar/calendar-persistence.module';
import { ConfirmIntentService } from '@/infrastructure/external-services/llm/services/confirm-intent.service';
import { DeleteEventService } from '@/infrastructure/external-services/llm/services/delete-event.service';
import { BaseTelegramService } from '@/infrastructure/external-services/telegram/services/base-telegram.service';

@Module({
    imports: [LlmModule, CalendarPersistenceModule],
    providers: [
        {
            provide: CreateEventUseCase,
            useFactory: (eventRepository: EventRepository) =>
                new CreateEventUseCase(eventRepository),
            inject: [EVENT_PORT],
        },
        EventAdapter,
        MessageProcessorService,
        EvaluateMessageService,
        ResolveIntentService,
        ClarifyAnyService,
        ConfirmIntentService,
        DeleteEventService,
        BaseTelegramService,
    ],
    exports: [MessageProcessorService, EventAdapter, BaseTelegramService],
})
export class TelegramModule {}
