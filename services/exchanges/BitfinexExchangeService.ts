import Big from 'big.js';
import { Assets } from '../../interfaces/AssetInterface';
import { ExchangeService } from './ExchangeService';
import { Activities } from '../../interfaces/ActivityInterface';
import CryptoCompareService from '../CryptoCompareService';
import { gracefullyHandleCatchedError } from '../../utils/gracefullyHandleCatchedError';
import { RESTv2 } from 'bitfinex-api-node';
import { getNameFromTicker } from '../../utils/CryptocurrencyUtils';

export default class BitfinexExchangeService extends ExchangeService {
    protected exchangeName: string = 'Bitfinex';

    restClient;

    constructor(apiKey: string, apiSecret: string) {
        super();

        this.restClient = new RESTv2({
            apiKey,
            apiSecret,
            transform: true,
        });
    }

    public async getAllAssets(baseCurrency = 'USD'): Promise<Assets> {
        try {
            const wallets = await this.restClient.wallets();

            if (wallets.length < 1) {
                return [];
            }

            const allAssetSymbols = wallets.map((bitfinexAsset) => bitfinexAsset.currency);
            const multipleSymbolsPrice = await CryptoCompareService.getMultipleSymbolsPrice(allAssetSymbols, [baseCurrency]);

            const allAssets: Assets = [];

            for (const bitfinexAsset of wallets) {
                const ticker = bitfinexAsset.currency;
                const name = await getNameFromTicker(ticker);
                const balance = new Big(bitfinexAsset.balance);
                let value = new Big(0);

                if (multipleSymbolsPrice[ticker] && multipleSymbolsPrice[ticker][baseCurrency]) {
                    value = balance.mul(new Big(multipleSymbolsPrice[ticker][baseCurrency]));
                }

                allAssets.push(this.makeAsset({
                    name: name,
                    symbol: ticker,
                    balance: balance,
                    value: value,
                }));
            }

            return allAssets;
        } catch (err) {
            throw err;
        }
    }

    public async getAllActivities(): Promise<Activities> {
        try {
            const getTransfers = async () => {
                try {
                    const allActivities = [];
                    const movements = await this.restClient.movements();

                    if (movements.length < 1) {
                        return [];
                    }

                    movements.forEach((movement) => {
                        allActivities.push(this.makeActivity({
                            action: 'General Transfer',
                            amount: new Big(movement.amount),
                            currency: movement.currency,
                            date: this.formatDate(new Date(movement.mtsStarted)),
                            transactionType: `txid: ${movement.transactionId}`,
                            status: movement.status,
                            details: {
                                raw: {
                                    _events: movement._events,
                                    _eventsCount: movement._eventsCount,
                                    emptyFill: movement.emptyFill,
                                    _fields: movement._fields,
                                    _boolFields: movement._boolFields,
                                    id: movement.id,
                                    currency: movement.currency,
                                    currencyName: movement.currencyName,
                                    mtsStarted: movement.mtsStarted,
                                    mtsUpdated: movement.mtsUpdated,
                                    status: movement.status,
                                    amount: movement.amount,
                                    fees: movement.fees,
                                    destinationAddress: movement.destinationAddress,
                                    transactionId: movement.transactionId,
                                    note: movement.note,
                                },
                            },
                        }));
                    });

                    return allActivities;
                } catch (err) {
                    gracefullyHandleCatchedError(err);
                }
            };

            const allActivities = [...(await getTransfers())];

            return allActivities;
        } catch (err) {
            throw err;
        }
    }
}
