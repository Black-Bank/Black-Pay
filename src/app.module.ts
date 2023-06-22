import { Module } from '@nestjs/common';
import {
  AppController,
  CatsController,
  RequestController,
} from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './Guard/AuthGuard.guard';
import Crypto from './Guard/Crypto.service';

@Module({
  imports: [],
  controllers: [AppController, CatsController, RequestController],
  providers: [AppService, AuthGuard, Crypto],
})
export class AppModule {}
