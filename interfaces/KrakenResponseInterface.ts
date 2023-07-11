export interface KrakenResponse {
    error: string[];
    result?: any;
}

export interface KrakenDepositAndWithdrawStatusResponse {
    error: string[];
    result?: KrakenDepositAndWithdrawStatus[];
}

export interface KrakenDepositAndWithdrawStatus {
    method: string;
    aclass: 'currency' | string;
    asset: string;
    refid: string;
    txid: string;
    info: string;
    amount: string;
    fee: string;
    time: number;
    status: 'Success' | 'Pending' | string;
}

export interface KrakenTradesHistoryResponse {
    error: string[];
    result?: {
        count: number;
        trades: KrakenTrades;
    };
}

export interface KrakenTrade {
    ordertxid: string;
    postxid: string;
    pair: string;
    time: number;
    type: string;
    ordertype: string;
    price: string;
    cost: string;
    fee: string;
    vol: string;
    margin: string;
    leverage: string;
    misc: string;
    trade_id: number;
    posstatus: string;
    cprice: null;
    ccost: null;
    cfee: null;
    cvol: null;
    cmargin: null;
    net: null;
    trades: string[];
}

interface KrakenTrades {
    [txid: string]: KrakenTrade;
}
