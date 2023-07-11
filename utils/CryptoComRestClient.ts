import crypto from 'crypto-js';
import { CryptoComRequestBody } from '../interfaces/CryptoComInterfaces';

export class CryptoComRestClient {
    private restApiRootEndpoint: string = 'https://api.crypto.com/exchange/v1/';

    constructor(private apiKey: string, private apiSecret: string) {}

    async userBalance(): Promise<Response> {
        const method = 'private/user-balance';
        const params = {};
        const id = 11;

        try {
            const response = await this.makeAuthRequest(method, id, params);
            return response;
        } catch (err) {
            throw err;
        }
    }

    async userBalanceHistory(): Promise<Response> {
        const method = 'private/user-balance-history';
        const params = {};
        const id = 11;

        try {
            const response = await this.makeAuthRequest(method, id, params);
            return response;
        } catch (err) {
            throw err;
        }
    }

    async getTransactions(): Promise<Response> {
        const method = 'private/get-transactions';
        const params = {};
        const id = 1;

        try {
            const response = await this.makeAuthRequest(method, id, params);
            return response;
        } catch (err) {
            throw err;
        }
    }

    private async makeAuthRequest(method: string, id: number, params: object): Promise<Response> {
        try {
            const currentTimestampInMs = new Date().getTime();
            const response = await fetch(this.restApiRootEndpoint + method, {
                method: 'POST',
                body: this.getRequestBody({
                    id: id,
                    method: method,
                    params: params,
                    api_key: this.apiKey,
                    nonce: currentTimestampInMs,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            return response;
        } catch (err) {
            throw err;
        }
    }

    private getRequestBody(requestBody: CryptoComRequestBody): string {
        return JSON.stringify(this.signRequest(requestBody));
    }

    private signRequest(requestBody: CryptoComRequestBody) {
        const { id, method, params, nonce } = requestBody;

        function isObject(obj: any): boolean {
            return obj !== undefined && obj !== null && obj.constructor == Object;
        }
        function isArray(obj: any): boolean {
            return obj !== undefined && obj !== null && obj.constructor == Array;
        }
        function arrayToString(obj): string {
            return obj.reduce((a, b) => {
                return a + (isObject(b) ? objectToString(b) : isArray(b) ? arrayToString(b) : b);
            }, '');
        }
        function objectToString(obj: object): string {
            return obj == null
                ? ''
                : Object.keys(obj)
                      .sort()
                      .reduce((a, b) => {
                          return (
                              a +
                              b +
                              (isArray(obj[b]) ? arrayToString(obj[b]) : isObject(obj[b]) ? objectToString(obj[b]) : obj[b])
                          );
                      }, '');
        }

        const paramsString = objectToString(params);

        const sigPayload = method + id + this.apiKey + paramsString + nonce;
        requestBody.sig = crypto.HmacSHA256(sigPayload, this.apiSecret).toString(crypto.enc.Hex);
        return requestBody;
    }
}
