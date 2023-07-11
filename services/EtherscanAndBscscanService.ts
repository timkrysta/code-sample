import { gracefullyHandleCatchedError } from "../utils/gracefullyHandleCatchedError";

export class EtherscanAndBscscanService {
    static readonly MAX_RETRY_ATTEMPTS = 999;
    static readonly RETRY_DELAY_MS = 1000;
    static readonly ETHERSCAN_RATE_LIMIT_REACHED_MESSAGE = 'Max rate limit reached';
    static readonly ETHERSCAN_CONNECTION_TIMEOUT_MESSAGE = 'Error: Socket connection timeout';

    static async attemptWithRetry(apiCall) {
        let retryAttempts = 0;
        while (retryAttempts < this.MAX_RETRY_ATTEMPTS) {
            try {
                return await apiCall();
            } catch (err) {
                if (err === this.ETHERSCAN_RATE_LIMIT_REACHED_MESSAGE) {
                    retryAttempts++;
                    console.log(`EtherscanAndBscscanService: Rate limit reached. Retrying in ${this.RETRY_DELAY_MS}ms...`);
                    await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY_MS));
                } else if (err.message === this.ETHERSCAN_CONNECTION_TIMEOUT_MESSAGE) {
                    retryAttempts++;
                    console.log(`EtherscanAndBscscanService: ${err.message}. Retrying in ${this.RETRY_DELAY_MS}ms...`);
                    await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY_MS));
                } else if (err.message === 'AxiosError: timeout of 10000ms exceeded') {
                    retryAttempts++;
                    console.log(`EtherscanAndBscscanService: ${err.message}. Retrying in ${this.RETRY_DELAY_MS}ms...`);
                    await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY_MS));
                } else if (err.message === 'fetch failed') {
                    retryAttempts++;
                    console.log(`EtherscanAndBscscanService: ${err.message}. Retrying in ${this.RETRY_DELAY_MS}ms...`);
                    await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY_MS));
                } else if (err.message === 'NOTOK - Max rate limit reached') {
                    retryAttempts++;
                    console.log(`EtherscanAndBscscanService: ${err.message}. Retrying in ${this.RETRY_DELAY_MS}ms...`);
                    await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY_MS));
                } else if (err.message === 'No transactions found - ') {
                    retryAttempts++;
                    console.log(`EtherscanAndBscscanService: ${err.message}. Failing gracefully`);
                    gracefullyHandleCatchedError(err);
                    return;
                } else {
                    console.log(`EtherscanAndBscscanService: Unhandled Etherscan or Bscscan API error: ${err.message}`);
                    throw err;
                }
            }
        }
        throw new Error(`EtherscanAndBscscanService: Exceeded maximum retry attempts (${this.MAX_RETRY_ATTEMPTS})`);
    }
}
