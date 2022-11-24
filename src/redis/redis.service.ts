import { Inject, Injectable } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { parse } from "path";
import { RedisExchangeDto } from "src/pricing/dto/redis.exchange.dto";

@Injectable()
export class RedisService{
    constructor(@Inject("REDIS_CLIENT") private client){
    }

    async multiGet(pattern:string):Promise<string[]>
    {
        return await this.client.KEYS(pattern)
    }

    async getKey(key:string){
        const res=await this.client.GET(key)
       if (typeof JSON.parse(res) != "string") {
            return JSON.parse(res)
       } else{
        return JSON.parse(JSON.parse(res))
       }
    }

    async setKey(key:string,value:string,ttl:number)
    {
        await this.client.SET(key,value,ttl)
    }
}