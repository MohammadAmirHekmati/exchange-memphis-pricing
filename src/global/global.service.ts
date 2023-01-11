import { Injectable, OnModuleInit } from "@nestjs/common";
import { CryptoEnt } from "../pricing/dto/crypto.entity";
import { ExchangeOtcEnt } from "../pricing/dto/exchange.otc.dto";
import { ExchangeSpotEnt } from "../pricing/dto/exchange.spot.dto";
import { ResponseExchangeSpot } from "../pricing/response/convert.exchange.response";
import { ResponseCrypto } from "../pricing/response/crypto.response";
import { ResponseExchangeOtc } from "../pricing/response/otc.exchange.response";
const axios=require("axios")

@Injectable()
export class GlobalService{
   constructor(){
   }

    async cryptoList():Promise<CryptoEnt[]>{
       try {
        const cryptoListReq=await axios.get("https://apiplus.novintex.com/api/v1/crypto/list/cryptos")
        const responseAxios:ResponseCrypto=cryptoListReq.data
        const cryptoList:CryptoEnt[]=responseAxios.data
        return cryptoList
       } catch (error) {
        console.log("-------- request crypto list ----------")
        console.log(error)
       }
    }

    async priceIrr():Promise<number>
     {
        try {
         // https://api.tetherland.com/currencies
         // https://data.tetherland.com/api/v4/currencies-list
            const priceRq=await axios.get(`https://api.tetherland.com/currencies`)
        const result=priceRq.data
        console.log("----- request price irr -----")
        console.log(result)
      //   const tetherPrice=result.data.currencies.find(item=>item.name=='Tether' && item.symbol=='USDT').toman_amount
      const tetherPrice=result.data.currencies.USDT.price
           return tetherPrice * 10 
        } catch (error) {
            console.log("-------- request Price IRR ----------")
            console.log(error)
        }
     }
}