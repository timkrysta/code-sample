import axios, { AxiosResponse } from 'axios';
import { buildQueryString } from '../utils/buildQueryString';

export default class CoinGeckoService {
    static BASE_ENDPOINT = 'https://api.coingecko.com/api/v3';

    static async getBitcoinHistoricalPrices(baseCurrency: string, days: number = 7, interval: 'daily' = 'daily') {
        try {
            const endpoint = '/coins/bitcoin/market_chart';

            const queryParams = {
                vs_currency: baseCurrency.toLowerCase(),
                days: days,
                interval: interval,
            };

            const response = await CoinGeckoService.makeApiCall(endpoint, queryParams);
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    static async makeApiCall(endpoint: string, queryParams = {}): Promise<AxiosResponse<any, any>> {
        try {
            const url = CoinGeckoService.BASE_ENDPOINT + endpoint + '?' + buildQueryString(queryParams);

            const response = await axios.get(url);

            return response;
        } catch (err) {
            throw err;
        }
    }
}
