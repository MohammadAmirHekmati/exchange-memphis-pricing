import { ExchangeTypeEnum } from "../enums/exchange.type.enum";
import { CryptoEnt } from "./crypto.entity";
import { ExchangeVersionSpotEnt } from "./exchange.spot.ver.dto";

export class ExchangeSpotEnt {

    id: string;

    from_crypto : CryptoEnt

    to_crypto :CryptoEnt

    default_price:string

    exchange_type: ExchangeTypeEnum

    dashboard : boolean

    status : boolean
    version : ExchangeVersionSpotEnt[]
}
