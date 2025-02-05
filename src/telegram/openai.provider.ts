// openai.provider.ts
import { Provider } from '@nestjs/common';
import { OpenAI } from 'openai';

export const OpenAIProvider: Provider = {
    provide: 'OPENAI_CLIENT',
    useFactory: () => {
        const configuration = { apiKey: process.env.OPENAI_API_KEY };
        return new OpenAI(configuration);
    },
};
