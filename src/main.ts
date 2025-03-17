import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { SwaggerBuilder } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for GitHub Pages and local development
  app.enableCors({
    origin: [
      'https://mxxnpy.github.io',
      'https://mxxnpy.github.io/mxxnpage',
      'https://mxxnpy.github.io/mxxnpage/', 
      'http://localhost:4200', 
      'http://localhost:3000', 
      'http://localhost:4202'
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

    await app.listen(process.env.PORT || 3000, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
