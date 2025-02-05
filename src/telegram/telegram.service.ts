import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { OpenAI } from 'openai';
import { AutoResponderService } from './autoResponder.service';

@Injectable()
export class TelegramService implements OnModuleInit {
    constructor(
        @Inject('TELEGRAM_BOT') private readonly bot: Telegraf,
        @Inject('OPENAI_CLIENT') private readonly openAi: OpenAI,
        private readonly autoResponderService: AutoResponderService,
    ) {}

    onModuleInit() {
        this.bot.start((ctx) => {
            ctx.reply('Привет! Я простой бот, задавайте вопросы!');
        });

        this.bot.on('text', async (ctx) => {
            const userMessage = ctx.message.text;
            const lowerCaseMsg = userMessage.toLowerCase();
            const triggers = ['чат', 'бот', 'кореш'];

            // Проверка явных триггеров
            const trigger = triggers.find((t) => lowerCaseMsg.startsWith(t));
            if (trigger) {
                const trimmedMessage = userMessage.slice(trigger.length).trim();
                try {
                    const completion =
                        await this.openAi.chat.completions.create({
                            model: 'gpt-4o-mini',
                            messages: [
                                {
                                    role: 'system',
                                    content: `Ты — ассистент. Отвечай коротко, на русском языке.`,
                                },
                                {
                                    role: 'user',
                                    content: trimmedMessage,
                                },
                            ],
                            store: true,
                        });
                    const openAiReply =
                        completion.choices[0]?.message?.content ||
                        'Ответ не найден.';
                    await ctx.reply(openAiReply);
                } catch (err) {
                    console.error('Ошибка запроса к OpenAI:', err);
                    await ctx.reply('Произошла ошибка при запросе к OpenAI!');
                }
                return;
            }

            // если сообщение не соответствует явному триггеру, пробуем автоответ
            const autoReply =
                await this.autoResponderService.tryAutoResponse(userMessage);
            if (autoReply) {
                await ctx.reply(autoReply);
            }
        });

        this.bot
            .launch()
            .catch((err) => console.error('Ошибка запуска бота:', err));
    }
}
