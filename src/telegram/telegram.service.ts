import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { OpenAI } from 'openai';

@Injectable()
export class TelegramService implements OnModuleInit {
    private openAi: OpenAI;

    constructor(@Inject('TELEGRAM_BOT') private readonly bot: Telegraf) {
        const configuration = {
            apiKey: process.env.OPENAI_API_KEY,
        };
        this.openAi = new OpenAI(configuration);
    }

    onModuleInit() {
        this.bot.start((ctx) => {
            ctx.reply('Привет! Я простой бот, задавайте вопросы!');
        });

        this.bot.on('text', async (ctx) => {
            const userMessage = ctx.message.text;
            const triggers = ['чат', 'бот', 'кореш'];

            // проверяем, начинается ли сообщение с одного из ключевых слов
            if (
                !triggers.some((trigger) =>
                    userMessage.toLowerCase().startsWith(trigger),
                )
            ) {
                return; // игнорируем сообщения, не соответствующие ключевым словам
            }

            // Убираем ключевое слово и пробелы
            const trigger = triggers.find((t) =>
                userMessage.toLowerCase().startsWith(t),
            )!;
            const trimmedMessage = userMessage.slice(trigger.length).trim();

            try {
                const completion = await this.openAi.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant.',
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
            } catch {
                await ctx.reply('Произошла ошибка при запросе к OpenAI!');
            }
        });

        this.bot.launch().catch(() => console.error('Ошибка запуска бота'));
    }
}
