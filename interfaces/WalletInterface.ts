import { WalletType } from "../enums/WalletType";

export interface Wallet {
    name: string;
    address: string;
    type: WalletType;
    isActive: boolean;
}
