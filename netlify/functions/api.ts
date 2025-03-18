import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import serverless from 'serverless-http';
import cookieParser from 'cookie-parser';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

// Define a custom type to handle the type mismatch between serverless-http and Netlify functions
type ServerlessHandler = (event: HandlerEvent, context: HandlerContext) => Promise<any>;

let cachedHandler: ServerlessHandler;
let cachedServer: any;

export const handler: Handler = async (event, context) => {
  if (!cachedHandler) {
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
    // Cast the serverless handler to our custom type to resolve type issues
    cachedHandler = serverless(cachedServer) as unknown as ServerlessHandler;
  }
  
  return cachedHandler(event, context);
};
