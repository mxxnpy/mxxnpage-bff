import { INestApplication } from '@nestjs/common';
type Themes = 'alternate' | 'default' | 'moon' | 'purple' | 'solarized' | 'bluePlanet' | 'deepSpace' | 'saturn' | 'kepler' | 'elysiajs' | 'fastify' | 'mars' | 'none';
export declare class SwaggerBuilder {
    private readonly app;
    private swaggerConfig;
    constructor(app: INestApplication);
    config(title: string): this;
    build(theme?: Themes): Promise<void>;
}
export {};
