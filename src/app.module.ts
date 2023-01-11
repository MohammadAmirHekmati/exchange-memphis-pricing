import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GlobalService } from './global/global.service';
import { MemphisModule } from './memphis/memphis.module';
import { PricingModule } from './pricing/pricing.module';
import { RedisModule } from './redis/redis.module';
import { GlobalModule } from './global/global.module';

@Module({
  imports: [RedisModule.forRoot("192.168.10.200",6379),ScheduleModule.forRoot(),PricingModule,MemphisModule, GlobalModule],
})
export class AppModule {}
