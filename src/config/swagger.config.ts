import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

type Themes =
  | 'alternate'
  | 'default'
  | 'moon'
  | 'purple'
  | 'solarized'
  | 'bluePlanet'
  | 'deepSpace'
  | 'saturn'
  | 'kepler'
  | 'elysiajs'
  | 'fastify'
  | 'mars'
  | 'none';

export class SwaggerBuilder {
  private swaggerConfig = new DocumentBuilder();

  constructor(private readonly app: INestApplication) {}

  config(title: string): this {
    this.swaggerConfig.setTitle(title);
    this.swaggerConfig.setDescription('API for the personal status dashboard');
    this.swaggerConfig.setVersion('1.0');
    
    // Add server URLs
    const port = process.env.PORT || 3000;
    this.swaggerConfig.addServer(`http://localhost:${port}`, 'local');
    this.swaggerConfig.addServer('https://mxxnpage-bff.onrender.com', 'production');
    this.swaggerConfig.addServer('https://mxxnpage-bff.onrender.com/backend', 'production with prefix');    
    return this;
  }

  async build(theme: Themes = 'moon'): Promise<void> {
    const document = SwaggerModule.createDocument(this.app, this.swaggerConfig.build());

    this.app.use(
      '/backend/docs',
      apiReference({
        theme,
        layout: 'modern',
        metaData: {
          author: 'Developer',
          creator: 'Developer',
          appleMobileWebAppStatusBarStyle: 'black-translucent',
          title: 'Personal Status Dashboard API',
        },
        spec: {
          content: document,
        },
      }),
    );
  }
}
