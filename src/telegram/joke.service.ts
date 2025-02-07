import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class JokeService {
    async getJoke(): Promise<{ category: string; content: string }> {
        try {
            const response = await axios.get<{
                category: string;
                content: string;
            }>('https://jokesrv.fermyon.app');
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Ошибка получения шутки: ${error.message}`);
            }
            throw new Error('Ошибка получения шутки');
        }
    }
}
