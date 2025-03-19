import { Handler } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../../src/app.module';
import express from 'express';
import serverless from 'serverless-http';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { createDocument } from '../../src/config/swagger.config';

// Adicionar módulos externos para evitar que sejam removidos pelo tree-shaking
const externalModules = [
    '@nestjs/microservices',
    '@nestjs/websockets',
    '@nestjs/websockets/socket-module',
    '@nestjs/microservices/microservices-module',
    '@scalar/nestjs-api-reference',
    '@scalar/types',
    '@scalar/openapi-types',
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
    'redis',
];

// Garantir que os módulos externos sejam carregados
externalModules.forEach(module => {
    try {
        require(module);
    } catch (e) {
        // Ignorar erros de módulos que não estão instalados
    }
});

let cachedNestApp: INestApplication;

const handler: Handler = async (event, context) => {
    // Importante: Isso garante que a função serverless seja executada apenas uma vez por instância
    context.callbackWaitsForEmptyEventLoop = false;

    if (!cachedNestApp) {
      // Pré-carregar os serviços para garantir que não sejam removidos pelo tree-shaking
      try {
        console.log('Preloading services...');
        const githubService = require('./src/api/github/github.service');
        const spotifyService = require('./src/api/spotify/spotify.service');
        const weatherService = require('./src/api/weather/weather.service');
        const tokenStorageService = require('./src/api/spotify/token-storage.service');
        
        console.log('Services loaded:', {
          githubService: Object.keys(githubService),
          spotifyService: Object.keys(spotifyService),
          weatherService: Object.keys(weatherService),
          tokenStorageService: Object.keys(tokenStorageService)
        });
      } catch (error) {
        console.error('Error preloading services:', error);
      }
      
      const expressApp = express();
      const nestApp = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
        {
          logger: ['error', 'warn', 'log', 'debug', 'verbose'],
        },
      );

      nestApp.setGlobalPrefix('backend');
      
      // Configurar Swagger
      const document = createDocument(nestApp);
      SwaggerModule.setup('backend/docs', nestApp, document);

      await nestApp.init();
      cachedNestApp = nestApp;
    }

    const expressApp = cachedNestApp.getHttpAdapter().getInstance();
    return serverless(expressApp)(event, context);
};

export { handler };