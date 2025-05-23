import { Module } from '@nestjs/common';
import { EvaluateMessageService } from './services/evaluate-message.service';
import { ResolveIntentService } from './services/resolve-intent.service';
import { ClarifyAnyService } from './services/clarify-any.service';
import { ConfirmIntentService } from './services/confirm-intent.service';

@Module({
    providers: [
        EvaluateMessageService,
        ResolveIntentService,
        ClarifyAnyService,
        ConfirmIntentService,
    ],
    exports: [EvaluateMessageService, ResolveIntentService, ClarifyAnyService],
})
export class LlmModule {}
