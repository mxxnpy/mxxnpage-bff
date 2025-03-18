import { Handler } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import serverless from 'serverless-http';
import * as cookieParser from 'cookie-parser';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

// Import required modules to ensure they're included in the bundle
import '@nestjs/microservices';
import '@nestjs/websockets';
import 'class-transformer';

let cachedHandler: any;
let cachedServer: any;

export const handler: Handler = async (event, context) => {
  if (!cachedHandler) {
    try {
      const expressApp = express();
      const nestApp = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
        { logger: ['error', 'warn'] }
      );
      
      nestApp.use(cookieParser());
      nestApp.setGlobalPrefix('backend');
      await nestApp.init();
      
      cachedServer = expressApp;
      cachedHandler = serverless(cachedServer);
    } catch (error) {
      console.error('Error initializing NestJS app:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal Server Error', message: 'Failed to initialize application' })
      };
    }
  }
  
  return cachedHandler(event, context);
};
