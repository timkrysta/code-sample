export interface TokenBalanceResponse {
    status: '1' | string;
    message: 'OK' | 'NOTOK' | string;
    result: string;
}

export interface ERC20TokenTransferEventsResponse {
    status: string;
    message: string;
    result: Transaction[];
}

export interface Transaction {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    nonce: string;
    blockHash: string;
    from: string;
    contractAddress: string;
    to: string;
    value: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimal: string;
    transactionIndex: string;
    gas: string;
    gasPrice: string;
    gasUsed: string;
    cumulativeGasUsed: string;
    input: string;
    confirmations: string;
}

export interface NormalTransaction {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    nonce: string;
    blockHash: string;
    transactionIndex: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    isError: string;
    txreceipt_status: string;
    input: string;
    contractAddress: string;
    cumulativeGasUsed: string;
    gasUsed: string;
    confirmations: string;
    methodId: string;
    functionName: string;
}

export interface NormalTransactionsResponse {
    status: string;
    message: string;
    result: NormalTransaction[];
}

export interface InternalTransaction {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    from: string;
    to: string;
    value: string;
    contractAddress: string;
    input: string;
    type: string;
    gas: string;
    gasUsed: string;
    traceId: string;
    isError: string;
    errCode: string;
}

export interface InternalTransactionResponse {
    status: string;
    message: string;
    result: InternalTransaction[];
}
