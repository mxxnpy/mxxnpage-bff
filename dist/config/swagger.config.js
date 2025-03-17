"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerBuilder = void 0;
const swagger_1 = require("@nestjs/swagger");
const nestjs_api_reference_1 = require("@scalar/nestjs-api-reference");
class SwaggerBuilder {
    constructor(app) {
        this.app = app;
        this.swaggerConfig = new swagger_1.DocumentBuilder();
    }
    config(title) {
        this.swaggerConfig.setTitle(title);
        this.swaggerConfig.setDescription('API for the personal status dashboard');
        this.swaggerConfig.setVersion('1.0');
        const port = process.env.PORT || 3000;
        this.swaggerConfig.addServer(`http://localhost:${port}`, 'local');
        return this;
    }
    async build(theme = 'moon') {
        const document = swagger_1.SwaggerModule.createDocument(this.app, this.swaggerConfig.build());
        this.app.use('/backend/docs', (0, nestjs_api_reference_1.apiReference)({
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
        }));
    }
}
exports.SwaggerBuilder = SwaggerBuilder;
//# sourceMappingURL=swagger.config.js.map