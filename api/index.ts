import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
    {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    },
  );

  // app.setGlobalPrefix('backend'); // Prefix is handled by vercel.json routing
  
  // Configure CORS for Vercel deployment
  app.enableCors({
    origin: [
      'https://mxxnpy.github.io',
      'https://mxxnpy.github.io/mxxnpage',
      'https://mxxnpy.github.io/mxxnpage/',
      'https://mxxnpy.github.io/mxxnpage/browser',
      'https://mxxnpy.github.io/mxxnpage/browser/',
      'https://mxxnpage-bff.vercel.app',
      'https://mxxnpage-bff.vercel.app/',
      'https://mxxnpage-1n12pwxrl-mxxnpys-projects.vercel.app',
      'https://mxxnpage-1n12pwxrl-mxxnpys-projects.vercel.app/'
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization']
  });
  
  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Personal Status Dashboard API')
    .setDescription('API for the personal status dashboard')
    .setVersion('1.0')
    .addServer('https://mxxnpage-bff.vercel.app', 'production')
    .addServer('https://mxxnpage-bff.vercel.app/backend', 'production with prefix')
    .addServer('https://mxxnpage-1n12pwxrl-mxxnpys-projects.vercel.app', 'production custom domain')
    .addServer('https://mxxnpage-1n12pwxrl-mxxnpys-projects.vercel.app/backend', 'production custom domain with prefix')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('backend/docs', app, document);

  await app.init();
  return app;
}

let cachedApp: any;

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  
  // Pass the request to the NestJS app
  server(req, res);
}
