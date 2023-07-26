import { Module } from '@nestjs/common';
import { AuthGuard } from './Guard/AuthGuard.guard';
import Crypto from './Guard/Crypto.service';
import Contract from './Contract/ERC20.service';
import { ContractController } from './Contract/ERC20.controller';
import { Web3Service } from './Contract/ERC20.loader';

@Module({
  imports: [],
  controllers: [ContractController],
  providers: [AuthGuard, Crypto, Contract, Web3Service],
})
export class AppModule {}
