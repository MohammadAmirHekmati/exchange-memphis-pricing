import { Injectable, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression, Interval } from "@nestjs/schedule";
import { GlobalService } from "src/global/global.service";
import { RedisOriginService } from "src/origin-redis/redis.origin.service";
import { RedisPlusService } from "src/redis/redis-plus.service";
import { RedisService } from "src/redis/redis.service";
import { IrrPriceDto } from "./dto/irr.price.dto";
import { RedisExchangeDto } from "./dto/redis.exchange.dto";
const bigDecimal=require( "js-big-decimal")

@Injectable()
export class BotIrrService implements OnModuleInit{
    constructor(private redisService:RedisOriginService,
      private globalService:GlobalService)
    {}
 async onModuleInit() {
    await this.firstTime()
  }
    PREFIX_PRICE_EXCHANGE_CRYPTO="prefix_price_exchange_crypto_"
    PREFIX_PRICE_IRR='prefix_price_irr'
    defaultPrice:number=0

    async firstTime(){
      try {
        const res=await this.globalService.priceIrr()
        console.log(res)
        this.defaultPrice=res
        await this.redisService.setKey(this.PREFIX_PRICE_IRR,JSON.stringify({price:`${this.defaultPrice}`}),99999)
        return true
      } catch (error) {
        console.log("--- first time --------")
        console.log(error)
      }
    }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async priceIrr(){
        const res=await this.globalService.priceIrr()
        this.defaultPrice=res
        await this.redisService.setKey(this.PREFIX_PRICE_IRR,JSON.stringify({price:`${this.defaultPrice}`}),999999)
        return true
    }

    
    @Interval(1000)
  async calcPriceIRR() {
    try {
      const getKey=<IrrPriceDto>await this.redisService.getKey(this.PREFIX_PRICE_IRR)
      if(parseInt(getKey.price)!==0)
      this.defaultPrice=parseInt(getKey.price)

      // console.log(getKey)
      const pattern=`${this.PREFIX_PRICE_EXCHANGE_CRYPTO}*irr`
    const getKeys=await this.redisService.multiGetKeys(pattern)
    for (let count = 0 ; count < getKeys.length ; count++) {
      const row = getKeys[count]
      const keyIRR: RedisExchangeDto=<RedisExchangeDto>await this.redisService.getKey(row)
      if (keyIRR) {
        if (keyIRR.from_crypto=="irr") {
           keyIRR.from_price= bigDecimal.divide(1 , this.defaultPrice, 10)
        } else if (keyIRR.to_crypto=="irr") {
          keyIRR.to_price= bigDecimal.divide(1 , this.defaultPrice, 10)
        }
        // console.log(this.defaultPrice)
        await this.redisService.setKey(row , JSON.stringify(keyIRR) ,999999)
      }

    }
    } catch (error) {
      // console.log("----------- bot IRR service ---------")
      // process.exit()
    }
  }
}