import { ExchangeOtcEnt } from "../dto/exchange.otc.dto";

export interface ResponseExchangeOtc {
    status: string;
    data: ExchangeOtcEnt[];
    ts: number;
}