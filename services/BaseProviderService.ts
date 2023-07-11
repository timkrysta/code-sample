import Big from 'big.js';
import { Activities } from '../interfaces/ActivityInterface';
import { Assets } from '../interfaces/AssetInterface';

export abstract class BaseProviderService {

    abstract getAllAssets(): Promise<Assets>;
    abstract getAllActivities(): Promise<Activities>;

    protected async getTotalFiatValue(): Promise<Big> {
        try {
            let totalFiatValue = new Big(0);

            const allAssets = await this.getAllAssets();

            allAssets.forEach((asset) => {
                totalFiatValue = totalFiatValue.plus(asset.value);
            });

            return totalFiatValue;
        } catch (err) {
            throw err;
        }
    }

    // Get the date string in the format "YYYY-MM-DDTHH:mm:ss.sssZ"
    protected formatDate(date: Date): string {
        return date.toISOString();
    }
}
