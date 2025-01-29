import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TelegramBotProvider } from './telegram.provider';
import { TelegramService } from './telegram.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
    ],
    providers: [TelegramService, TelegramBotProvider],
})
export class TelegramModule {}
