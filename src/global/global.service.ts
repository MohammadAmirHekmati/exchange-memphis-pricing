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

    async otcExchangeManual():Promise<ExchangeOtcEnt[]>{
       try {
        const request=await axios.get("http://195.201.86.188:42621/api/v1/otc/manual")
        const axiosRes:ResponseExchangeOtc=request.data

        const otcExchanges=axiosRes.data

        return otcExchanges
       } catch (error) {
        console.log("--------- request exchange otc -------")
        console.log(error)
       }
    }

    async convertExchangeManual():Promise<ExchangeSpotEnt[]>{
       try {
        const request=await axios.get("http://195.201.86.188:42621/api/v1/convert/manual")
        const axiosRes:ResponseExchangeSpot=request.data
        const convertExchanges=axiosRes.data

        return convertExchanges
        
       } catch (error) {
        console.log("---------- request convert exchanges -------")
        console.log(error)
       }
    }
}