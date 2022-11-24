import { CryptoEnt } from "./crypto.entity";
import { ExchangeVersionOtcEnt } from "./exchange.otc.ver.dto";

export class ExchangeOtcEnt {
    id: string;

    from_crypto : CryptoEnt

    to_crypto :CryptoEnt

    dashboard : boolean

    status : boolean

    version : ExchangeVersionOtcEnt[]
}
