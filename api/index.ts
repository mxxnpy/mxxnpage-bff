import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';
import { ValidationPipe } from '@nestjs/common';
const cookieParser = require('cookie-parser');
import { SwaggerBuilder } from '../src/config/swagger.config';

// Create Express instance
const server = express();

let app;

async function bootstrap() {
  console.log('Bootstrapping NestJS application for Vercel serverless function');
  
  // Create NestJS app with Express adapter
  app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
    {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    },
  );
  
  // Enable CORS for GitHub Pages, Vercel and local development
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
      'https://mxxnpage-bff.vercel.app',
      'https://mxxnpage-bff.vercel.app/',
      'https://mxxnpage-1n12pwxrl-mxxnpys-projects.vercel.app',
      'https://mxxnpage-1n12pwxrl-mxxnpys-projects.vercel.app/'
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Use cookie parser
  app.use(cookieParser());

  // Set global prefix for all routes
  app.setGlobalPrefix('backend');

  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Setup Scalar UI API documentation with dark theme
  await new SwaggerBuilder(app)
    .config('Personal Status Dashboard API')
    .build('moon');

  await app.init();
  console.log('NestJS application initialized successfully');
  
  return app;
}

// Handler for Vercel serverless function
export default async function handler(req, res) {
  try {
    // Initialize app if not already initialized
    if (!app) {
      console.log('First request - initializing NestJS application');
      await bootstrap();
    }
    
    // Log request for debugging
    console.log(`Handling request: ${req.method} ${req.url}`);
    
    // Special handling for root path - redirect to /backend/docs
    if (req.url === '/' || req.url === '') {
      console.log('Redirecting root path to /backend/docs');
      res.statusCode = 302;
      res.setHeader('Location', '/backend/docs');
      res.end();
      return;
    }
    
    // Special handling for auth callback to ensure cookies are preserved
    if (req.url.includes('/backend/spotify/auth/callback')) {
      console.log('Handling Spotify auth callback');
      // Set secure and SameSite attributes for cookies in production
      if (process.env.NODE_ENV === 'production') {
        res.setHeader('Set-Cookie', [
          'spotify_auth=true; Path=/; HttpOnly; Secure; SameSite=None',
        ]);
      }
    }
    
    // Handle the request with the Express server
    server(req, res);
  } catch (error) {
    console.error('Error handling API request:', error);
    // Include more detailed error information
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response error status:', error.response.status);
    }
    res.status(500).send('Internal Server Error');
  }
}
