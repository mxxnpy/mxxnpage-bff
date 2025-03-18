import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { SwaggerBuilder } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  // Global prefix for all routes
  app.setGlobalPrefix('backend');
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());
  
  // Cookie parser middleware
  app.use(cookieParser());
  
  // Setup Swagger documentation
  SwaggerBuilder.build(app);
  
  // Start the server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();