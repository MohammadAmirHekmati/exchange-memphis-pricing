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
    convertProducerChannelFour:Producer
    async onModuleInit() {
       await this.convertProducerConnection()
       await this.convertProducerConnectionChannelTwo()
       await this.convertProducerConnectionChannelThree()
       await this.convertProducerConnectionChannelFour()
    }


    async convertProducerConnection(){
        this.convertProducerChannelOne=await this.memphisConnection.producer({
            stationName: 'convert_channel_one',
            producerName: "one_pro_final"
        });

    }

        async convertProducerConnectionChannelTwo(){
            this.convertProducerChannelTwo=await this.memphisConnection.producer({
                stationName: 'convert_channel_two',
                producerName: "two_pro_final"
            });
    
        }
       
            async convertProducerConnectionChannelThree(){
                this.convertProducerChannelThree=await this.memphisConnection.producer({
                    stationName: 'convert_channel_three',
                    producerName: "three_pro_final"
                });
        
            }

            async convertProducerConnectionChannelFour(){
                this.convertProducerChannelFour=await this.memphisConnection.producer({
                    stationName: 'convert_channel_four',
                    producerName: "four_pro_final"
                });
        
            }
               
           async produceConvert(message:ConvertPriceDto){
                await this.convertProducerChannelOne.produce({
                    message: Buffer.from(JSON.stringify(message))
                });
           }

       async produceConvertChannelTwo(message:ConvertPriceDto){
            await this.convertProducerChannelTwo.produce({
                message: Buffer.from(JSON.stringify(message)),
            });
       }

   async produceConvertChannelThree(message:ConvertPriceDto){
        await this.convertProducerChannelThree.produce({
            message: Buffer.from(JSON.stringify(message))
        });
   }

   async produceConvertChannelFour(message:ConvertPriceDto){
    await this.convertProducerChannelFour.produce({
        message: Buffer.from(JSON.stringify(message)),
    });
}
            
           onApplicationShutdown(signal?: string) {
            this.memphisConnection.close();
        }
}