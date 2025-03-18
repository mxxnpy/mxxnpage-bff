import { Handler } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import serverless from 'serverless-http';

let cachedHandler: Handler;

export const handler: Handler = async (event, context) => {
  if (!cachedHandler) {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('backend');
    await app.init();
    cachedHandler = serverless(app.getHttpAdapter().getInstance());
  }
  return cachedHandler(event, context);
};
