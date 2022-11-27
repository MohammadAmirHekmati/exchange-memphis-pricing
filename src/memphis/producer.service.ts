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
    otcProducerChannelFour:Producer
    async onModuleInit() {
       await this.otcProducerConnection()
       await this.otcProducerConnectionChannelTwo()
       await this.otcProducerConnectionChannelThree()
       await this.otcProducerConnectionChannelFour()
    }

    async otcProducerConnection(){
    this.otcProducerChannelOne=await this.memphisConnection.producer({
    stationName: 'otc_channel_one',
    producerName: 'otc_channel_one'
    });
    }

    async otcProducerConnectionChannelTwo(){
        this.otcProducerChannelTwo=await this.memphisConnection.producer({
        stationName: 'otc_channel_two',
        producerName: 'otc_channel_two'
        });
    }
    
        async otcProducerConnectionChannelThree(){
            this.otcProducerChannelThree=await this.memphisConnection.producer({
            stationName: 'otc_channel_three',
            producerName: 'otc_channel_three'
                    });
        }

        async otcProducerConnectionChannelFour(){
            this.otcProducerChannelFour=await this.memphisConnection.producer({
            stationName: 'otc_channel_four',
            producerName: 'otc_channel_four'
            });
            }

           async produceOtc(message:PriceSendToAllRQ){
                await this.otcProducerChannelOne.produce({
                    message:Buffer.from(JSON.stringify(message)) ,
                })
           }

           async produceOtcChannelTwo(message:PriceSendToAllRQ){
            await this.otcProducerChannelTwo.produce({
                message:Buffer.from(JSON.stringify(message))
            });
       }

       async produceOtcChannelThree(message:PriceSendToAllRQ){
                await this.otcProducerChannelThree.produce({
            message:Buffer.from(JSON.stringify(message)) 
        });}    

        async produceOtcChannelFour(message:PriceSendToAllRQ){
            await this.otcProducerChannelFour.produce({
                message:Buffer.from(JSON.stringify(message)) 
            });}    

        
           onApplicationShutdown(signal?: string) {
            this.memphisConnection.close();
        }
}