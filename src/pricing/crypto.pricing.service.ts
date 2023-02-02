import { Injectable, OnModuleInit } from "@nestjs/common";
import { RedisService } from "src/redis/redis.service";
import { CandleBinanceDto } from "./dto/binance.candle.dto";
import { CryptoEnt } from "./dto/crypto.entity";
import { RedisExchangeDto } from "./dto/redis.exchange.dto";
import { PriceStatusEnum } from "./enums/socket.status";
import { TypePriceCryptoEnum } from "./enums/type.price.column";
const bigDecimal=require("js-big-decimal")
import { Crypto, ResponseCrypto } from "./response/crypto.response";
import { PublicFunc } from "src/public.func";
import { ConvertPriceDto } from "./dto/convert.price.dto";
import { PriceSendToAllRQ } from "./dto/price.send.to.all.dto";
import { ExchangeTypeEnum } from "./enums/exchange.type.enum";
import { GlobalService } from "../global/global.service";
import { MemphisProducerService } from "src/memphis/producer.service";
import { MemphisConvertProducerService } from "src/memphis/convert.producer.service";
import { RedisPlusService } from "src/redis/redis-plus.service";
import { sample } from "rxjs";
import { RedisOriginService } from "src/origin-redis/redis.origin.service";
var WebSocketClient = require('websocket').w3cwebsocket;

@Injectable()
export class CryptoPricingService implements OnModuleInit{
  cryptoManual
    constructor(private redisService:RedisOriginService,
      private memphisProducerService:MemphisProducerService,
      private memphisConvertProducer:MemphisConvertProducerService,
      private globalService:GlobalService){
        setTimeout(()=>{
          this.getPriceCryptoRepository()
        },5000)
    }

  async onModuleInit() {
    const listCrypto= await this.globalService.cryptoList()
       this.cryptoList=this.cryptoList.concat(listCrypto)
  }

