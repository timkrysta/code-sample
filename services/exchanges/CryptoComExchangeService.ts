import Big from 'big.js';
import { Assets } from '../../interfaces/AssetInterface';
import { ExchangeService } from './ExchangeService';
import { Activities } from '../../interfaces/ActivityInterface';
import { gracefullyHandleCatchedError } from '../../utils/gracefullyHandleCatchedError';
import { CryptoComRestClient } from '../../utils/CryptoComRestClient';
import {
    CryptoComResponse_Transactions,
    CryptoComResponse_UserBalance,
    CryptoComTransaction,
} from '../../interfaces/CryptoComInterfaces';
import { getNameFromTicker } from '../../utils/CryptocurrencyUtils';

export default class CryptoComExchangeService extends ExchangeService {
    protected exchangeName: string = 'CryptoCom';

    client: CryptoComRestClient;

    constructor(apiKey: string, apiSecret: string) {
        super();

        this.client = new CryptoComRestClient(apiKey, apiSecret);
    }

    public async getAllAssets(baseCurrency = 'USD'): Promise<Assets> {
        try {
            const response = await this.client.userBalance();
            const data: CryptoComResponse_UserBalance = await response.json();

            if (data.result.data.length < 1) {
                return [];
            }

            if (data.result.data[0].position_balances.length < 1) {
                return [];
            }

            const allAssets: Assets = [];
            for (const positionBalance of data.result.data[0].position_balances) {
                const ticker = positionBalance.instrument_name;
                const name = await getNameFromTicker(ticker);

                allAssets.push(this.makeAsset({
                    name: name,
                    symbol: ticker,
                    balance: new Big(positionBalance.quantity),
                    value: new Big(positionBalance.market_value),
                }));
            }

            return allAssets;
        } catch (err) {
            throw err;
        }
    }

    public async getAllActivities(): Promise<Activities> {
        try {
            const getTransactions = async () => {
                try {
                    const allActivities = [];

                    const response = await this.client.getTransactions();
                    const data: CryptoComResponse_Transactions = await response.json();

                    if (data.result.data.length < 1) {
                        return [];
                    }

                    data.result.data.forEach((transaction: CryptoComTransaction) => {
                        allActivities.push(this.makeActivity({
                            action: transaction.journal_type,
                            amount: new Big(transaction.transaction_qty),
                            currency: transaction.instrument_name,
                            date: this.formatDate(new Date(transaction.event_timestamp_ms)),
                            transactionType: transaction.side,
                            status: 'TODO(tim): unknown',
                            details: {
                                raw: {
                                    account_id: transaction.account_id,
                                    event_date: transaction.event_date,
                                    journal_type: transaction.journal_type,
                                    journal_id: transaction.journal_id,
                                    transaction_qty: transaction.transaction_qty,
                                    transaction_cost: transaction.transaction_cost,
                                    realized_pnl: transaction.realized_pnl,
                                    order_id: transaction.order_id,
                                    trade_id: transaction.trade_id,
                                    trade_match_id: transaction.trade_match_id,
                                    event_timestamp_ms: transaction.event_timestamp_ms,
                                    event_timestamp_ns: transaction.event_timestamp_ns,
                                    client_oid: transaction.client_oid,
                                    taker_side: transaction.taker_side,
                                    side: transaction.side,
                                    instrument_name: transaction.instrument_name,
                                },
                            },
                        }));
                    });

                    return allActivities;
                } catch (err) {
                    gracefullyHandleCatchedError(err);
                }
            };

            const allActivities = [...(await getTransactions())];

            return allActivities;
        } catch (err) {
            throw err;
        }
    }
}
