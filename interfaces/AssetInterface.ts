import Big from 'big.js';
import { BaseEntity } from './BaseEntityInterface';

export type Assets = Asset[];

export interface Asset extends BaseEntity {
    name: string;
    symbol: string;
    balance: Big;
    value: Big;
}
