import { config } from 'dotenv'; config();
import { Activities } from '../interfaces/ActivityInterface';
import { Asset, Assets } from '../interfaces/AssetInterface';
import { IUserDocument } from '../model/UserModel';
import { Exchange } from '../interfaces/ExchangeInterface';
import { Wallet } from '../interfaces/WalletInterface';
import { Activity } from '../interfaces/ActivityInterface';
import { BLOCKCHAIN_SERVICES, ENABLED_BLOCKCHAINS, ENABLED_EXCHANGES, EXCHANGE_SERVICES, shouldSkipProcessingExchange, shouldSkipProcessingWallet } from '../config/Main';
import { ExchangeService } from './exchanges/ExchangeService';
import { gracefullyHandleCatchedError } from '../utils/gracefullyHandleCatchedError';

export class ChartService {
    public static async getActivitiesData(user: IUserDocument, sortOrder: 'asc' | 'desc' = 'desc'): Promise<Activities> {
        const processExchange = async (service: ExchangeService): Promise<Activities> => {
            try {
                return await service.getAllActivities();
            } catch (err) {
                gracefullyHandleCatchedError(err);
            }
        };

        const processExchanges = async (exchanges: Exchange[]): Promise<Activities> => {
            try {
                const activities: Activities = [];

                for (const exchange of exchanges) {
                    if (shouldSkipProcessingExchange(exchange)) continue;

                    const ExchangeService = EXCHANGE_SERVICES[exchange.name];
                    if (!ExchangeService || !ENABLED_EXCHANGES[exchange.name]) continue;

                    const exchangeService = new ExchangeService(exchange.apiKey, exchange.apiSecret);
                    const allActivitiesOfAnExchange = await processExchange(exchangeService);

                    if (allActivitiesOfAnExchange) {
                        activities.push(...allActivitiesOfAnExchange);
                    }
                }

                return activities;
            } catch (err) {
                throw err;
            }
        };

        const processWallets = async (wallets: Wallet[]): Promise<Activities> => {
            try {
                const activities: Activities = [];

                for (const wallet of wallets) {
                    if (shouldSkipProcessingWallet(wallet)) continue;

                    const BlockchainService = BLOCKCHAIN_SERVICES[wallet.type];
                    if (!BlockchainService || !ENABLED_BLOCKCHAINS[wallet.type]) continue;
                    const service = new BlockchainService(wallet);

                    activities.push(...(await service.getAllActivities()));
                }

                return activities;
            } catch (err) {
                throw err;
            }
        };

        const compareFn = (a: Activity, b: Activity): number => {
            const timestampA = new Date(a.date).getTime();
            const timestampB = new Date(b.date).getTime();

            if (sortOrder === 'asc') {
                return timestampA - timestampB;
            }
            return timestampB - timestampA;
        };

        return new Promise<Activities>(async (resolve, reject) => {
            try {
                const activities: Activities = [
                    ...(await processExchanges(user.exchanges)),
                    ...(await processWallets(user.wallets)),
                ];

                activities.sort(compareFn);

                resolve(activities);
            } catch (err) {
                reject(err);
            }
        });
    }

    public static async getAssetListData(user: IUserDocument): Promise<Assets> {
        const processExchange = async (service: ExchangeService): Promise<Assets> => {
            try {
                return await service.getAllAssets();
            } catch (err) {
                gracefullyHandleCatchedError(err);
            }
        };

        const processExchanges = async (exchanges: Exchange[]): Promise<Assets> => {
            try {
                const assets: Assets = [];

                for (const exchange of exchanges) {
                    if (shouldSkipProcessingExchange(exchange)) continue;

                    const ExchangeService = EXCHANGE_SERVICES[exchange.name];
                    if (!ExchangeService || !ENABLED_EXCHANGES[exchange.name]) continue;

                    const exchangeService = new ExchangeService(exchange.apiKey, exchange.apiSecret);
                    const allActivitiesOfAnExchange = await processExchange(exchangeService);

                    if (allActivitiesOfAnExchange) {
                        assets.push(...allActivitiesOfAnExchange);
                    }
                }

                return assets;
            } catch (err) {
                throw err;
            }
        };

        const processWallets = async (wallets: Wallet[]): Promise<Assets> => {
            try {
                const assets: Assets = [];

                for (const wallet of wallets) {
                    if (shouldSkipProcessingWallet(wallet)) continue;

                    const BlockchainService = BLOCKCHAIN_SERVICES[wallet.type];
                    if (!BlockchainService || !ENABLED_BLOCKCHAINS[wallet.type]) continue;
                    const service = new BlockchainService(wallet);

                    assets.push(...(await service.getAllAssets()));
                }

                return assets;
            } catch (err) {
                throw err;
            }
        };

        return new Promise<Assets>(async (resolve, reject) => {
            try {
                const assets: Assets = [...(await processExchanges(user.exchanges)), ...(await processWallets(user.wallets))];

                resolve(assets);
            } catch (err) {
                reject(err);
            }
        });
    }
}
