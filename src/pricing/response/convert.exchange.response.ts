import { ExchangeSpotEnt } from "../dto/exchange.spot.dto";

export interface ResponseExchangeSpot {
    status: string;
    data: ExchangeSpotEnt[];
    ts: number;
}