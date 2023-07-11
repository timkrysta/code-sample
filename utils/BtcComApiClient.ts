import { BtcComAddressDetailsResponse, BtcComAddressTransactionsResponse } from "../interfaces/BtcComInterfaces";

export class BtcComApiClient {
    private static baseUrl = 'https://chain.api.btc.com/v3';

    public static async getAddressDetails(address: string) {
        const url = `${this.baseUrl}/address/${address}`;
        try {
            const response = await fetch(url);
            const data: BtcComAddressDetailsResponse = await response.json();
            return data;
        } catch (err) {
            throw err;
        }
    }

    public static async getAddressTransactions(address: string) {
        const url = `${this.baseUrl}/address/${address}/tx`;
        try {
            const response = await fetch(url);
            const data: BtcComAddressTransactionsResponse = await response.json();
            return data;
        } catch (err) {
            throw err;
        }
    }
}
