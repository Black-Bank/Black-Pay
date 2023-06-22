import { Injectable } from '@nestjs/common';
import { PayResponse } from './types';

@Injectable()
export class AppService {
  getBalance(): PayResponse {
    return {
      name: 'cyro Renato',
      value: 1000,
    };
  }
}
