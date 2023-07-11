import { generateUUID } from '../../utils/generateUUID';
import { BaseProviderService } from '../BaseProviderService';
import { Asset } from '../../interfaces/AssetInterface';
import { Wallet } from '../../interfaces/WalletInterface';
import { Activity } from '../../interfaces/ActivityInterface';
import { OriginType } from '../../enums/OriginType';

export abstract class BlockchainService extends BaseProviderService {
    protected wallet: Wallet;
    protected baseCurrency: string;

    constructor(wallet: Wallet, baseCurrency = 'USD') {
        super();

        this.wallet = wallet;
        this.baseCurrency = baseCurrency;
    }

    protected makeAsset(asset: Pick<Asset, 'name' | 'symbol' | 'balance' | 'value'>): Asset {
        return {
            id: generateUUID(),
            originType: OriginType.Wallet,
            originName: this.wallet.name,

            name: asset.name,
            symbol: asset.symbol,
            balance: asset.balance,
            value: asset.value,
        };
    }

    protected makeActivity(activity: Pick<Activity, 'action' | 'amount' | 'currency' | 'date' | 'transactionType' | 'status' | 'details'>): Activity {
        return {
            id: generateUUID(),
            originName: this.wallet.name,
            originType: OriginType.Wallet,

            action: activity.action,
            amount: activity.amount,
            currency: activity.currency,
            date: activity.date,
            transactionType: activity.transactionType,
            status: activity.status,
            details: activity.details,
        };
    }
}
