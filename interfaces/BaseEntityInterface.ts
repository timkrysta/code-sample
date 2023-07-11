import { OriginType } from '../enums/OriginType';

export interface BaseEntity {
    id: string;
    originType: OriginType;
    originName:
        | 'Binance'
        | 'Coinbase'
        | 'Kraken'
        | 'Kucoin'
        | 'OKX'
        | 'Bybit'
        | 'Bitstamp'
        | 'Gateio'
        | 'BinanceUS'
        | 'LBank'
        | 'BitFlyer'
        | 'Bithumb'
        | 'Bitget'
        | 'Gemini'
        | 'Mexc'
        | 'Bkex'
        | 'Huobi'
        | string;
}
