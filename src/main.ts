import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
const cookieParser = require('cookie-parser');
import { SwaggerBuilder } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
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

  // Forçar o uso de IPv4 e desabilitar IPv6
  const server = await app.listen(process.env.PORT || 3000, '0.0.0.0');
  server.address = () => ({ address: '0.0.0.0', family: 'IPv4', port: process.env.PORT || 3000 });
  console.log(`Application is running on: ${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`}`);
}
bootstrap();