    PREFIX_PRICE_EXCHANGE_CRYPTO="prefix_price_exchange_crypto_"
    cryptoList:CryptoEnt[]=[]
    async getPriceCryptoRepository() {
      try {
       const subscribe = "usdt@kline_1s"
       let finalBinanceChannelOne=[]
       let finalBinanceChannelTwo=[]
       let finalBinanceChannelThree=[]
       let finalBinanceChannelFour=[]
       const pattern=`*${this.PREFIX_PRICE_EXCHANGE_CRYPTO}*`
       const findALlKeys=await this.redisService.multiGetKeys(pattern)
       for (const key of findALlKeys) {
        const findedExchangeDto=<RedisExchangeDto>await this.redisService.getKey(key)
        console.log(key)
         const fromCrypto=this.cryptoList.find(item=>item.symbol_crypto.toLowerCase()==findedExchangeDto.from_crypto.toLowerCase() && item.type_get_price==TypePriceCryptoEnum.REPOSITORY)
        const toCrypto=this.cryptoList.find(item=>item.symbol_crypto.toLowerCase()==findedExchangeDto.to_crypto.toLowerCase() && item.type_get_price==TypePriceCryptoEnum.REPOSITORY)
   
         if (fromCrypto) {
           if (fromCrypto.crypto_socket == PriceStatusEnum.CHANNEL_1)
             finalBinanceChannelOne.push(`${fromCrypto.symbol_crypto.toLowerCase()}${subscribe}`)
           if (fromCrypto.crypto_socket == PriceStatusEnum.CHANNEL_2)
             finalBinanceChannelTwo.push(`${fromCrypto.symbol_crypto.toLowerCase()}${subscribe}`)
           if (fromCrypto.crypto_socket == PriceStatusEnum.CHANNEL_3)
             finalBinanceChannelThree.push(`${fromCrypto.symbol_crypto.toLowerCase()}${subscribe}`)
             if (fromCrypto.crypto_socket == PriceStatusEnum.CHANNEL_4)
             finalBinanceChannelFour.push(`${fromCrypto.symbol_crypto.toLowerCase()}${subscribe}`)
         }
   
         if(toCrypto)
         {
           if (toCrypto.crypto_socket == PriceStatusEnum.CHANNEL_1)
             finalBinanceChannelOne.push(`${toCrypto.symbol_crypto.toLowerCase()}${subscribe}`)
           if (toCrypto.crypto_socket == PriceStatusEnum.CHANNEL_2)
             finalBinanceChannelTwo.push(`${toCrypto.symbol_crypto.toLowerCase()}${subscribe}`)
           if (toCrypto.crypto_socket == PriceStatusEnum.CHANNEL_3)
             finalBinanceChannelThree.push(`${toCrypto.symbol_crypto.toLowerCase()}${subscribe}`)
             if (toCrypto.crypto_socket == PriceStatusEnum.CHANNEL_4)
             finalBinanceChannelFour.push(`${toCrypto.symbol_crypto.toLowerCase()}${subscribe}`)
         }


       }
       finalBinanceChannelOne=[...new Set(finalBinanceChannelOne)]
       finalBinanceChannelTwo=[...new Set(finalBinanceChannelTwo)]
       finalBinanceChannelThree=[...new Set(finalBinanceChannelThree)]
       finalBinanceChannelFour=[...new Set(finalBinanceChannelFour)]

    const channelOne=new WebSocketClient(`wss://stream.binance.com:9443/stream?streams=${finalBinanceChannelOne.join("/")}`)
      channelOne.onmessage=async (e)=>{
      const parsedJson=JSON.parse(e.data)
      const tradeBinanceDto : CandleBinanceDto =  new CandleBinanceDto(parsedJson)
         const symbolSocket = tradeBinanceDto.symbol_event.substring(0 , tradeBinanceDto.symbol_event.length-4).toLowerCase()
         const pattern=`${this.PREFIX_PRICE_EXCHANGE_CRYPTO}*${symbolSocket}*`
         const getExchangeOfRedis=await this.redisService.multiGetKeys(pattern)
         for (const exchangeOfRedis of getExchangeOfRedis) {
           const findedExchangeDto=<RedisExchangeDto>await this.redisService.getKey(exchangeOfRedis)
           findedExchangeDto.from_crypto==symbolSocket?findedExchangeDto.from_price=tradeBinanceDto.price:findedExchangeDto.to_price=tradeBinanceDto.price
           findedExchangeDto.time=Date.now().toString()
           if (findedExchangeDto.exchange_type.includes(ExchangeTypeEnum.OTC))
            await this.sendToAllPriceCryptoOtc(findedExchangeDto)
     
           if (findedExchangeDto.exchange_type.includes(ExchangeTypeEnum.CONVERT))
             await this.sendToAllPriceCryptoConvert(findedExchangeDto)
     
           await this.redisService.setKey(exchangeOfRedis,JSON.stringify(findedExchangeDto),999999)
         }
      }

      const channelTwo=new WebSocketClient(`wss://stream.binance.com:9443/stream?streams=${finalBinanceChannelTwo.join("/")}`)
      channelTwo.onmessage=async (e)=>{
      const parsedJson=JSON.parse(e.data)
      const tradeBinanceDto : CandleBinanceDto =  new CandleBinanceDto(parsedJson)
         const symbolSocket = tradeBinanceDto.symbol_event.substring(0 , tradeBinanceDto.symbol_event.length-4).toLowerCase()
         const pattern=`${this.PREFIX_PRICE_EXCHANGE_CRYPTO}*${symbolSocket}*`
         const getExchangeOfRedis=await this.redisService.multiGetKeys(pattern)
         for (const exchangeOfRedis of getExchangeOfRedis) {
           const findedExchangeDto=<RedisExchangeDto>await this.redisService.getKey(exchangeOfRedis)
           findedExchangeDto.from_crypto==symbolSocket?findedExchangeDto.from_price=tradeBinanceDto.price:findedExchangeDto.to_price=tradeBinanceDto.price
           findedExchangeDto.time=Date.now().toString()
           if (findedExchangeDto.exchange_type.includes(ExchangeTypeEnum.OTC))
            await this.sendToAllPriceCryptoOtc(findedExchangeDto)
     
           if (findedExchangeDto.exchange_type.includes(ExchangeTypeEnum.CONVERT))
             await this.sendToAllPriceCryptoConvert(findedExchangeDto)
     
           await this.redisService.setKey(exchangeOfRedis,JSON.stringify(findedExchangeDto),999999)
         }
      }

      const channelThree=new WebSocketClient(`wss://stream.binance.com:9443/stream?streams=${finalBinanceChannelThree.join("/")}`)
      channelThree.onmessage=async (e)=>{
      const parsedJson=JSON.parse(e.data)
      const tradeBinanceDto : CandleBinanceDto =  new CandleBinanceDto(parsedJson)
         const symbolSocket = tradeBinanceDto.symbol_event.substring(0 , tradeBinanceDto.symbol_event.length-4).toLowerCase()
         const pattern=`${this.PREFIX_PRICE_EXCHANGE_CRYPTO}*${symbolSocket}*`
         const getExchangeOfRedis=await this.redisService.multiGetKeys(pattern)
         for (const exchangeOfRedis of getExchangeOfRedis) {
           const findedExchangeDto=<RedisExchangeDto>await this.redisService.getKey(exchangeOfRedis)
           findedExchangeDto.from_crypto==symbolSocket?findedExchangeDto.from_price=tradeBinanceDto.price:findedExchangeDto.to_price=tradeBinanceDto.price
           findedExchangeDto.time=Date.now().toString()
           if (findedExchangeDto.exchange_type.includes(ExchangeTypeEnum.OTC))
            await this.sendToAllPriceCryptoOtc(findedExchangeDto)
     
           if (findedExchangeDto.exchange_type.includes(ExchangeTypeEnum.CONVERT))
             await this.sendToAllPriceCryptoConvert(findedExchangeDto)
     
           await this.redisService.setKey(exchangeOfRedis,JSON.stringify(findedExchangeDto),999999)
         }
      }

      const channelFour=new WebSocketClient(`wss://stream.binance.com:9443/stream?streams=${finalBinanceChannelFour.join("/")}`)
      channelFour.onmessage=async (e)=>{
      const parsedJson=JSON.parse(e.data)
      const tradeBinanceDto : CandleBinanceDto =  new CandleBinanceDto(parsedJson)
         const symbolSocket = tradeBinanceDto.symbol_event.substring(0 , tradeBinanceDto.symbol_event.length-4).toLowerCase()
         const pattern=`${this.PREFIX_PRICE_EXCHANGE_CRYPTO}*${symbolSocket}*`
         const getExchangeOfRedis=await this.redisService.multiGetKeys(pattern)
         for (const exchangeOfRedis of getExchangeOfRedis) {
           const findedExchangeDto=<RedisExchangeDto>await this.redisService.getKey(exchangeOfRedis)
           findedExchangeDto.from_crypto==symbolSocket?findedExchangeDto.from_price=tradeBinanceDto.price:findedExchangeDto.to_price=tradeBinanceDto.price
           findedExchangeDto.time=Date.now().toString()
           if (findedExchangeDto.exchange_type.includes(ExchangeTypeEnum.OTC))
            await this.sendToAllPriceCryptoOtc(findedExchangeDto)
     
           if (findedExchangeDto.exchange_type.includes(ExchangeTypeEnum.CONVERT))
             await this.sendToAllPriceCryptoConvert(findedExchangeDto)
     
           await this.redisService.setKey(exchangeOfRedis,JSON.stringify(findedExchangeDto),999999)
         }
      }
      

      } catch (error) {
        console.log("----------- crypto pricing -------------")
        console.log(error)
      }
}

