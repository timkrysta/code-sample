import Big from 'big.js';
import { BaseEntity } from './BaseEntityInterface';

export type Activities = Activity[];

export interface Activity extends BaseEntity {
    action:
        | 'Sold'
        | 'Bought'
        | 'Deposit'
        | 'Withdraw'
        | 'Transferred'
        | 'In'
        | 'Out'
        | 'Unknown'
        | string;
    amount: Big;
    currency: string;
    date?: string;
    transactionType?: string;
    status?: string;
    details?: {
        [key: string]: any;
    };
}
