import { Inject, Injectable, OnApplicationShutdown, OnModuleInit } from "@nestjs/common";
import * as memphis from 'memphis-dev';
import type { Memphis, Producer } from 'memphis-dev/types';
import { PriceSendToAllRQ } from "src/pricing/dto/price.send.to.all.dto";
@Injectable()
export class MemphisProducerService implements OnModuleInit,OnApplicationShutdown{
    constructor(@Inject("MEMPHIS_CLIENT") private memphisConnection: Memphis){}
    
    otcProducerChannelOne:Producer
    otcProducerChannelTwo:Producer
    otcProducerChannelThree:Producer
    async onModuleInit() {
       await this.otcProducerConnection()
       await this.otcProducerConnectionChannelTwo()
       await this.otcProducerConnectionChannelThree()
    }

    async otcProducerConnection(){
    this.otcProducerChannelOne=await this.memphisConnection.producer({
    stationName: 'otc',
    producerName: 'otc_producer_channel_one'
    });
    }

    async otcProducerConnectionChannelTwo(){
        this.otcProducerChannelTwo=await this.memphisConnection.producer({
        stationName: 'otc',
        producerName: 'otc_producer_channel_two'
        });
    }
    
        async otcProducerConnectionChannelThree(){
            this.otcProducerChannelThree=await this.memphisConnection.producer({
            stationName: 'otc',
            producerName: 'otc_producer_channel_three'
            });
        }

           async produceOtc(message:PriceSendToAllRQ){
    
                const headers = memphis.headers()
                headers.add('key', 'value');
                await this.otcProducerChannelOne.produce({
                    message:Buffer.from(JSON.stringify(message)) ,
                    headers: headers
                })
           }

           async produceOtcChannelTwo(message:PriceSendToAllRQ){
            const headers = memphis.headers()
            headers.add('key', 'value');
            await this.otcProducerChannelTwo.produce({
                message:Buffer.from(JSON.stringify(message)) ,
                headers: headers
            });
       }

       async produceOtcChannelThree(message:PriceSendToAllRQ){
        const headers = memphis.headers()
        headers.add('key', 'value');
        await this.otcProducerChannelThree.produce({
            message:Buffer.from(JSON.stringify(message)) ,
            headers: headers
        });}    

        
           onApplicationShutdown(signal?: string) {
            this.memphisConnection.close();
        }
}