import { RepositoryExchangeEnum } from "../enums/repositoy.exchnage.enum";
import { PriceStatusEnum } from "../enums/socket.status";
import { TypePriceCryptoEnum } from "../enums/type.price.column";
import { TypeSymbolEnum } from "../enums/type.symbol.enum";


export class CryptoEnt  {
  
  
    id: string;
  
    symbol_crypto: string
  
    name_crypto: string;
  
    persian_name:string
  
    type_fiat: TypeSymbolEnum
  
    stable_coin: boolean;
  
    decimal: number
  
    step_size_order:string
  
    step_size_withdraw:string
  
    type_get_price: TypePriceCryptoEnum
  
    link_price: string
  
    result_link_price: string
  
    crypto_socket:PriceStatusEnum
  
    repository_price: RepositoryExchangeEnum
  
  }
  