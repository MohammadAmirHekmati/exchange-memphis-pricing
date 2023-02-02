import { Injectable, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression, Interval } from "@nestjs/schedule";
import { GlobalService } from "src/global/global.service";
import { RedisOriginService } from "src/origin-redis/redis.origin.service";
import { RedisPlusService } from "src/redis/redis-plus.service";
import { RedisService } from "src/redis/redis.service";
import { CryptoPricingService } from "./crypto.pricing.service";
import { CryptoEnt } from "./dto/crypto.entity";
import { RedisExchangeDto } from "./dto/redis.exchange.dto";
import { ExchangeTypeEnum } from "./enums/exchange.type.enum";
import { TypePriceCryptoEnum } from "./enums/type.price.column";
const axios=require("axios")

@Injectable()
export class BotManualCoinsService implements OnModuleInit{
    cryptoManual:any[]=[]
    cryptoLists:CryptoEnt[]=[]
    poolRedis=[]
    PREFIX_PRICE_EXCHANGE_CRYPTO="prefix_price_exchange_crypto_"
    constructor(private redisService:RedisOriginService,
        private globalService:GlobalService,
        private cryptoPricingService:CryptoPricingService,
        private redisPlusService:RedisPlusService){
        }
    async onModuleInit() {
        const res:CryptoEnt[]=await this.globalService.cryptoList()
        const manualCoins=res.filter(item=>item.type_get_price==TypePriceCryptoEnum.MANUAL)
        this.cryptoLists=this.cryptoLists.concat(res)
        for (let index = 0; index < manualCoins.length ;index++) {
            const getKeysOfRedis=await this.redisService.multiGetKeys(`${this.PREFIX_PRICE_EXCHANGE_CRYPTO}${manualCoins[index].symbol_crypto.toLowerCase()}*`)
            this.cryptoManual=this.cryptoManual.concat(getKeysOfRedis)
        }
    }

   

