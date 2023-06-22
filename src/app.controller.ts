import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { PayResponse } from './types';
import { Request } from 'express';
import { AuthGuard } from './Guard/AuthGuard.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): PayResponse {
    return this.appService.getBalance();
  }
}
@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return '';
  }
  @Get('one')
  queryOne(): string {
    return '';
  }
}

@Controller('security')
@UseGuards(AuthGuard)
export class RequestController {
  @Get()
  findAll(@Req() request: Request): any {
    return {
      name: 'cyro ',
      value: 1000,
    };
  }
}
