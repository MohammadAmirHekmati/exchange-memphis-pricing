import { DynamicModule, Module, Provider } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisService } from './redis.service';

@Module({})
export class RedisModule {
    static register():DynamicModule{
        const connectionProvider:Provider={
            provide:"REDIS_CLIENT",
            useFactory:async ()=>{
                const client = createClient({url: 'redis://localhost:6379',database:0});

                client.on('error', (err) => console.log('Redis Client Error', err));

                    await client.connect();
                    return client
            }
        }

        const dynamicModule:DynamicModule={
            module:RedisModule,
            providers:[RedisService,connectionProvider],
            exports:[RedisService,connectionProvider],
            global:true
        }
            return dynamicModule
    }
}
