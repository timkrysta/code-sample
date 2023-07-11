export class BtcComService {
    static readonly MAX_RETRY_ATTEMPTS = 5;
    static readonly RETRY_DELAY_MS = 1000;
    static readonly BTC_COM_RATE_LIMIT_REACHED_MESSAGE = "Unexpected token 'D', \"Don't abus\"... is not valid JSON";

    static async attemptWithRetry(apiCall) {
        let retryAttempts = 0;
        while (retryAttempts < this.MAX_RETRY_ATTEMPTS) {
            try {
                return await apiCall();
            } catch (err) {
                if (err.message === this.BTC_COM_RATE_LIMIT_REACHED_MESSAGE) {
                    retryAttempts++;
                    console.log(`BtcComService: Rate limit reached. Retrying in ${this.RETRY_DELAY_MS}ms...`);
                    await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY_MS));
                } else {
                    console.log(`BtcComService: Unhandled btc.com API error: ${err.message}`);
                    throw err;
                }
            }
        }
        throw new Error(`BtcComService: Exceeded maximum retry attempts (${this.MAX_RETRY_ATTEMPTS})`);
    }
}
