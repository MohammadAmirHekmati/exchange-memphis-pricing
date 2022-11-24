import { Cron, CronExpression } from "@nestjs/schedule";
import { PublicFunc } from "src/public.func";
import { RedisService } from "src/redis/redis.service";
import { RedisExchangeDto } from "./dto/redis.exchange.dto";
import { TypePriceCryptoEnum } from "./enums/type.price.column";
import { GlobalService } from "../global/global.service";
import bigDecimal from "js-big-decimal";
import { PriceSendToAllRQ } from "./dto/price.send.to.all.dto";
import { ConvertPriceDto } from "./dto/convert.price.dto";
import { ExchangeTypeEnum } from "./enums/exchange.type.enum";
import { MemphisProducerService } from "src/memphis/producer.service";
import { OnModuleInit } from "@nestjs/common";
import { MemphisConvertProducerService } from "src/memphis/convert.producer.service";
import { PriceStatusEnum } from "./enums/socket.status";
const axios=require("axios")
export class ManualPricingService implements OnModuleInit{
    constructor(private redisService:RedisService,
      private globalService:GlobalService,
      private memphisProducerService:MemphisProducerService,
      private memphisConvertProducerService:MemphisConvertProducerService){
        
      }
 async  onModuleInit() {
    const otcExchanges=await this.globalService.otcExchangeManual()
    const convertExchanges=await  this.globalService.convertExchangeManual()
    this.cryptoManual=this.cryptoManual.concat(otcExchanges)
    this.cryptoManual=this.cryptoManual.concat(convertExchanges)
  }

      poolRedis=[]
    cryptoManual=[]
    PREFIX_PRICE_EXCHANGE_CRYPTO="prefix_price_exchange_crypto_"

      @Cron('* * * * * *')
  async callPriceJobManual() {
    try {
      const redis=[...new Set(this.poolRedis)]
      for(let count=0 ; count < redis.length ; count++) {
        const row = redis[count]
        const findedExchangeDto :RedisExchangeDto = <RedisExchangeDto>await this.redisService.getKey(row)
        // await this.jobPriceService.sendPriceQueue(redisExchangeDto)
        if (findedExchangeDto.exchange_type.includes(ExchangeTypeEnum.OTC))
          this.sendToAllPriceOtc(findedExchangeDto)

        if (findedExchangeDto.exchange_type.includes(ExchangeTypeEnum.CONVERT))
          this.sendToAllPriceConvert(findedExchangeDto)
      }
    }catch (e) {
      console.log("--------- call price job manual ------")
      console.log(e)
    }

  }

