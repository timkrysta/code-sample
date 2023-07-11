export interface BtcComAddressDetailsResponse {
    data: {
        address: string;
        received: number;
        sent: number;
        balance: number;
        tx_count: number;
        unconfirmed_tx_count: number;
        unconfirmed_received: number;
        unconfirmed_sent: number;
        unspent_tx_count: number;
        first_tx: string;
        last_tx: string;
    };
    err_code: number;
    err_no: number;
    message: 'succes' | string;
    status: 'succes' | string;
}

export interface BtcComAddressTransactionsResponse {
    data: {
        list: BtcComTransaction[];
    };
    err_code: number;
    err_no: number;
    message: 'succes' | string;
    status: 'succes' | string;
}

export interface BtcComTransaction {
    block_height: number;
    block_hash: string;
    block_time: number;
    created_at: number;
    confirmations: number;
    fee: number;
    hash: string;
    inputs_count: number;
    inputs_value: number;
    is_coinbase: boolean;
    is_double_spend: boolean;
    is_sw_tx: boolean;
    lock_time: number;
    outputs_count: number;
    outputs_value: number;
    sigops: number;
    size: number;
    version: number;
    vsize: number;
    weight: number;
    witness_hash: string;
    inputs: BtcComTransactionInput[];
    outputs: BtcComTransactionOutput[];
    balance_diff: number;
}

export interface BtcComTransactionInput {
    prev_addresses: string[];
    prev_position: number;
    prev_tx_hash: string;
    prev_type: string;
    prev_value: number;
    sequence: number;
}

export interface BtcComTransactionOutput {
    addresses: string[];
    value: number;
    type: string;
    spent_by_tx: string;
    spent_by_tx_position: number;
}
