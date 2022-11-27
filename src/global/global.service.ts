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
        const cryptoListReq=await axios.get("http://localhost:42621/api/v1/crypto/list/cryptos")
        const responseAxios:ResponseCrypto=cryptoListReq.data
        const cryptoList:CryptoEnt[]=responseAxios.data
        return cryptoList
       } catch (error) {
        console.log("-------- request crypto list ----------")
        console.log(error)
       }
    }
}