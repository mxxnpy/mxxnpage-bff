// This file provides a standalone server for Netlify deployment
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const cookieParser = require('cookie-parser');
const { AppModule } = require('../../src/app.module');

async function bootstrap() {
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['error', 'warn', 'log'] }
  );
  
  // Enable CORS for GitHub Pages and Netlify
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

  app.use(cookieParser());
  app.setGlobalPrefix('backend');
  
  await app.init();
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}

bootstrap();