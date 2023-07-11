import Big from 'big.js';
import KrakenClient from 'kraken-api';
import { Assets } from '../../interfaces/AssetInterface';
import {
    KrakenDepositAndWithdrawStatus,
    KrakenDepositAndWithdrawStatusResponse,
    KrakenResponse,
    KrakenTrade,
    KrakenTradesHistoryResponse,
} from '../../interfaces/KrakenResponseInterface';
import { ExchangeService } from './ExchangeService';
import { Activities } from '../../interfaces/ActivityInterface';
import CryptoCompareService from '../CryptoCompareService';
import { timestampToDate } from '../../utils/Misc';
import { gracefullyHandleCatchedError } from '../../utils/gracefullyHandleCatchedError';
import { getNameFromTicker } from '../../utils/CryptocurrencyUtils';

export default class KrakenExchangeService extends ExchangeService {
    protected exchangeName: string = 'Kraken';

    krakenClient;

    problemConnectingToBinnace = null;

    constructor(apiKey: string, apiSecret: string) {
        super();

        this.krakenClient = new KrakenClient(apiKey, apiSecret);
    }

    public async getAllAssets(baseCurrency = 'USD'): Promise<Assets> {
        try {
            const responseBody: KrakenResponse = await this.krakenClient.api('Balance');

            if (responseBody.error.length > 0) {
                return [];
            }

            if (Object.keys(responseBody.result).length < 0) {
                return [];
            }

            const allAssetSymbols = Object.keys(responseBody.result);
            const multipleSymbolsPrice = await CryptoCompareService.getMultipleSymbolsPrice(allAssetSymbols, [baseCurrency]);

            const allAssets: Assets = [];
            for (const ticker in responseBody.result) {
                const balance: string = responseBody.result[ticker];
                const name = await getNameFromTicker(ticker);

                let value = new Big(0);

                if (multipleSymbolsPrice[ticker] && multipleSymbolsPrice[ticker][baseCurrency]) {
                    value = new Big(balance).mul(new Big(multipleSymbolsPrice[ticker][baseCurrency]));
                }

                allAssets.push(this.makeAsset({
                    name: name,
                    symbol: ticker,
                    balance: new Big(balance),
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
            const getDeposits = async () => {
                try {
                    const allActivities = [];

                    const responseBody: KrakenDepositAndWithdrawStatusResponse = await this.krakenClient.api('DepositStatus');

                    if (responseBody.error.length > 0) {
                        return [];
                    }

                    if (Object.keys(responseBody.result).length < 0) {
                        return [];
                    }

                    responseBody.result.forEach((deposit: KrakenDepositAndWithdrawStatus) => {
                        const date = timestampToDate(deposit.time);

                        allActivities.push(this.makeActivity({
                            action: 'Deposit',
                            amount: new Big(deposit.amount),
                            currency: deposit.asset,
                            date: this.formatDate(date),
                            transactionType: 'txid: ' + deposit.txid,
                            status: deposit.status,
                            details: {
                                raw: deposit,
                            },
                        }));
                    });

                    return allActivities;
                } catch (err) {
                    gracefullyHandleCatchedError(err);
                }
            };

            const getWithdraws = async () => {
                try {
                    const allActivities = [];
                    const withdrawResponseBody: KrakenDepositAndWithdrawStatusResponse = await this.krakenClient.api(
                        'WithdrawStatus',
                    );

                    if (withdrawResponseBody.error.length > 0) {
                        return [];
                    }

                    if (Object.keys(withdrawResponseBody.result).length < 0) {
                        return [];
                    }

                    withdrawResponseBody.result.forEach((withdraw: KrakenDepositAndWithdrawStatus) => {
                        const date = timestampToDate(withdraw.time);

                        allActivities.push(this.makeActivity({
                            action: 'Withdraw',
                            amount: new Big(withdraw.amount),
                            currency: withdraw.asset,
                            date: this.formatDate(date),
                            transactionType: 'txid: ' + withdraw.txid,
                            status: withdraw.status,
                            details: {
                                raw: withdraw,
                            },
                        }));
                    });

                    return allActivities;
                } catch (err) {
                    gracefullyHandleCatchedError(err);
                }
            };

            const getTrades = async () => {
                try {
                    const allActivities = [];
                    const tradeResponseBody: KrakenTradesHistoryResponse = await this.krakenClient.api('TradesHistory');

                    if (tradeResponseBody.error.length > 0) {
                        return [];
                    }

                    if (tradeResponseBody.result.count <= 0) {
                        return [];
                    }

                    for (const transactionId in tradeResponseBody.result.trades) {
                        const trade: KrakenTrade = tradeResponseBody.result.trades[transactionId];

                        const date = timestampToDate(trade.time);

                        allActivities.push(this.makeActivity({
                            action: 'Trade',
                            amount: new Big(trade.price),
                            currency: trade.pair,
                            date: this.formatDate(date),
                            transactionType: `Pair: ${trade.pair} | Price: ${trade.price} | Order type: ${trade.ordertype}`,
                            status: trade.posstatus,
                            details: {
                                ordertxid: trade.ordertxid,
                                postxid: trade.postxid,
                                pair: trade.pair,
                                time: trade.time,
                                type: trade.type,
                                ordertype: trade.ordertype,
                                price: trade.price,
                                cost: trade.cost,
                                fee: trade.fee,
                                vol: trade.vol,
                                margin: trade.margin,
                                leverage: trade.leverage,
                                misc: trade.misc,
                                trade_id: trade.trade_id,
                                posstatus: trade.posstatus,
                                cprice: trade.cprice,
                                ccost: trade.ccost,
                                cfee: trade.cfee,
                                cvol: trade.cvol,
                                cmargin: trade.cmargin,
                                net: trade.net,
                                trades: trade.trades,
                            },
                        }));
                    }

                    return allActivities;
                } catch (err) {
                    gracefullyHandleCatchedError(err);
                }
            };

            const allActivities = [
                ...(await getDeposits()),
                ...(await getWithdraws()),
                ...(await getTrades()),
            ];

            return allActivities;
        } catch (err) {
            throw err;
        }
    }
}