      async sendToAllPriceCryptoOtc(redisPrice:RedisExchangeDto)
          {
            try {
              const priceSendToAllRQ: PriceSendToAllRQ = {
                from: redisPrice.from_crypto,
                to: redisPrice.to_crypto,
                from_decimal: redisPrice.from_decimal,
                to_decimal: redisPrice.to_decimal,
                channel: redisPrice.channel
              }
              
                if (redisPrice.from_price != '0' && redisPrice.to_price != '0') {
                  // if(redisPrice.from_crypto.toUpperCase()=="USDT")
                  // {
                  //   console.log(redisPrice.equal_buy)
                  //   console.log(redisPrice.equal_sale)
                  // }
                  const equal = PublicFunc.divide(bigDecimal.divide(redisPrice.from_price, redisPrice.to_price, 18), Number(redisPrice.to_decimal))
                  if(redisPrice.equal_buy=="0")
                  priceSendToAllRQ.sale_to_exchange=equal

                  if(redisPrice.equal_sale=="0")
                  priceSendToAllRQ.buy_from_exchange=equal

                  if(redisPrice.equal_sale!=="0")
                  {
                    
                    const percentBuy = bigDecimal.divide(redisPrice.equal_sale, 100, 5)
                    const buy = PublicFunc.divide(bigDecimal.add(equal, bigDecimal.multiply(equal, percentBuy)), Number(redisPrice.to_decimal))
                    priceSendToAllRQ.buy_from_exchange=buy
                  }

                  if(redisPrice.equal_buy!=="0")
                  {  
                    const percentSale = bigDecimal.divide(redisPrice.equal_buy, 100, 5)
                    const sale = PublicFunc.divide(bigDecimal.add(equal, bigDecimal.negate(bigDecimal.multiply(equal, percentSale))), Number(redisPrice.to_decimal))
                    priceSendToAllRQ.sale_to_exchange=sale
                  }

                  switch (priceSendToAllRQ.channel) {
                    case PriceStatusEnum.CHANNEL_1:
                      await this.memphisProducerService.produceOtc(priceSendToAllRQ)
                      break;

                      case PriceStatusEnum.CHANNEL_2:
                      await this.memphisProducerService.produceOtcChannelTwo(priceSendToAllRQ)
                      break;

                      case PriceStatusEnum.CHANNEL_3:
                      await this.memphisProducerService.produceOtcChannelThree(priceSendToAllRQ)
                      break;

                      case PriceStatusEnum.CHANNEL_4:
                        await this.memphisProducerService.produceOtcChannelFour(priceSendToAllRQ)
                      break;
                  }
                  
                }
            } catch (e) {
              console.log("-------- exchnage otc ------")
              console.log(e)
                process.exit()
            }
          }
        