    @Cron(CronExpression.EVERY_10_SECONDS)
  async cronJObPriceManual() {
    const getKeys=await this.redisService.multiGet(this.PREFIX_PRICE_EXCHANGE_CRYPTO)
   for (let count = 0 ; count < this.cryptoManual.length ; count++ ) {
    try {
      const row = this.cryptoManual[count]
      // @ts-ignore
      const exchangeVersionEnt : ExchangeVersionEnt =row.version
      if (row.from_crypto.type_get_price==TypePriceCryptoEnum.MANUAL) {
        const resultLink = await axios.get(`http://${process.env.APP_PRICING_ADDRESS}/manual/price?address=${row.from_crypto.link_price}`)
        let  result =resultLink.data
        const resultJson = row.from_crypto.result_link_price.split('.')
        resultJson.forEach(item=>{
          result=result[item]
        })
        const  pattern =`prefix_price_exchange_crypto_*${row.from_crypto.symbol_crypto.toLowerCase()}*`

        const getKeys = await this.redisService.multiGet(pattern)
        for (let countKeys =0 ; countKeys < getKeys.length ; countKeys++) {
          const rowKeys = getKeys[countKeys]
          let key :RedisExchangeDto= <RedisExchangeDto>await this.redisService.getKey(rowKeys)
          if (key.from_crypto==row.from_crypto.symbol_crypto.toLowerCase()) {
            key.from_price=result.toFixed(6)
            key.to_decimal = row.to_crypto.decimal.toString()
            // key.equal_sale = exchangeVersionEnt.wage_sale_factory
            // key.equal_buy = exchangeVersionEnt.wage_buy_factory
          }
          await this.redisService.setKey(rowKeys , JSON.stringify(key) , 0)
          const filter =this.poolRedis.filter(item=>item==rowKeys)
          if (filter.length==0) this.poolRedis.push(rowKeys)

        }
      }
      if (row.to_crypto.type_get_price==TypePriceCryptoEnum.MANUAL) {
        const resultLink = await axios.get(`http://${process.env.APP_PRICING_ADDRESS}/manual/price?address=${row.from_crypto.link_price}`)
        let  result =resultLink.data
        const resultJson = row.to_crypto.result_link_price.split('.')
        resultJson.forEach(item=>{
          result=result[item]
        })
        const  pattern =`prefix_price_exchange_crypto_*${row.to_crypto.symbol_crypto.toUpperCase()}*`
        const getKeys = await this.redisService.multiGet(pattern)
        for (let countKeys =0 ; countKeys < getKeys.length ; countKeys++) {
          const rowKeys = getKeys[countKeys]
          let key :RedisExchangeDto= <RedisExchangeDto>await this.redisService.getKey(rowKeys)
          if (key.to_crypto==row.to_crypto.symbol_crypto.toLowerCase()) {
            key.to_price=result.toFixed(6)
            key.to_decimal = row.to_crypto.decimal.toString()
            // key.equal_sale = exchangeVersionEnt.wage_sale_factory
            // key.equal_buy = exchangeVersionEnt.wage_buy_factory
          }
          await this.redisService.setKey(rowKeys , JSON.stringify(key) , 0)
          const filter =this.poolRedis.filter(item=>item==rowKeys)
          if (filter.length==0) this.poolRedis.push(rowKeys)

        }
      }
      return true
    } catch (e) {
      console.log("-------- cron job price manual ------")
      console.log(e)
    }
   }
 }


async sendToAllPriceOtc(redisPrice:RedisExchangeDto)
 {
   try {
       if (redisPrice.from_price != '0' && redisPrice.to_price != '0') {
         const equal = PublicFunc.divide(bigDecimal.divide(redisPrice.from_price, redisPrice.to_price, 18), Number(redisPrice.to_decimal))
         const percentSale = bigDecimal.divide(redisPrice.equal_sale, 100, 2)
         const percentBuy = bigDecimal.divide(redisPrice.equal_buy, 100, 2)
         const buy = PublicFunc.divide(bigDecimal.add(equal, bigDecimal.multiply(equal, percentSale)), Number(redisPrice.to_decimal))
         const sale = PublicFunc.divide(bigDecimal.add(equal, bigDecimal.negate(bigDecimal.multiply(equal, percentBuy)))
             , Number(redisPrice.to_decimal))
         const priceSendToAllRQ: PriceSendToAllRQ = {
           from: redisPrice.from_crypto,
           to: redisPrice.to_crypto,
           buy_from_exchange: buy,
           sale_to_exchange: sale,
           from_decimal: redisPrice.from_decimal,
           to_decimal: redisPrice.to_decimal,
           channel: redisPrice.channel
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
        }
       }
   } catch (e) {}
 }

 async  sendToAllPriceConvert(redisExchangeDto:RedisExchangeDto)
 {
   try {
       const cryptoPriceIrr = bigDecimal.divide(redisExchangeDto.from_price, redisExchangeDto.to_price, redisExchangeDto.to_decimal)

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
          await this.memphisConvertProducerService.produceConvert(convertPriceDto)
          break;

          case PriceStatusEnum.CHANNEL_2:
          await this.memphisConvertProducerService.produceConvertChannelTwo(convertPriceDto)
          break;
          
          case PriceStatusEnum.CHANNEL_3:
          await this.memphisConvertProducerService.produceConvertChannelThree(convertPriceDto)
          break;
      }
        } catch (e) { }
 }
}