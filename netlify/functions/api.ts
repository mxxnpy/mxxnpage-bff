import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { SwaggerBuilder } from '../../src/config/swagger.config';
import serverless from 'serverless-http';

let cachedHandler: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for GitHub Pages and local development
  app.enableCors({
    origin: [
      'https://mxxnpy.github.io',
      'https://mxxnpy.github.io/mxxnpage/#/home',
      'https://mxxnpy.github.io/mxxnpage/#/home/',
      'https://mxxnpy.github.io/mxxnpage/#/spotify',
      'https://mxxnpy.github.io/mxxnpage/#/project',
      'https://mxxnpy.github.io/mxxnpage/#/',
      'https://mxxnpy.github.io/mxxnpage',
      'https://mxxnpy.github.io/mxxnpage/', 
      'https://mxxnpy.github.io/mxxnpage/browser',
      'https://mxxnpy.github.io/mxxnpage/browser/'
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(cookieParser());
  app.setGlobalPrefix('backend');
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  return serverless(app.getHttpAdapter().getInstance());
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
  if (!cachedHandler) {
    cachedHandler = await bootstrap();
  }
  
  // Call the serverless handler and ensure it returns a proper HandlerResponse
  const response = await cachedHandler(event, context);
  return response as HandlerResponse;
};
