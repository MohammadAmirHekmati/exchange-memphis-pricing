import { Module } from '@nestjs/common';
import { MemphisConvertProducerService } from './convert.producer.service';
import { MemphisConnection } from './memphis.connection.service';
import { MemphisProducerService } from './producer.service';


@Module({
    providers:[MemphisProducerService,MemphisConvertProducerService,MemphisConnection],
    exports:[MemphisProducerService,MemphisConvertProducerService]
})
export class MemphisModule {}
