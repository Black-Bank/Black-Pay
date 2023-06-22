import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
async function bootstrap() {
  dotenv.config();
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
}
bootstrap();
