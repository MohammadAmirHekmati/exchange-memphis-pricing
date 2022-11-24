import { Module } from '@nestjs/common';
import { GlobalModule } from 'src/global/global.module';
import { MemphisModule } from 'src/memphis/memphis.module';
import { BotIrrService } from './bot.irr.service';
import { CryptoPricingService } from './crypto.pricing.service';
import { ManualPricingService } from './manual.pricing.service';

@Module({
    imports:[MemphisModule,GlobalModule],
    providers:[BotIrrService,CryptoPricingService]
})
export class PricingModule {}
