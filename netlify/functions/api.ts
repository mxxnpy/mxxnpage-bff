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
  try {
    if (!cachedHandler) {
      console.log('Initializing NestJS application...');
      console.log('Environment variables available:', Object.keys(process.env).filter(key => !key.startsWith('AWS_')));
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('GITHUB_TOKEN available:', !!process.env.GITHUB_TOKEN);
      console.log('SPOTIFY_CLIENT_ID available:', !!process.env.SPOTIFY_CLIENT_ID);
      
      const expressApp = express();
      const nestApp = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
        { logger: ['error', 'warn', 'log'] }
      );
      
      // Enable CORS for GitHub Pages and Netlify
      nestApp.enableCors({
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
          'https://mxxnpy.github.io/mxxnpage/browser/',
          'https://mxxnbff.netlify.app',
          'https://mxxnbff.netlify.app/'
        ],
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        allowedHeaders: ['Content-Type', 'Authorization'],
      });
      
      console.log('Setting up middleware and global prefix...');
      nestApp.use(cookieParser());
      nestApp.setGlobalPrefix('backend');
      
      console.log('Initializing NestJS app...');
      await nestApp.init();
      
      console.log('NestJS app initialized successfully');
      cachedServer = expressApp;
      cachedHandler = serverless(cachedServer);
    }
    
    return cachedHandler(event, context);
  } catch (error) {
    console.error('Error handling request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal Server Error', 
        message: 'Failed to process request',
        details: error.message,
        path: event.path,
        method: event.httpMethod,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      })
    };
  }
};