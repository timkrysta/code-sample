import { config } from 'dotenv'; config();
import { Spot } from '@binance/connector';
import Big from 'big.js';
import { Assets } from '../../interfaces/AssetInterface';
import { TemporaryData } from '../../interfaces/TemporaryDataInterface';
import CryptoCompareService from '../CryptoCompareService';
import { Activity, Activities } from '../../interfaces/ActivityInterface';
import { TemporaryTransaction } from '../../interfaces/TemporaryTransactionInterface';
import { ExchangeService } from './ExchangeService';
import { getNameFromTicker } from '../../utils/CryptocurrencyUtils';

export default class BinanceExchangeService extends ExchangeService {
    protected exchangeName: string = 'Binance';

    static TRANSACTION_TYPE_DEPOSIT = 0;
    static TRANSACTION_TYPE_WITHDRAW = 1;

    static recvWindow = 5000; //max 60000

    spotClient;

    problemConnectingToBinnace = null;

    constructor(apiKey: string, apiSecret: string) {
        super();

        this.spotClient = new Spot(apiKey, apiSecret);

        try {
            this.checkAccountStatus();
        } catch (err) {
            throw err;
        }
    }

    public async getAllAssets(): Promise<Assets> {
        try {
            const baseCurrency = 'USD';
            const subAccountTypes = ['SPOT', 'MARGIN', 'FUTURES'];
            const promises = subAccountTypes.map(async (subAccountType) => {
                const allBinanceAssets = await this.fetchAllBinanceAssets(subAccountType);
                return allBinanceAssets;
            });

            const results = await Promise.all(promises);

            const savingsBalances = await this.getSavingsBalances();
            results.push(savingsBalances);

            let formattedResult = {};
            results.forEach((assetsOnSubAccount) => {
                if (!Array.isArray(assetsOnSubAccount)) {
                    return;
                }

                assetsOnSubAccount.forEach((asset) => {
                    const assetSymbol = asset.asset;
                    if (assetSymbol in formattedResult) {
                        // increment
                        formattedResult[assetSymbol] = {
                            free: formattedResult[assetSymbol]['free'].plus(new Big(asset.free ?? asset.amount ?? '0')),
                            locked: formattedResult[assetSymbol]['locked'].plus(new Big(asset.locked ?? '0')),
                        };
                    } else {
                        // set
                        formattedResult[assetSymbol] = {
                            free: new Big(asset.free ?? asset.amount ?? '0'),
                            locked: new Big(asset.locked ?? '0'),
                        };
                    }
                });
            });

            const allAssetSymbols = Object.keys(formattedResult);
            const multipleSymbolsPrice = await CryptoCompareService.getMultipleSymbolsPrice(allAssetSymbols, [baseCurrency]);

            for (let assetSymbol in formattedResult) {
                if (assetSymbol in multipleSymbolsPrice) {
                    const unitValues = multipleSymbolsPrice[assetSymbol];
                    formattedResult[assetSymbol]['unitValues'] = unitValues;

                    formattedResult[assetSymbol]['totalValues'] = {};
                    for (let currency in unitValues) {
                        formattedResult[assetSymbol]['totalValues'][currency] = new Big(formattedResult[assetSymbol].free).times(
                            new Big(unitValues[currency]),
                        );
                    }
                } else {
                    delete formattedResult[assetSymbol];
                }
            }

            const allAssets: Assets = await Promise.all(
                Object.entries(formattedResult).map(async ([key_assetSymbol, value_data]: [string, TemporaryData]) => {
                    const ticker = key_assetSymbol;
                    const name = await getNameFromTicker(ticker);

                    return this.makeAsset({
                        name: name,
                        symbol: ticker,
                        balance: value_data.free,
                        value: value_data.totalValues[baseCurrency],
                    });
                }),
            );

            return allAssets;
        } catch (err) {
            throw err;
        }
    }

