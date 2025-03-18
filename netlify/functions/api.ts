import { Handler } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import serverless from 'serverless-http';
import cookieParser from 'cookie-parser';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

export const config = {
  external: [
    '@nestjs/microservices',
    '@nestjs/websockets',
    '@nestjs/websockets/socket-module',
    '@nestjs/microservices/microservices-module',
    'class-transformer/storage',
    '@nestjs/platform-socket.io',
    '@grpc/grpc-js',
    '@grpc/proto-loader',
    'ioredis',
    'amqplib',
    'amqp-connection-manager',
    'nats',
    'kafkajs',
    'mqtt',
    'redis'
  ]
};

let cachedHandler: any;
let cachedServer: any;

export const handler: Handler = async (event, context) => {
  if (!cachedHandler) {
    try {
      console.log('Initializing NestJS application...');
      const expressApp = express();
      const nestApp = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
        { logger: ['error', 'warn', 'log'] } // Logs mais detalhados
      );
      
      console.log('Setting up middleware and global prefix...');
      nestApp.use(cookieParser());
      nestApp.setGlobalPrefix('backend');
      
      console.log('Initializing NestJS app...');
      await nestApp.init();
      
      console.log('NestJS app initialized successfully');
      cachedServer = expressApp;
      cachedHandler = serverless(cachedServer);
    } catch (error) {
      console.error('Error initializing NestJS app:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Internal Server Error', 
          message: 'Failed to initialize application',
          details: error.message,
          stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        })
      };
    }
  }
  
  return cachedHandler(event, context);
};