import { Types } from 'mongoose';

export interface Exchange {
    name: 'Binance' | 'Kraken' | string;
    apiKey: string;
    apiSecret?: string;
    _id: Types.ObjectId;
    passPhrase: string;
    isActive: boolean;
}
