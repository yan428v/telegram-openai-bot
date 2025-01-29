import { Telegraf } from 'telegraf';

export const TelegramBotProvider = {
    provide: 'TELEGRAM_BOT',
    useFactory: () => {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            throw new Error('TELEGRAM_BOT_TOKEN is not defined');
        }
        return new Telegraf(botToken);
    },
};
