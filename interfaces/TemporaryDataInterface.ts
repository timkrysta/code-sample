import Big from 'big.js';

export interface TemporaryData {
    free: Big;
    locked: Big;
    unitValues: {
        [currency: string]: number;
    };
    totalValues: {
        [currency: string]: Big;
    };
}
