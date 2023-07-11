import Big from 'big.js';

export interface TemporaryTransaction {
    transactionable_name: string;
    timestamp: string;
    currency: string;
    value: Big;
    indicatedAmount: Big;
    totalFee: Big;
    status: string;
    method: string;
    operation_type: 'deposit' | 'withdraw';
}
