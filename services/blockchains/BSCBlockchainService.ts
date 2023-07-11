import { GetBalanceResponse, GetTokenTxResponse, GetTxListInternalResponse, GetTxListResponse } from '@jpmonette/bscscan/lib/typings';
import { BscScan } from "@jpmonette/bscscan";
import Big from 'big.js';
import { Assets } from '../../interfaces/AssetInterface';
import { Activities } from '../../interfaces/ActivityInterface';
import CryptoCompareService from '../CryptoCompareService';
import { TokenBalanceResponse } from '../../interfaces/EtherscanAndBscscanInterfaces';
import { EtherscanAndBscscanService } from '../EtherscanAndBscscanService';
import { TemporaryParsedData } from '../../interfaces/MiscInterfaces';
import { Wallet } from '../../interfaces/WalletInterface';
import { getTransactionDirection, getTransactionStatusFromConfirmations, getValueWithDecimalApplied, timestampToDate } from '../../utils/Misc';
import { BlockchainService } from './BlockchainService';
import { BNBConversionService } from '../conversion/BNBConversionService';
import { buildQueryString } from '../../utils/buildQueryString';

export default class BSCBlockchainService extends BlockchainService {
    bscscanClient: BscScan;

    constructor(wallet: Wallet, baseCurrency = 'USD') {
        super(wallet, baseCurrency);

        this.bscscanClient = new BscScan({ apikey: process.env.BSCSCAN_API_KEY });
    }

    public async getAllAssets(): Promise<Assets> {
        try {
            const assets: Assets = [];

            //// Get BNB Balance for a Single Address
            // https://docs.bscscan.com/api-endpoints/accounts#get-bnb-balance-for-a-single-address
            const dropBalance: GetBalanceResponse = await EtherscanAndBscscanService.attemptWithRetry(() => this.bscscanClient.accounts.getBalance({ address: this.wallet.address }));

            if (dropBalance) {
                const bnbBalance = BNBConversionService.dropToBNB(dropBalance);

                if (!bnbBalance.eq(0)) {
                    const multipleSymbolsPrice = await CryptoCompareService.getMultipleSymbolsPrice(['BNB'], [this.baseCurrency]);

                    assets.push(this.makeAsset({
                        name: 'BNB',
                        symbol: 'BNB',
                        balance: bnbBalance,
                        value: bnbBalance.mul(multipleSymbolsPrice['BNB'][this.baseCurrency]),
                    }));
                }
            }


            const bep20TokenTransferEventsResponse = await this.getTokenTransferEvents();
            if (bep20TokenTransferEventsResponse) {
                const parsedData: TemporaryParsedData = {};
                bep20TokenTransferEventsResponse.forEach(transaction => {
                    const { contractAddress, tokenName, tokenSymbol, tokenDecimal } = transaction;
                    parsedData[contractAddress] = {
                        tokenName,
                        tokenSymbol,
                        tokenDecimal
                    };
                });

                const allAssetSymbols = Object.values(parsedData).map((item) => item.tokenSymbol);
                const multipleSymbolsPrice = await CryptoCompareService.getMultipleSymbolsPrice(allAssetSymbols, [this.baseCurrency]);

                for (const contractAddress of Object.keys(parsedData)) {
                    const data = parsedData[contractAddress];

                    //// Get BEP-20 Token Account Balance by ContractAddress
                    // https://docs.bscscan.com/api-endpoints/tokens#get-bep-20-token-account-balance-by-contractaddress
                    const getBep20TokenAccountBalanceByContractAddress = async (walletAddress: string, contractAddress: string) => {
                        try {
                            const BASE_URL = 'https://api.bscscan.com/api'

                            const queryParams = {
                                module: 'account',
                                action: 'tokenbalance',
                                address: walletAddress,
                                contractaddress: contractAddress,
                                apikey: process.env.BSCSCAN_API_KEY,
                            };

                            const url = BASE_URL + '?' + buildQueryString(queryParams);

                            const response = await fetch(url);
                            const data = await response.json();

                            if (data && data.result) {
                                if (data.result === EtherscanAndBscscanService.ETHERSCAN_RATE_LIMIT_REACHED_MESSAGE) {
                                    throw EtherscanAndBscscanService.ETHERSCAN_RATE_LIMIT_REACHED_MESSAGE;
                                }
                            }

                            return data;
                        } catch (err) {
                            throw err;
                        }
                    };
                    const tokenBalanceResponse: TokenBalanceResponse = await EtherscanAndBscscanService.attemptWithRetry(() => getBep20TokenAccountBalanceByContractAddress(this.wallet.address, contractAddress));

                    if (tokenBalanceResponse) {
                        const tokenBalance = tokenBalanceResponse.result;

                        const tokenBalanceWithDecimalPointApplied = getValueWithDecimalApplied(tokenBalance, data.tokenDecimal);

                        const exchangeRate = multipleSymbolsPrice[data.tokenSymbol] && multipleSymbolsPrice[data.tokenSymbol][this.baseCurrency]
                            ? multipleSymbolsPrice[data.tokenSymbol][this.baseCurrency]
                            : 0;

                        if (!tokenBalanceWithDecimalPointApplied.eq(0)) {
                            assets.push(this.makeAsset({
                                name: data.tokenName,
                                symbol: data.tokenSymbol,
                                balance: tokenBalanceWithDecimalPointApplied,
                                value: new Big(tokenBalanceWithDecimalPointApplied).mul(exchangeRate),
                            }));
                        }
                    }
                }
            }

            return assets;
        } catch (err) {
            throw err;
        }
    }