         async sendToAllPriceCryptoConvert(redisExchangeDto:RedisExchangeDto)
          {
            try {
              if(redisExchangeDto.convert_wage!=="0")
                {const cryptoPriceIrr = bigDecimal.divide(redisExchangeDto.from_price, redisExchangeDto.to_price, redisExchangeDto.to_decimal)
        
                const multiplyPercent = bigDecimal.multiply(cryptoPriceIrr, redisExchangeDto.convert_wage)
                const feeAmount = bigDecimal.divide(multiplyPercent, 100, redisExchangeDto.from_decimal)
                const finalPriceCrypto = bigDecimal.add(cryptoPriceIrr, feeAmount)
        
                const convertPriceDto: ConvertPriceDto = {
                  from_crypto: redisExchangeDto.from_crypto,
                  rate: PublicFunc.divide(finalPriceCrypto, Number(redisExchangeDto.to_decimal)),
                  to_crypto: redisExchangeDto.to_crypto,
                  channel: redisExchangeDto.channel
                }
                switch (convertPriceDto.channel) {
                    case PriceStatusEnum.CHANNEL_1:
                      await this.memphisConvertProducer.produceConvert(convertPriceDto)
                      break;

                      case PriceStatusEnum.CHANNEL_2:
                      await this.memphisConvertProducer.produceConvertChannelTwo(convertPriceDto)
                      break;
                      
                      case PriceStatusEnum.CHANNEL_3:
                      await this.memphisConvertProducer.produceConvertChannelThree(convertPriceDto)
                      break;

                      case PriceStatusEnum.CHANNEL_4:
                        await this.memphisConvertProducer.produceConvertChannelFour(convertPriceDto)
                      break;
                  }}

                  else if (redisExchangeDto.convert_wage=="0")
                  {
                    const cryptoPriceIrr = bigDecimal.divide(redisExchangeDto.from_price, redisExchangeDto.to_price, redisExchangeDto.to_decimal)
                const convertPriceDto: ConvertPriceDto = {
                  from_crypto: redisExchangeDto.from_crypto,
                  rate: PublicFunc.divide(cryptoPriceIrr, Number(redisExchangeDto.to_decimal)),
                  to_crypto: redisExchangeDto.to_crypto,
                  channel: redisExchangeDto.channel
                }
                switch (convertPriceDto.channel) {
                    case PriceStatusEnum.CHANNEL_1:
                      await this.memphisConvertProducer.produceConvert(convertPriceDto)
                      break;

                      case PriceStatusEnum.CHANNEL_2:
                      await this.memphisConvertProducer.produceConvertChannelTwo(convertPriceDto)
                      break;
                      
                      case PriceStatusEnum.CHANNEL_3:
                      await this.memphisConvertProducer.produceConvertChannelThree(convertPriceDto)
                      break;

                      case PriceStatusEnum.CHANNEL_4:
                        await this.memphisConvertProducer.produceConvertChannelFour(convertPriceDto)
                      break;
                  }}
                  }
             catch (e) { 
              console.log("-------- exchnage convert ------")
                process.exit()
            }
          }

}