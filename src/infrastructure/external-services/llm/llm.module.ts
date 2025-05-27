/**
 * @file llm.module
 * @description Infrastructure module for LLM services integration.
 */

import { Module } from '@nestjs/common';
import { EvaluateMessageService } from './services/evaluate-message.service';
import { ResolveIntentService } from './services/resolve-intent.service';
import { ClarifyAnyService } from './services/clarify-any.service';
import { ConfirmIntentService } from './services/confirm-intent.service';
import { DeleteEventService } from './services/delete-event.service';

/**
 * LLM Module for registering all conversational AI services.
 */
@Module({
    providers: [
        EvaluateMessageService,
        ResolveIntentService,
        ClarifyAnyService,
        ConfirmIntentService,
        DeleteEventService,
    ],
    exports: [
        EvaluateMessageService,
        ResolveIntentService,
        ClarifyAnyService,
        ConfirmIntentService,
        DeleteEventService,
    ],
})
export class LlmModule {}
