import { BinanceScheduleDto } from "./binance.schedule.dto"

 

export class CandleBinanceDto {
    event_time: number
    symbol_event: string
  
    price: string
    quantity: string
  
    constructor(init? :BinanceScheduleDto) {
  
      this.event_time = init.data.E
      this.symbol_event = init.data.k.s
      this.price = init.data.k.c
      this.quantity = init.data.k.Q
    }
  
  }