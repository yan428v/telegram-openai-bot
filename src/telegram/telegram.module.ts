import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TelegramBotProvider } from './telegram.provider';
import { TelegramService } from './telegram.service';
import { AutoResponderService } from './autoResponder.service';
import { OpenAIProvider } from './openai.provider';
import { JokeService } from './joke.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
    ],
    providers: [
        TelegramService,
        AutoResponderService,
        TelegramBotProvider,
        OpenAIProvider,
        JokeService,
    ],
})
export class TelegramModule {}