    @Cron(CronExpression.EVERY_10_MINUTES)
    async cronJObPriceManual() {
     for (let count = 0 ; count < this.cryptoManual.length ; count++ ) {
      try {
        const row = this.cryptoManual[count]
        const findExchnageOfRedis=<RedisExchangeDto>await this.redisService.getKey(row)
        const findFromCrypto=this.cryptoLists.find(item=>item.symbol_crypto.toLowerCase()==findExchnageOfRedis.from_crypto && item.type_get_price==TypePriceCryptoEnum.MANUAL)
        const findToCrypto=this.cryptoLists.find(item=>item.symbol_crypto.toLowerCase()==findExchnageOfRedis.to_crypto && item.type_get_price==TypePriceCryptoEnum.MANUAL)
        if(findFromCrypto)
        {
            const resultLink = await axios.get(`${findFromCrypto.link_price}`)
          let  result =resultLink.data
          const resultJson = findFromCrypto.result_link_price.split('.')
          resultJson.forEach(item=>{
            result=result[item]
          })

          findExchnageOfRedis.from_price=result.toFixed(6)
          findExchnageOfRedis.from_decimal=findFromCrypto.decimal.toString()
          await this.redisService.setKey(row,JSON.stringify(findExchnageOfRedis),999999)
          const filter =this.poolRedis.filter(item=>item==row)
              if (filter.length==0) this.poolRedis.push(row)
        }
        if(findToCrypto)
        {
            const resultLink = await axios.get(`${findToCrypto.link_price}`)
            let  result =resultLink.data
            const resultJson = findToCrypto.result_link_price.split('.')
            resultJson.forEach(item=>{
              result=result[item]
            })
  
            findExchnageOfRedis.from_price=result.toFixed(6)
            findExchnageOfRedis.from_decimal=findToCrypto.decimal.toString()
            await this.redisService.setKey(row,JSON.stringify(findExchnageOfRedis),999999)
            const filter =this.poolRedis.filter(item=>item==row)
                if (filter.length==0) this.poolRedis.push(row)
        }
        

        // if (row.from_crypto.type_get_price==TypePriceCryptoEnum.MANUAL) {
        //   const resultLink = await axios.get(`http://${process.env.APP_PRICING_ADDRESS}/manual/price?address=${row.from_crypto.link_price}`)
        //   let  result =resultLink.data
        //   const resultJson = row.from_crypto.result_link_price.split('.')
        //   resultJson.forEach(item=>{
        //     result=result[item]
        //   })
        //   const  pattern =`prefix_price_exchange_crypto_*${row.from_crypto.symbol_crypto.toLowerCase()}*`
  
        //   const getKeys = await this.redisPlusService.getKeys(pattern)
        //   for (let countKeys =0 ; countKeys < getKeys.length ; countKeys++) {
        //     const rowKeys = getKeys[countKeys]
        //     let key :RedisExchangeDto= <RedisExchangeDto>await this.redisService.getKey(rowKeys)
        //     if (key.from_crypto==row.from_crypto.symbol_crypto.toLowerCase()) {
        //       key.from_price=result.toFixed(6)
        //       key.to_decimal = row.to_crypto.decimal.toString()
        //       // key.equal_sale = exchangeVersionEnt.wage_sale_factory
        //       // key.equal_buy = exchangeVersionEnt.wage_buy_factory
        //     }
        //     await this.redisService.setKey(rowKeys , JSON.stringify(key) , 0)
        //     const filter =this.poolRedis.filter(item=>item==rowKeys)
        //     if (filter.length==0) this.poolRedis.push(rowKeys)
  
        //   }
        // }
        // if (row.to_crypto.type_get_price==TypePriceCryptoEnum.MANUAL) {
        //   const resultLink = await axios.get(`http://${process.env.APP_PRICING_ADDRESS}/manual/price?address=${row.from_crypto.link_price}`)
        //   let  result =resultLink.data
        //   const resultJson = row.to_crypto.result_link_price.split('.')
        //   resultJson.forEach(item=>{
        //     result=result[item]
        //   })
        //   const  pattern =`prefix_price_exchange_crypto_*${row.to_crypto.symbol_crypto.toUpperCase()}*`
        //   const getKeys = await this.redisPlusService.getKeys(pattern)
        //   for (let countKeys =0 ; countKeys < getKeys.length ; countKeys++) {
        //     const rowKeys = getKeys[countKeys]
        //     let key :RedisExchangeDto= <RedisExchangeDto>await this.redisService.getKey(rowKeys)
        //     if (key.to_crypto==row.to_crypto.symbol_crypto.toLowerCase()) {
        //       key.to_price=result.toFixed(6)
        //       key.to_decimal = row.to_crypto.decimal.toString()
        //       // key.equal_sale = exchangeVersionEnt.wage_sale_factory
        //       // key.equal_buy = exchangeVersionEnt.wage_buy_factory
        //     }
        //     await this.redisService.setKey(rowKeys , JSON.stringify(key) , 0)
        //     const filter =this.poolRedis.filter(item=>item==rowKeys)
        //     if (filter.length==0) this.poolRedis.push(rowKeys)
  
        //   }
        // }



        return true
      } catch (e) {
        console.log("-------- cron job price manual ------")
        console.log(e)
      }
     }
   }

   @Cron('* * * * * *')
   async callPriceJobManual() {
     try {
       const redis=[...new Set(this.poolRedis)]
       for(let count=0 ; count < redis.length ; count++) {
         const row = redis[count]
         const findedExchangeDto :RedisExchangeDto = <RedisExchangeDto>await this.redisService.getKey(row)
         if (findedExchangeDto.exchange_type.includes(ExchangeTypeEnum.OTC))
            this.cryptoPricingService.sendToAllPriceCryptoOtc(findedExchangeDto)
 
         if (findedExchangeDto.exchange_type.includes(ExchangeTypeEnum.CONVERT))
            this.cryptoPricingService.sendToAllPriceCryptoConvert(findedExchangeDto)
       }
     }catch (e) {
       console.log("--------- call price job manual ------")
       console.log(e)
     }
 
   }
}