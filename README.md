# Part of portfolio tracking & analytics app. Support for Blockchains (like Bitcoin, Ethereum and BSC) and Exchanges (Binance, Kraken, Bitfinex and more).

## Introduction

This repository is part of a portfolio tracking and analytics app that provides support for multiple blockchains and exchanges. It includes a flexible architecture that allows easy integration of new providers such as additional blockchains or exchanges. This README.md file provides an overview of the project structure and explains how to extend the app to support new providers.

## Project Structure

The repository contains the following main components:

1. **Blockchain Services:** This directory contains implementations for various blockchains, such as Bitcoin, Ethereum, and Binance Smart Chain (BSC). Each blockchain service is implemented as a class that extends the `BlockchainService` abstract class and provides methods to read assets and transactions.

2. **Exchange Services:** This directory includes implementations for popular cryptocurrency exchanges like Binance, Kraken, Bitfinex, and more. Similar to the blockchain services, each exchange service is implemented as a class that extends the `ExchangeService` abstract class and provides methods for asset management and trading activities.

## Extending the App

The portfolio tracking and analytics app is designed to be easily extensible. Adding support for a new blockchain or exchange involves following a simple convention and implementing a few methods. The steps for adding support for a new provider are as follows:

### Adding a New Blockchain

To add support for a new blockchain, such as Cardano, follow these steps:

1. Create a new class, e.g., `CardanoBlockchainService`, that extends the `BlockchainService` abstract class.

2. Implement the required abstract methods in the `CardanoBlockchainService` class. These methods should return all assets and their balances and provide details of transactions, including incoming/outgoing transfers and trades specific to the Cardano blockchain.

3. Integrate the `CardanoBlockchainService` implementation into enabled blockchains in `config/Main.ts`.

### Adding a New Exchange

To add support for a new exchange, like Kucoin, follow these steps:

1. Create a new class, e.g., `KucoinExchangeService`, that extends the `ExchangeService` abstract class.

2. Implement the necessary abstract methods in the `KucoinExchangeService` class. These methods should handle functionalities such as asset management (deposits, withdrawals) and trading activities specific to the Kucoin exchange.

3. Incorporate the `KucoinExchangeService` implementation into enabled exchanges in `config/Main.ts`.

## Conclusion

This repository serves as a code sample to show the appreach to building applications where adding further extension/support for additional features is simple and straightforward.
