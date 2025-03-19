import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../../src/app.module';
import express from 'express';
import serverless from 'serverless-http';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

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

// Função para carregar serviços dinamicamente
const loadServices = () => {
    console.log('Attempting to load services...');
    
    // Lista de possíveis caminhos base para os serviços
    const basePaths = [
        '/var/task/src/api/',
        '/var/task/netlify/functions/src/api/',
        '/opt/build/repo/src/api/',
        '../../src/api/',
        '../src/api/',
        './src/api/',
        '/var/task/',
        '/opt/build/repo/'
    ];
    
    // Lista de serviços para carregar
    const services = [
        { name: 'GithubService', path: 'github/github.service' },
        { name: 'SpotifyService', path: 'spotify/spotify.service' },
        { name: 'WeatherService', path: 'weather/weather.service' },
        { name: 'TokenStorageService', path: 'spotify/token-storage.service' }
    ];
    
    // Tentar carregar cada serviço de cada caminho base
    for (const service of services) {
        let loaded = false;
        
        for (const basePath of basePaths) {
            try {
                const fullPath = path.join(basePath, service.path);
                console.log(`Trying to load ${service.name} from ${fullPath}`);
                
                // Verificar se o arquivo existe
                if (fs.existsSync(fullPath + '.js')) {
                    console.log(`Found ${service.name} at ${fullPath}.js`);
                    const serviceModule = require(fullPath);
                    
                    // Registrar o serviço globalmente
                    if (serviceModule[service.name]) {
                        (global as any)[service.name] = serviceModule[service.name];
                        console.log(`Successfully registered ${service.name} globally`);
                        loaded = true;
                        break;
                    } else {
                        console.log(`Module found but ${service.name} not exported`);
                    }
                }
            } catch (error) {
                console.log(`Error loading ${service.name} from ${basePath}: ${error.message}`);
            }
        }
        
        if (!loaded) {
            console.log(`Failed to load ${service.name} from any path`);
        }
    }
    
    // Verificar se os serviços foram carregados
    console.log('Services loaded status:', {
        GithubService: (global as any).GithubService ? 'Available' : 'Not available',
        SpotifyService: (global as any).SpotifyService ? 'Available' : 'Not available',
        WeatherService: (global as any).WeatherService ? 'Available' : 'Not available',
        TokenStorageService: (global as any).TokenStorageService ? 'Available' : 'Not available'
    });
};

// Carregar os serviços
loadServices();

let cachedNestApp: INestApplication;

const handler = async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
    // Importante: Isso garante que a função serverless seja executada apenas uma vez por instância
    context.callbackWaitsForEmptyEventLoop = false;

    if (!cachedNestApp) {
        console.log('Initializing NestJS application...');
        
        // Verificar novamente se os serviços estão disponíveis
        console.log('Services available before app initialization:', {
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
