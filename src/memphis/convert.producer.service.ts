import { Inject, Injectable, OnApplicationShutdown, OnModuleInit } from "@nestjs/common";
import * as memphis from 'memphis-dev';
import type { Memphis, Producer } from 'memphis-dev/types';
import { ConvertPriceDto } from "src/pricing/dto/convert.price.dto";

@Injectable()
export class MemphisConvertProducerService implements OnModuleInit,OnApplicationShutdown{
        constructor(@Inject("MEMPHIS_CLIENT") private memphisConnection:Memphis){}
    convertProducerChannelOne:Producer
    convertProducerChannelTwo:Producer
    convertProducerChannelThree:Producer
    async onModuleInit() {
       await this.convertProducerConnection()
       await this.convertProducerConnectionChannelTwo()
       await this.convertProducerConnectionChannelThree()
    }


    async convertProducerConnection(){
        this.convertProducerChannelOne=await this.memphisConnection.producer({
            stationName: 'final_convert_pricing',
            producerName: "convert_producer_channel_one"
        });

    }

        async convertProducerConnectionChannelTwo(){
            this.convertProducerChannelTwo=await this.memphisConnection.producer({
                stationName: 'final_convert_pricing',
                producerName: "convert_producer_channel_two"
            });
    
        }
       
            async convertProducerConnectionChannelThree(){
                this.convertProducerChannelThree=await this.memphisConnection.producer({
                    stationName: 'final_convert_pricing',
                    producerName: "convert_producer_channel_three"
                });
        
            }
               
           async produceConvert(message:ConvertPriceDto){
                const headers = memphis.headers()
                headers.add('key', 'value');
                await this.convertProducerChannelOne.produce({
                    message: Buffer.from(JSON.stringify(message)),
                    headers: headers
                });
           }

       async produceConvertChannelTwo(message:ConvertPriceDto){
            const headers = memphis.headers()
            headers.add('key', 'value');
            await this.convertProducerChannelTwo.produce({
                message: Buffer.from(JSON.stringify(message)),
                headers: headers
            });
       }

   async produceConvertChannelThree(message:ConvertPriceDto){
        const headers = memphis.headers()
        headers.add('key', 'value');
        await this.convertProducerChannelThree.produce({
            message: Buffer.from(JSON.stringify(message)),
            headers: headers
        });
   }
            
           onApplicationShutdown(signal?: string) {
            this.memphisConnection.close();
        }
}