import { Assets } from '../../interfaces/AssetInterface';
import { Activities } from '../../interfaces/ActivityInterface';
import { BtcComAddressDetailsResponse, BtcComAddressTransactionsResponse } from '../../interfaces/BtcComInterfaces';
import { Wallet } from '../../interfaces/WalletInterface';
import { getTransactionStatusFromConfirmations, timestampToDate } from '../../utils/Misc';
import { BtcComApiClient } from '../../utils/BtcComApiClient';
import { BitcoinConversionService } from '../conversion/BitcoinConversionService';
import CryptoCompareService from '../CryptoCompareService';
import { BlockchainService } from './BlockchainService';
import { BtcComService } from '../BtcComService';

export default class BitcoinBlockchainService extends BlockchainService {

    constructor(wallet: Wallet, baseCurrency = 'USD') {
        super(wallet, baseCurrency);
    }

    public async getAllAssets(): Promise<Assets> {
        try {
            const assets: Assets = [];

            const addressDetailsResponse: BtcComAddressDetailsResponse = await BtcComService.attemptWithRetry(() => BtcComApiClient.getAddressDetails(this.wallet.address));

            const multipleSymbolsPrice = await CryptoCompareService.getMultipleSymbolsPrice(['BTC'], [this.baseCurrency]);
            const bitcoinExchangeRate = multipleSymbolsPrice['BTC'][this.baseCurrency];

            const bitcoinBalance = BitcoinConversionService.satoshiToBtc(addressDetailsResponse.data.balance);

            if (!bitcoinBalance.eq(0)) {
                assets.push(this.makeAsset({
                    name: 'Bitcoin',
                    symbol: 'BTC',
                    balance: bitcoinBalance,
                    value: bitcoinBalance.mul(bitcoinExchangeRate),
                }));
            }

            return assets;
        } catch (err) {
            throw err;
        }
    }

    public async getAllActivities(): Promise<Activities> {
        try {
            const activities: Activities = [];

            const addressTransactionsResponse: BtcComAddressTransactionsResponse = await BtcComService.attemptWithRetry(() => BtcComApiClient.getAddressTransactions(this.wallet.address));

            const transactions = addressTransactionsResponse.data.list;

            for (const transaction of transactions) {
                const fromAddresses = transaction.inputs.map((input) => input.prev_addresses).flat();
                const toAddresses = transaction.outputs.map((output) => output.addresses).flat();

                const transactionDirection = fromAddresses.includes(this.wallet.address)
                    ? 'Out'
                    : toAddresses.includes(this.wallet.address)
                        ? 'In'
                        : 'Unknown';

                const bitcoinBalance = BitcoinConversionService.satoshiToBtc(transaction.inputs_value);

                activities.push(this.makeActivity({
                    action: transactionDirection,
                    amount: bitcoinBalance,
                    currency: 'BTC',
                    date: this.formatDate(timestampToDate(transaction.block_time)),
                    transactionType: 'Transaction',
                    status: getTransactionStatusFromConfirmations(transaction.confirmations),
                    details: {
                        raw: transaction,
                        parsed: {
                            toAddresses: toAddresses.join(', '),
                            fromAddresses: fromAddresses.join(', '),
                        },
                    },
                }));
            }

            return activities;
        } catch (err) {
            throw err;
        }
    }
}
