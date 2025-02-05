import { Inject, Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

interface ChatMessage {
    role: 'system' | 'user';
    content: string;
}

@Injectable()
export class AutoResponderService {
    private readonly contextSize = 3;
    private readonly historyLimit = 3; // минимальное количество сообщений которое должно быть в контексте для ответа
    private readonly replyProbability = 100; // вероятность автоответа в процентах
    private readonly cooldownDuration = 60 * 1000; // кулдаун в миллисекундах
    private readonly maxHistorySize = 5; // максимальное количество хранимых сообщений
    private lastResponseTime: number | null = null;
    private messageHistory: string[] = [];
    constructor(@Inject('OPENAI_CLIENT') private readonly openAi: OpenAI) {}

    async tryAutoResponse(newMessage: string) {
        // добавляем сообщение в историю, если оно заканчивается вопросительным знаком
        if (newMessage) {
            this.messageHistory.push(newMessage);

            console.log(this.messageHistory);

            //чистим историю до указанного в maxHistorySize значении
            while (this.messageHistory.length > this.maxHistorySize) {
                this.messageHistory.shift();
            }
        }

        // автоответ срабатывает только, если новое сообщение заканчивается знаком вопроса.
        if (!newMessage.trim().endsWith('?')) {
            return null;
        }

        // накопилось ли достаточное количество сообщений
        if (this.messageHistory.length < this.historyLimit) {
            return null;
        }

        // случайное срабатывание автоответа
        if (Math.random() * 100 >= this.replyProbability) {
            return null;
        }

        // проверка cooldown
        const now = Date.now();
        if (
            this.lastResponseTime &&
            now - this.lastResponseTime < this.cooldownDuration
        ) {
            return null;
        }
        // формируем массив сообщений с системным указанием и историей сообщений
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content:
                    'Ты отвечаешь не более чем в 50 слов, на русском языке. Используй накопленный контекст.',
            },

            // из всего контекста, берет только столько сообщений сколько contextSize
            ...this.messageHistory.slice(-this.contextSize).map(
                (msg): ChatMessage => ({
                    role: 'user',
                    content: msg,
                }),
            ),
        ];
        console.log(messages);
        try {
            const completion = await this.openAi.chat.completions.create({
                model: 'gpt-4o-mini',
                messages,
                store: true,
            });
            const reply =
                completion.choices[0]?.message?.content || 'Ответ не найден.';
            // обновляем время последнего ответа и очищаем историю
            this.lastResponseTime = now;
            this.messageHistory = [];
            return reply;
        } catch (error) {
            console.error('Ошибка при выполнении автоответа:', error);
            return null;
        }
    }
}
