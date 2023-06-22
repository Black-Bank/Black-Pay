import { Injectable } from '@nestjs/common';
import { PayResponse } from './types';

@Injectable()
export class AppService {
  getBalance(): PayResponse {
    return {
      name: 'cyro ',
      value: 1000,
    };
  }
}