    public getAllActivities(): Promise<Activities> {
        return new Promise<Activities>(async (resolve, reject) => {
            try {
                const fiatDepositHistory: TemporaryTransaction[] = await this.getFiatHistory(
                    BinanceExchangeService.TRANSACTION_TYPE_DEPOSIT,
                );

                const fiatWithdrawHistory: TemporaryTransaction[] = await this.getFiatHistory(
                    BinanceExchangeService.TRANSACTION_TYPE_WITHDRAW,
                );

                const fiatHistory: TemporaryTransaction[] = [...fiatDepositHistory, ...fiatWithdrawHistory];

                const allActivities: Activities = fiatHistory.map((transaction: TemporaryTransaction): Activity => {
                    const result: Activity = this.makeActivity({
                        action: (transaction.operation_type.charAt(0).toUpperCase() + transaction.operation_type.slice(1)) as
                            | 'Deposit'
                            | 'Withdraw',
                        amount: transaction.indicatedAmount,
                        currency: transaction.currency,
                        date: transaction.timestamp,
                        transactionType: transaction.method,
                        status: transaction.status,
                        details: {
                            raw: {
                                transactionable_name: transaction.transactionable_name,
                                timestamp: transaction.timestamp,
                                currency: transaction.currency,
                                value: transaction.value,
                                indicatedAmount: transaction.indicatedAmount,
                                totalFee: transaction.totalFee,
                                status: transaction.status,
                                method: transaction.method,
                                operation_type: transaction.operation_type,
                            },
                        },
                    });
                    return result;
                });

                resolve(allActivities);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Check account status
     */
    private async checkAccountStatus() {
        try {
            // https://binance.github.io/binance-connector-node/module-Wallet.html#accountStatus
            const response = await this.spotClient.accountStatus({
                recvWindow: BinanceExchangeService.recvWindow,
            });

            if (!response['data'] || response['data']['data'] !== 'Normal') {
                this.problemConnectingToBinnace = response;
            }
        } catch (err) {}
    }

    /**
     * Returns Balances of Spot & Savings account (without zero-valued positions)
     */
    private async getAllBalances() {
        try {
            const spotBalances = await this.getSpotBalances();
            const formattedSpotBalances = spotBalances.map((balance) => {
                return {
                    exchange_name: this.exchangeName,
                    sub_account: 'spot',
                    symbol: balance['asset'],
                    available: balance['free'],
                    locked: balance['locked'],
                };
            });

            const savingsBalances = await this.getSavingsBalances();
            const formattedSavingsBalances = savingsBalances.map((balance) => {
                return {
                    exchange_id: this.exchangeName,
                    sub_account: 'savings',
                    symbol: balance['asset'],
                    available: balance['amount'],
                };
            });

            const exchangeBalancesInsertData = [...formattedSpotBalances, ...formattedSavingsBalances];

            return exchangeBalancesInsertData;
        } catch (err) {
            throw err;
        }
    }

    private async getSpotBalances() {
        try {
            // https://binance.github.io/binance-connector-node/module-Trade.html#account
            const response = await this.spotClient.account({
                recvWindow: BinanceExchangeService.recvWindow,
            });

            if (!response['data']['balances']) return [];
            const balances = response['data']['balances'].filter((item) => {
                if (new Big(item['free']).eq(0) && new Big(item['locked']).eq(0)) {
                    return false;
                }
                return true;
            });
            return balances;
        } catch (err) {
            throw err;
        }
    }

    private async getSavingsBalances() {
        try {
            // https://binance.github.io/binance-connector-node/module-Savings.html#savingsAccount
            const response = await this.spotClient.savingsAccount({
                recvWindow: BinanceExchangeService.recvWindow,
            });

            if (!response['data']['positionAmountVos']) return [];
            const balances = response['data']['positionAmountVos'].filter((item) => !new Big(item['amount']).eq(0));
            return balances;
        } catch (err) {
            throw err;
        }
    }

    private async getFiatHistory(transactionType) {
        try {
            let operationType;

            if (transactionType === BinanceExchangeService.TRANSACTION_TYPE_DEPOSIT) {
                operationType = 'deposit';
            } else if (transactionType === BinanceExchangeService.TRANSACTION_TYPE_WITHDRAW) {
                operationType = 'withdraw';
            } else {
                return null;
            }

            // https://binance.github.io/binance-connector-node/module-Fiat.html#depositWithdrawalHistory
            const response = await this.spotClient.depositWithdrawalHistory(transactionType, {
                beginTime: 1230940800000, // 03.01.2009 (Bitcoin birth day) timestamp
                recvWindow: BinanceExchangeService.recvWindow,
            });

            if (!response['data'] || !response['data']['data']) {
                return null;
            }

            const depositHistory = response['data']['data'];
            let insertData = [];

            depositHistory.map((transaction) => {
                const timestamp = transaction['createTime'] / 1000;
                const date = new Date(timestamp * 1000);
                const formattedDate = this.formatDate(date);

                insertData.push({
                    transactionable_name: this.exchangeName,
                    timestamp: formattedDate,
                    currency: transaction['fiatCurrency'],
                    value: transaction['amount'],
                    indicatedAmount: transaction['indicatedAmount'],
                    totalFee: transaction['totalFee'],
                    status: transaction['status'],
                    method: transaction['method'],
                    operation_type: operationType,
                });
            });

            return insertData;
        } catch (err) {
            throw err;
        }
    }

    private async getAccountSnapshot(type = 'SPOT', limit = 30) {
        try {
            if (limit < 7 || limit > 30) {
                throw new Error('Param "limit" in getAccountSnapshot has to be 7 <= limit <= 30');
            }

            const allowedTypes = ['SPOT', 'MARGIN', 'FUTURES'];
            type = type.toUpperCase();

            if (!allowedTypes.includes(type)) {
                throw new Error('Param "type" in getAccountSnapshot is wrong, should be in: ' + allowedTypes.join(', '));
            }

            // https://binance.github.io/binance-connector-node/module-Wallet.html#accountSnapshot
            const response = await this.spotClient.accountSnapshot(type, {
                limit: limit,
                recvWindow: BinanceExchangeService.recvWindow,
            });

            if (!response['data']) return [];
            return response['data'];
        } catch (err) {
            if (err.response && err.response.status === 429) {
                throw err;
            } else if (err.response && err.response.data && err.response.data.code === -5011) {
                return [];
            } else {
                throw err;
            }
        }
    }

    private async fetchAllBinanceAssets(type = 'SPOT') {
        try {
            const response = await this.getAccountSnapshot(type);

            if (!response['snapshotVos']) {
                return [];
            }

            const latestSnapshot = response['snapshotVos'][response['snapshotVos'].length - 1];

            if (!latestSnapshot['data']) {
                return [];
            }

            if (new Big(latestSnapshot['data']['totalAssetOfBtc']).eq(0)) {
                return [];
            }

            if (!latestSnapshot['data']['balances']) {
                return [];
            }

            return latestSnapshot['data']['balances'].filter((asset) => {
                if (new Big(asset.free).eq(0) && new Big(asset.locked).eq(0)) {
                    return false;
                }
                return true;
            });
        } catch (err) {
            throw err;
        }
    }
}
