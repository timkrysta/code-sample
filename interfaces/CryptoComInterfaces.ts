export interface CryptoComRequestBody {
    id: number;
    method: string;
    params?: object;
    api_key?: string;
    sig?: string;
    nonce: number;
}

export interface CryptoComResponse {
    id: number;
    method: string;
    result: object;
    code: number;
    message?: string;
    original?: string;
}

export interface CryptoComSnapshot {
    t: number;
    c: string;
}

export interface CryptoComResponse_UserBalanceHistory {
    id: number;
    method: string;
    result: {
        instrument_name: string;
        data: CryptoComSnapshot[];
    };
    code: number;
}

export interface CryptoComPositionBalance {
    instrument_name: string;
    quantity: string;
    market_value: string;
    collateral_amount: string;
    collateral_weight: string;
    max_withdrawal_balance: string;
    reserved_qty: string;
}

export interface CryptoComUserBalance {
    total_available_balance: string;
    total_margin_balance: string;
    total_initial_margin: string;
    total_maintenance_margin: string;
    total_position_cost: string;
    total_cash_balance: string;
    total_collateral_value: string;
    total_session_unrealized_pnl: string;
    instrument_name: string;
    total_session_realized_pnl: string;
    total_effective_leverage: string;
    position_limit: string;
    used_position_limit: string;
    total_borrow: string;
    margin_score: string;
    is_liquidating: boolean;
    has_risk: boolean;
    terminatable: boolean;
    position_balances: CryptoComPositionBalance[];
}

export interface CryptoComResponse_UserBalance {
    id: number;
    method: string;
    result: {
        data: CryptoComUserBalance[];
    };
    code: number;
}

export interface CryptoComTransaction {
    account_id: string;
    event_date: string;
    journal_type:
        | 'TRADING'
        | 'TRADE_FEE'
        | 'WITHDRAW_FEE'
        | 'WITHDRAW'
        | 'DEPOSIT'
        | 'ROLLBACK_DEPOSIT'
        | 'ROLLBACK_WITHDRAW'
        | 'FUNDING'
        | 'REALIZED_PNL'
        | 'INSURANCE_FUND'
        | 'SOCIALIZED_LOSS'
        | 'LIQUIDATION_FEE'
        | 'SESSION_RESET'
        | 'ADJUSTMENT'
        | 'SESSION_SETTLE'
        | 'UNCOVERED_LOSS'
        | 'ADMIN_ADJUSTMENT'
        | 'DELIST'
        | 'SETTLEMENT_FEE'
        | 'AUTO_CONVERSION'
        | 'MANUAL_CONVERSION';
    journal_id: string | number;
    transaction_qty: string;
    transaction_cost: string;
    realized_pnl: string;
    order_id: string | number;
    trade_id: string | number;
    trade_match_id: string | number;
    event_timestamp_ms: number;
    event_timestamp_ns: string;
    client_oid: string;
    taker_side: string;
    side: string;
    instrument_name: string;
}

export interface CryptoComResponse_Transactions {
    id: number;
    method: string;
    result: {
        data: CryptoComTransaction[];
    };
    code: number;
}
