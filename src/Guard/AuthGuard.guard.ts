import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import Crypto from './Crypto.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private crypto: Crypto) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const crypto = this.crypto;
    const isProd = Boolean(process.env.NODE_ENV === 'prod');
    const isAuthenticated =
      crypto.decrypt(request.headers.authorization) ===
      (isProd ? process.env.PROD_PIX_AUTH_KEY : process.env.PIX_AUTH_KEY);
    return isAuthenticated;
  }
}
