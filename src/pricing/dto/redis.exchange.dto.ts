import { TypeSymbolEnum } from "../enums/type.symbol.enum"

export class RedisExchangeDto {
  from_crypto: string
  type_from?: TypeSymbolEnum
  from_decimal?: string
  from_price: string
  to_decimal? : string
  to_crypto: string
  type_to?: TypeSymbolEnum
  to_price: string
  equal_buy?: string
  equal_sale?: string
  time : string
  location : string
  channel?:string
  convert_wage?:string
  spot_equal_buy?:string
  spot_equal_sell?:string
  exchange_type?:string[]

}