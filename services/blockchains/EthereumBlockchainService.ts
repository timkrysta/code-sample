import Big from 'big.js';
import { init } from 'etherscan-api';
import { Assets } from '../../interfaces/AssetInterface';
import { Activities } from '../../interfaces/ActivityInterface';
import CryptoCompareService from '../CryptoCompareService';
import { InternalTransactionResponse, NormalTransactionsResponse, TokenBalanceResponse } from '../../interfaces/EtherscanAndBscscanInterfaces';
import { EtherConversionService } from '../conversion/EtherConversionService';
import { EtherscanAndBscscanService } from '../EtherscanAndBscscanService';
import { TemporaryParsedData } from '../../interfaces/MiscInterfaces';
import { Wallet } from '../../interfaces/WalletInterface';
import { getTransactionDirection, getTransactionStatusFromConfirmations, getValueWithDecimalApplied, timestampToDate } from '../../utils/Misc';
import { BlockchainService } from './BlockchainService';

export default class EthereumBlockchainService extends BlockchainService {
    etherscanClient;

    constructor(wallet: Wallet, baseCurrency = 'USD') {
        super(wallet, baseCurrency);

        this.etherscanClient = init(process.env.ETHERSCAN_API_KEY);
    }

    public async getAllAssets(): Promise<Assets> {
        try {
            const assets: Assets = [];

            //// Get Ether Balance
            // https://docs.etherscan.io/api-endpoints/accounts#get-ether-balance-for-a-single-address
            const etherBalanceResponse: TokenBalanceResponse = await EtherscanAndBscscanService.attemptWithRetry(() => this.etherscanClient.account.balance(this.wallet.address));

            if (etherBalanceResponse) {
                const weiBalance = etherBalanceResponse.result;
                const etherBalance = EtherConversionService.weiToETH(weiBalance);

                if (!etherBalance.eq(0)) {
                    const multipleSymbolsPrice = await CryptoCompareService.getMultipleSymbolsPrice(['ETH'], [this.baseCurrency]);

                    assets.push(this.makeAsset({
                        name: 'Ethereum',
                        symbol: 'ETH',
                        balance: etherBalance,
                        value: etherBalance.mul(multipleSymbolsPrice['ETH'][this.baseCurrency]),
                    }));
                }
            }


            const erc20TokenTransferEventsResponse = await this.getTokenTransferEvents();

            if (erc20TokenTransferEventsResponse) {
                const parsedData: TemporaryParsedData = {};
                erc20TokenTransferEventsResponse.result.forEach(transaction => {
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

                    //// Get ERC20-Token Account Balance for TokenContractAddress
                    // https://docs.etherscan.io/api-endpoints/tokens#get-erc20-token-account-balance-for-tokencontractaddress
                    const tokenBalanceResponse: TokenBalanceResponse = await EtherscanAndBscscanService.attemptWithRetry(() => this.etherscanClient.account.tokenbalance(this.wallet.address, '', contractAddress));

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
            // https://docs.etherscan.io/api-endpoints/accounts#get-a-list-of-normal-transactions-by-address
            const normalTransactionsResponse: NormalTransactionsResponse = await EtherscanAndBscscanService.attemptWithRetry(() => this.etherscanClient.account.txlist(this.wallet.address));

            if (normalTransactionsResponse) {
                const normalTransactions = normalTransactionsResponse.result;

                for (const normalTransaction of normalTransactions) {
                    activities.push(this.makeActivity({
                        action: getTransactionDirection(this.wallet.address, normalTransaction.from, normalTransaction.to),
                        amount: EtherConversionService.weiToETH(normalTransaction.value),
                        currency: 'ETH',
                        date: this.formatDate(timestampToDate(normalTransaction.timeStamp)),
                        transactionType: 'Normal Transaction',
                        status: getTransactionStatusFromConfirmations(normalTransaction.confirmations),
                        details: {
                            raw: {
                                blockNumber: normalTransaction.blockNumber,
                                timeStamp: normalTransaction.timeStamp,
                                hash: normalTransaction.hash,
                                nonce: normalTransaction.nonce,
                                blockHash: normalTransaction.blockHash,
                                transactionIndex: normalTransaction.transactionIndex,
                                from: normalTransaction.from,
                                to: normalTransaction.to,
                                value: normalTransaction.value,
                                gas: normalTransaction.gas,
                                gasPrice: normalTransaction.gasPrice,
                                isError: normalTransaction.isError,
                                txreceipt_status: normalTransaction.txreceipt_status,
                                input: normalTransaction.input,
                                contractAddress: normalTransaction.contractAddress,
                                cumulativeGasUsed: normalTransaction.cumulativeGasUsed,
                                gasUsed: normalTransaction.gasUsed,
                                confirmations: normalTransaction.confirmations,
                                methodId: normalTransaction.methodId,
                                functionName: normalTransaction.functionName,
                            },
                        },
                    }));
                }
            }


            //// Get a list of 'Internal' Transactions by Address
            // https://docs.etherscan.io/api-endpoints/accounts#get-a-list-of-internal-transactions-by-address
            const internalTransactionsResponse: InternalTransactionResponse = await EtherscanAndBscscanService.attemptWithRetry(() => this.etherscanClient.account.txlistinternal('', this.wallet.address));

            if (internalTransactionsResponse) {
                const internalTransactions = internalTransactionsResponse.result;

                for (const internalTransaction of internalTransactions) {
                    activities.push(this.makeActivity({
                        action: getTransactionDirection(this.wallet.address, internalTransaction.from, internalTransaction.to),
                        amount: EtherConversionService.weiToETH(internalTransaction.value),
                        currency: 'ETH',
                        date: this.formatDate(timestampToDate(internalTransaction.timeStamp)),
                        transactionType: 'Internal Transaction',
                        status: `isError: ${internalTransaction.isError}`,
                        details: {
                            raw: {
                                blockNumber: internalTransaction.blockNumber,
                                timeStamp: internalTransaction.timeStamp,
                                hash: internalTransaction.hash,
                                from: internalTransaction.from,
                                to: internalTransaction.to,
                                value: internalTransaction.value,
                                contractAddress: internalTransaction.contractAddress,
                                input: internalTransaction.input,
                                type: internalTransaction.type,
                                gas: internalTransaction.gas,
                                gasUsed: internalTransaction.gasUsed,
                                traceId: internalTransaction.traceId,
                                isError: internalTransaction.isError,
                                errCode: internalTransaction.errCode,
                            }
                        },
                    }));
                }
            }


            const erc20TokenTransferEventsResponse = await this.getTokenTransferEvents();

            if (erc20TokenTransferEventsResponse) {
                for (const tokenTransferEvent of erc20TokenTransferEventsResponse.result) {
                    activities.push(this.makeActivity({
                        action: getTransactionDirection(this.wallet.address, tokenTransferEvent.from, tokenTransferEvent.to),
                        amount: getValueWithDecimalApplied(tokenTransferEvent.value, tokenTransferEvent.tokenDecimal),
                        currency: tokenTransferEvent.tokenSymbol,
                        date: this.formatDate(timestampToDate(tokenTransferEvent.timeStamp)),
                        transactionType: 'ERC20 - Token Transfer Event',
                        status: getTransactionStatusFromConfirmations(tokenTransferEvent.confirmations),
                        details: {
                            raw: {
                                blockNumber: tokenTransferEvent.blockNumber,
                                timeStamp: tokenTransferEvent.timeStamp,
                                hash: tokenTransferEvent.hash,
                                nonce: tokenTransferEvent.nonce,
                                blockHash: tokenTransferEvent.blockHash,
                                from: tokenTransferEvent.from,
                                contractAddress: tokenTransferEvent.contractAddress,
                                to: tokenTransferEvent.to,
                                value: tokenTransferEvent.value,
                                tokenName: tokenTransferEvent.tokenName,
                                tokenSymbol: tokenTransferEvent.tokenSymbol,
                                tokenDecimal: tokenTransferEvent.tokenDecimal,
                                transactionIndex: tokenTransferEvent.transactionIndex,
                                gas: tokenTransferEvent.gas,
                                gasPrice: tokenTransferEvent.gasPrice,
                                gasUsed: tokenTransferEvent.gasUsed,
                                cumulativeGasUsed: tokenTransferEvent.cumulativeGasUsed,
                                input: tokenTransferEvent.input,
                                confirmations: tokenTransferEvent.confirmations,
                            }
                        },
                    }));
                }
            }

            return activities;
        } catch (err) {
            throw err;
        }
    }
}
