import { ExchangeTypeEnum } from "../enums/exchange.type.enum";

export class ExchangeVersionSpotEnt {

    id: string;
    wage_buy_factory : string

    wage_sale_factory : string

    min_buy : string

    min_sale : string

    max_buy : string

    max_sale : string
    exchange_type: ExchangeTypeEnum
}
