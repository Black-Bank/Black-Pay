import { Module } from '@nestjs/common';
import {
  AppController,
  CatsController,
  RequestController,
} from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './Guard/AuthGuard.guard';
import Crypto from './Guard/Crypto.service';
import Contract from './Contract/ERC20.service';
import { ContractController } from './Contract/ERC20.controller';

@Module({
  imports: [],
  controllers: [
    AppController,
    CatsController,
    RequestController,
    ContractController,
  ],
  providers: [AppService, AuthGuard, Crypto, Contract],
})
export class AppModule {}