    public async getAllActivities(): Promise<Activities> {
        try {
            const activities: Activities = [];

            //// Get a list of 'Normal' Transactions By Address
            // https://docs.bscscan.com/api-endpoints/accounts#get-a-list-of-normal-transactions-by-address
            const normalTransactions: GetTxListResponse = await EtherscanAndBscscanService.attemptWithRetry(() => this.bscscanClient.accounts.getTxList({ address: this.wallet.address }));

            if (normalTransactions) {
                for (const normalTransaction of normalTransactions) {
                    activities.push(this.makeActivity({
                        action: getTransactionDirection(this.wallet.address, normalTransaction.from, normalTransaction.to),
                        amount: BNBConversionService.dropToBNB(normalTransaction.value),
                        currency: 'BNB',
                        date: this.formatDate(timestampToDate(normalTransaction.timeStamp)),
                        transactionType: 'Normal Transaction',
                        status: getTransactionStatusFromConfirmations(normalTransaction.confirmations),
                        details: {
                            raw: {
                                blockHash: normalTransaction.blockHash,
                                blockNumber: normalTransaction.blockNumber,
                                confirmations: normalTransaction.confirmations,
                                contractAddress: normalTransaction.contractAddress,
                                cumulativeGasUsed: normalTransaction.cumulativeGasUsed,
                                from: normalTransaction.from,
                                gas: normalTransaction.gas,
                                gasPrice: normalTransaction.gasPrice,
                                gasUsed: normalTransaction.gasUsed,
                                hash: normalTransaction.hash,
                                input: normalTransaction.input,
                                isError: normalTransaction.isError,
                                nonce: normalTransaction.nonce,
                                timeStamp: normalTransaction.timeStamp,
                                to: normalTransaction.to,
                                transactionIndex: normalTransaction.transactionIndex,
                                txreceipt_status: normalTransaction.txreceipt_status,
                                value: normalTransaction.value,
                            },
                        },
                    }));
                }
            }


            //// Get a list of 'Internal' Transactions by Address
            // https://docs.bscscan.com/api-endpoints/accounts#get-a-list-of-internal-transactions-by-address
            const internalTransactions: GetTxListInternalResponse = await EtherscanAndBscscanService.attemptWithRetry(() => this.bscscanClient.accounts.getTxListInternal({ address: this.wallet.address }));

            if (internalTransactions) {
                for (const internalTransaction of internalTransactions) {
                    activities.push(this.makeActivity({
                        action: getTransactionDirection(this.wallet.address, internalTransaction.from, internalTransaction.to),
                        amount: BNBConversionService.dropToBNB(internalTransaction.value),
                        currency: 'BNB',
                        date: this.formatDate(timestampToDate(internalTransaction.timeStamp)),
                        transactionType: 'Internal Transaction',
                        status: `isError: ${internalTransaction.isError}`,
                        details: {
                            raw: {
                                blockNumber: internalTransaction.blockNumber,
                                contractAddress: internalTransaction.contractAddress,
                                errCode: internalTransaction.errCode,
                                from: internalTransaction.from,
                                gas: internalTransaction.gas,
                                gasUsed: internalTransaction.gasUsed,
                                hash: internalTransaction.hash,
                                input: internalTransaction.input,
                                isError: internalTransaction.isError,
                                timeStamp: internalTransaction.timeStamp,
                                to: internalTransaction.to,
                                traceId: internalTransaction.traceId,
                                type: internalTransaction.type,
                                value: internalTransaction.value,
                            },
                        },
                    }));
                }
            }


            const bep20TokenTransferEventsResponse = await this.getTokenTransferEvents();
            if (bep20TokenTransferEventsResponse) {
                for (const tokenTransferEvent of bep20TokenTransferEventsResponse) {
                    activities.push(this.makeActivity({
                        action: getTransactionDirection(this.wallet.address, tokenTransferEvent.from, tokenTransferEvent.to),
                        amount: getValueWithDecimalApplied(tokenTransferEvent.value, tokenTransferEvent.tokenDecimal),
                        currency: tokenTransferEvent.tokenSymbol,
                        date: this.formatDate(timestampToDate(tokenTransferEvent.timeStamp)),
                        transactionType: 'BEP20 - Token Transfer Event',
                        status: getTransactionStatusFromConfirmations(tokenTransferEvent.confirmations),
                        details: {
                            raw: {
                                blockHash: tokenTransferEvent.blockHash,
                                blockNumber: tokenTransferEvent.blockNumber,
                                confirmations: tokenTransferEvent.confirmations,
                                contractAddress: tokenTransferEvent.contractAddress,
                                cumulativeGasUsed: tokenTransferEvent.cumulativeGasUsed,
                                from: tokenTransferEvent.from,
                                gas: tokenTransferEvent.gas,
                                gasPrice: tokenTransferEvent.gasPrice,
                                gasUsed: tokenTransferEvent.gasUsed,
                                hash: tokenTransferEvent.hash,
                                input: tokenTransferEvent.input,
                                nonce: tokenTransferEvent.nonce,
                                timeStamp: tokenTransferEvent.timeStamp,
                                to: tokenTransferEvent.to,
                                tokenDecimal: tokenTransferEvent.tokenDecimal,
                                tokenName: tokenTransferEvent.tokenName,
                                tokenSymbol: tokenTransferEvent.tokenSymbol,
                                transactionIndex: tokenTransferEvent.transactionIndex,
                                value: tokenTransferEvent.value,
                            },
                        },
                    }));
                }
            }

            return activities;
        } catch (err) {
            throw err;
        }
    }

    //// Get a list of 'BEP-20 Token Transfer Events' by Address
    // https://docs.bscscan.com/api-endpoints/accounts#get-a-list-of-bep-20-token-transfer-events-by-address
    private async getTokenTransferEvents() {
        const bep20TokenTransferEventsResponse: GetTokenTxResponse = await EtherscanAndBscscanService.attemptWithRetry(() => this.bscscanClient.accounts.getTokenTx({ address: this.wallet.address }));
        return bep20TokenTransferEventsResponse;
    }
}
