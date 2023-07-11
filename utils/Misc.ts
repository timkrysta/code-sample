import Big, { BigSource } from "big.js";

export const getTransactionDirection = (address: string, from: string, to: string): 'In' | 'Out' | 'Unknown' => {
    address = address.toLocaleLowerCase();
    from = from.toLocaleLowerCase();
    to = to.toLocaleLowerCase();

    if (address === from) {
        return 'Out';
    }

    if (address === to) {
        return 'In';
    }

    return 'Unknown';
};

export const timestampToDate = (timestamp: string | number, isInMiliSeconds = false): Date => {
    if (typeof timestamp === 'string') {
        timestamp = parseInt(timestamp);
    }

    if (! isInMiliSeconds) {
        timestamp = timestamp * 1000;
    }

    return new Date(timestamp);
};

export const getValueWithDecimalApplied = (value: BigSource, decimal: string | number): Big => {
    if (typeof decimal === 'string') {
        decimal = parseInt(decimal);
    }

    const decimalMultiplier = new Big(10).pow(decimal);

    return new Big(value).div(decimalMultiplier);
};

export const getTransactionStatusFromConfirmations = (confirmations: string | number) => {
    if (typeof confirmations === 'string') {
        confirmations = parseInt(confirmations);
    }

    return confirmations > 0
        ? 'Confirmed'
        : 'Pending';
};
