import { Inject, Injectable } from "@nestjs/common";
import { createClient } from "redis";

@Injectable()
export class RedisOriginService{
    constructor(@Inject("REDIS_CONNECTION_ORIGIN") private redisClient:ReturnType<typeof createClient>){
    }

    async setKeyNoExpire(key: string, value: string) {
        await this.redisClient.set(key, value,{EX:999999999});
      }
      async setKey(key: string, value: string, ttl?: number) {
        await this.redisClient.set(key, value,{EX:ttl});
      }

      async getKey(key: string): Promise<Record<string, any>> {
       try {
        const result = await this.redisClient.get(key);
        // if(typeof result=="object")
        // return result
        // else if(typeof result=='string')
        return JSON.parse(result)
       } catch (error) {
        // console.log(error)  
       }
      }
      async delKey(key: string): Promise<Object> {
        // return await this.redisClient.del(key);
        return
      }

      async multiGetKeys(pattern:string){
        return await this.redisClient.KEYS(pattern)
      }
}

