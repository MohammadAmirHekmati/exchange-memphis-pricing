import { Injectable } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { RedisService } from "src/redis/redis.service";
import { IrrPriceDto } from "./dto/irr.price.dto";
import { RedisExchangeDto } from "./dto/redis.exchange.dto";
const bigDecimal=require( "js-big-decimal")

@Injectable()
export class BotIrrService{
    constructor(private redisService:RedisService)
    {}
    PREFIX_PRICE_EXCHANGE_CRYPTO="prefix_price_exchange_crypto_"
    PREFIX_PRICE_IRR='prefix_price_irr'
    defaultPrice:number=0
    @Interval(3000)
  async calcPriceIRR() {
    try {
      const getKey:IrrPriceDto=await this.redisService.getKey(this.PREFIX_PRICE_IRR)
      if(parseInt(getKey.price)!==0)
      this.defaultPrice=parseInt(getKey.price)
      const pattern=`${this.PREFIX_PRICE_EXCHANGE_CRYPTO}*irr`
    const getKeys=await this.redisService.multiGet(pattern)
    for (let count = 0 ; count < getKeys.length ; count++) {
      const row = getKeys[count]
      const keyIRR: RedisExchangeDto=<RedisExchangeDto>await this.redisService.getKey(row)
      if (keyIRR) {
        if (keyIRR.from_crypto=="irr") {
           keyIRR.from_price= bigDecimal.divide(1 , this.defaultPrice, 8)
        } else if (keyIRR.to_crypto=="irr") {
          keyIRR.to_price= bigDecimal.divide(1 , this.defaultPrice, 8)
        }
        await this.redisService.setKey(row , JSON.stringify(keyIRR) ,0)
      }

    }
    } catch (error) {
      console.log("----------- bot IRR service ---------")
      console.log(error) 
    }
  }
}