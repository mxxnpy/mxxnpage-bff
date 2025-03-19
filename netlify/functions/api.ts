import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../../src/app.module';
import express from 'express';
import serverless from 'serverless-http';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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

// Importar diretamente os serviços para garantir que sejam incluídos no bundle
import { GithubService } from '../../src/api/github/github.service';
import { SpotifyService } from '../../src/api/spotify/spotify.service';
import { WeatherService } from '../../src/api/weather/weather.service';
import { TokenStorageService } from '../../src/api/spotify/token-storage.service';

// Registrar os serviços globalmente para garantir que estejam disponíveis
(global as any).GithubService = GithubService;
(global as any).SpotifyService = SpotifyService;
(global as any).WeatherService = WeatherService;
(global as any).TokenStorageService = TokenStorageService;

let cachedNestApp: INestApplication;

const handler = async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
    // Importante: Isso garante que a função serverless seja executada apenas uma vez por instância
    context.callbackWaitsForEmptyEventLoop = false;

    if (!cachedNestApp) {
      console.log('Initializing NestJS application...');
      console.log('Global services registered:', {
        GithubService: (global as any).GithubService ? 'Available' : 'Not available',
        SpotifyService: (global as any).SpotifyService ? 'Available' : 'Not available',
        WeatherService: (global as any).WeatherService ? 'Available' : 'Not available',
        TokenStorageService: (global as any).TokenStorageService ? 'Available' : 'Not available'
      });
      
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
      const config = new DocumentBuilder()
        .setTitle('Personal Status Dashboard API')
        .setDescription('API for the personal status dashboard')
        .setVersion('1.0')
        .addServer('https://mxxnbff.netlify.app', 'production')
        .addServer('https://mxxnbff.netlify.app/backend', 'production with prefix')
        .build();
      
      const document = SwaggerModule.createDocument(nestApp, config);
      SwaggerModule.setup('backend/docs', nestApp, document);

      await nestApp.init();
      cachedNestApp = nestApp;
    }

    const expressApp = cachedNestApp.getHttpAdapter().getInstance();
    const serverlessHandler = serverless(expressApp);
    return await serverlessHandler(event, context) as HandlerResponse;
};

export { handler };
