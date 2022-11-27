import { Module } from '@nestjs/common';
import { GlobalModule } from 'src/global/global.module';
import { MemphisModule } from 'src/memphis/memphis.module';
import { BotIrrService } from './bot.irr.service';
import { BotManualCoinsService } from './bot.manual.coins.service';
import { BotStableCoinService } from './bot.stable.coin.service';
import { CryptoPricingService } from './crypto.pricing.service';

@Module({
    imports:[MemphisModule,GlobalModule],
    providers:[BotManualCoinsService,BotIrrService,CryptoPricingService,BotStableCoinService]
    // BotIrrService,CryptoPricingService,BotStableCoinService,
})
export class PricingModule {}
