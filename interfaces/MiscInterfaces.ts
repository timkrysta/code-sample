export interface TemporaryParsedData {
    [contractAddress: string]: {
        tokenName: string;
        tokenSymbol: string;
        tokenDecimal: string;
    };
}
