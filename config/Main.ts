import { ExchangeService } from '../services/exchanges/ExchangeService';
import BinanceExchangeService from '../services/exchanges/BinanceExchangeService';
import KrakenExchangeService from '../services/exchanges/KrakenExchangeService';
import { config } from 'dotenv';
import BitfinexExchangeService from '../services/exchanges/BitfinexExchangeService';
import CryptoComExchangeService from '../services/exchanges/CryptoComExchangeService';
import { Wallet } from '../interfaces/WalletInterface';
import { Exchange } from '../interfaces/ExchangeInterface';
import { WalletType } from '../enums/WalletType';
import BitcoinBlockchainService from '../services/blockchains/BitcoinBlockchainService';
import EthereumBlockchainService from '../services/blockchains/EthereumBlockchainService';
import { BlockchainService } from '../services/blockchains/BlockchainService';
import BSCBlockchainService from '../services/blockchains/BSCBlockchainService';
config();

export const DEBUG = process.env.DEBUG;

export const SHOULD_FAIL_ALTOGETHER_IF_ONE_PROVIDER_FAILS = false;

export const CRYPTOCURRENCY_NAME_IF_UNABLE_TO_FIND_BY_TICKER = '';

export const ENABLED_EXCHANGES = {
    Binance: true,
    Kraken: true,
    Bitfinex: true,
    CryptoCom: true,
};

export const EXCHANGE_SERVICES: Record<string, new (apiKey: string, apiSecret: string) => ExchangeService> = {
    Binance: BinanceExchangeService,
    Kraken: KrakenExchangeService,
    Bitfinex: BitfinexExchangeService,
    CryptoCom: CryptoComExchangeService,
};

export const ENABLED_BLOCKCHAINS = {
    [WalletType.Bitcoin]: true,
    [WalletType.Ethereum]: true,
    [WalletType.BSC]: true,
    //[WalletType.BSC]
    //[WalletType.Avalanche]
    //[WalletType.Solana]
    //[WalletType.Cardano]
    //[WalletType.ETHZKsync]
    //[WalletType.Tron]
    //[WalletType.Arbitrum]
    //[WalletType.Polygon]
    //[WalletType.Optimism]
    //[WalletType.Fantom]
    //[WalletType.Cronos]
    //[WalletType.Algorand]
    //[WalletType.Osmosis]
};

export const BLOCKCHAIN_SERVICES: Record<WalletType, new (wallet: Wallet, baseCurrency?: string) => BlockchainService> = {
    [WalletType.Bitcoin]: BitcoinBlockchainService,
    [WalletType.Ethereum]: EthereumBlockchainService,
    [WalletType.BSC]: BSCBlockchainService,
    [WalletType.Avalanche]: undefined,
    [WalletType.Solana]: undefined,
    [WalletType.Cardano]: undefined,
    [WalletType.ETHZKsync]: undefined,
    [WalletType.Tron]: undefined,
    [WalletType.Arbitrum]: undefined,
    [WalletType.Polygon]: undefined,
    [WalletType.Optimism]: undefined,
    [WalletType.Fantom]: undefined,
    [WalletType.Cronos]: undefined,
    [WalletType.Algorand]: undefined,
    [WalletType.Osmosis]: undefined,
};

export const shouldSkipProcessingWallet = (wallet: Wallet) => {
    return ! wallet.isActive;
};

export const shouldSkipProcessingExchange = (exchange: Exchange) => {
    return ! exchange.isActive;
};
