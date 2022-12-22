import { DynamicModule, Module, Provider } from "@nestjs/common";
import { createClient } from 'redis';
import { RedisOriginService } from "./redis.origin.service";

@Module({})
export class OriginRedisModule{
    static forRoot(host:string,port:number,db?:number):DynamicModule{
        const redisProvider:Provider={
            provide:"REDIS_CONNECTION_ORIGIN",
            useFactory:async ()=>{
                const client=createClient({url:`redis://${host}:${port}`})
                await client.connect()

                return client
            }
        }

        const redisDynamicModule:DynamicModule={
            module:OriginRedisModule,
            providers:[redisProvider,RedisOriginService],
            exports:[RedisOriginService],
            global:true
        }
        return redisDynamicModule
    }
}