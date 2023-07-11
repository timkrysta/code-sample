import { generateUUID } from '../../utils/generateUUID';
import { Activity } from '../../interfaces/ActivityInterface';
import { Asset } from '../../interfaces/AssetInterface';
import { BaseProviderService } from '../BaseProviderService';
import { OriginType } from '../../enums/OriginType';

export abstract class ExchangeService extends BaseProviderService {
    protected abstract exchangeName: string;

    protected makeAsset(asset: Pick<Asset, 'name' | 'symbol' | 'balance' | 'value'>): Asset {
        return {
            id: generateUUID(),
            originType: OriginType.Exchange,
            originName: this.exchangeName,

            name: asset.name,
            symbol: asset.symbol,
            balance: asset.balance,
            value: asset.value,
        };
    }

    protected makeActivity(activity: Pick<Activity, 'action' | 'amount' | 'currency' | 'date' | 'transactionType' | 'status' | 'details'>): Activity {
        return {
            id: generateUUID(),
            originName: this.exchangeName,
            originType: OriginType.Exchange,

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
