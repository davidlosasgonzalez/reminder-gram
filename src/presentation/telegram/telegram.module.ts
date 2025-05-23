import { Module } from '@nestjs/common';
import { MessageProcessorService } from '@/presentation/telegram/services/message-processor.service';
import { EventAdapter } from '@/application/adapters/event.adapter';
import { CreateEventUseCase } from '@/application/use-cases/events/create-event.use-case';
import { UpdateEventUseCase } from '@/application/use-cases/events/update-event.use-case';
import { LlmModule } from '@/infrastructure/external/llm/llm.module';
import { EvaluateMessageService } from '@/infrastructure/external/llm/services/evaluate-message.service';
import { ResolveIntentService } from '@/infrastructure/external/llm/services/resolve-intent.service';
import { ClarifyAnyService } from '@/infrastructure/external/llm/services/clarify-any.service';
import { EVENT_REPOSITORY } from '@/infrastructure/persistence/repositories/repository.tokens';
import { IEventRepository } from '@/domain/interfaces/repositories/event.repository.interface';
import { CalendarPersistenceModule } from '@/infrastructure/persistence/calendar/calendar-persistence.module';
import { ConfirmIntentService } from '@/infrastructure/external/llm/services/confirm-intent.service';

/**
 * Telegram Module (Presentation Layer)
 *
 * Handles Telegram bot initialization, conversational message processing,
 * and integration with calendar/event adapters and LLM.
 */
@Module({
    imports: [LlmModule, CalendarPersistenceModule],
    providers: [
        {
            provide: CreateEventUseCase,
            useFactory: (eventRepository: IEventRepository) =>
                new CreateEventUseCase(eventRepository),
            inject: [EVENT_REPOSITORY],
        },
        {
            provide: UpdateEventUseCase,
            useFactory: (eventRepository: IEventRepository) =>
                new UpdateEventUseCase(eventRepository),
            inject: [EVENT_REPOSITORY],
        },
        EventAdapter,
        MessageProcessorService,
        EvaluateMessageService,
        ResolveIntentService,
        ClarifyAnyService,
        ConfirmIntentService,
    ],
    exports: [MessageProcessorService, EventAdapter],
})
export class TelegramModule {}
