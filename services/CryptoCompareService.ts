import { buildQueryString } from '../utils/buildQueryString';

interface MultipleSymbolsPrice {
    [ticker: string]: {
        [fiatTicker: string]: number;
    };
}

export default class CryptoCompareService {
    static BASE_ENDPOINT = 'https://min-api.cryptocompare.com';

    /**
     * Get Single Symbol Price
     */
    static async getSingleSymbolPrice(fromSymbol: string, toSymbols: string[]): Promise<any> {
        try {
            const endpoint = '/data/price';

            const queryParams = {
                fsyms: fromSymbol,
                tsyms: toSymbols.join(','),
            };

            const response = await CryptoCompareService.makeApiCall(endpoint, queryParams);
            return await response.json();
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get Multiple Symbols Price
     *
     * Format:
     * [
     *     "BNB" => array:1 [▼
     *         "EUR" => 289.68
     *     ]
     *     "USDT" => array:1 [▼
     *         "EUR" => 0.9246
     *     ]
     * ]
     */
    static async getMultipleSymbolsPrice(fromSymbols: string[], toSymbols: string[]): Promise<MultipleSymbolsPrice> {
        try {
            const endpoint = '/data/pricemulti';

            const queryParams = {
                fsyms: fromSymbols.join(','),
                tsyms: toSymbols.join(','),
            };

            const response = await CryptoCompareService.makeApiCall(endpoint, queryParams);
            return await response.json();
        } catch (err) {
            throw err;
        }
    }

    static async makeApiCall(endpoint: string, queryParams = {}): Promise<Response> {
        try {
            const url = CryptoCompareService.BASE_ENDPOINT + endpoint + '?' + buildQueryString(queryParams);
            const response = await fetch(url);
            return response;
        } catch (err) {
            throw err;
        }
    }
}
