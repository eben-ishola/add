"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const bodyParser = require("body-parser");
const path_1 = require("path");
const api_exception_filter_1 = require("./filters/api-exception.filter");
const config_1 = require("./config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalFilters(new api_exception_filter_1.ApiExceptionFilter());
    const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '');
    const localOriginPatterns = [
        /^https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?$/i,
    ];
    const allowedOrigins = config_1.config.corsOrigins.map(normalizeOrigin);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true);
            }
            const normalizedOrigin = normalizeOrigin(origin);
            const isAllowed = allowedOrigins.includes(normalizedOrigin) ||
                (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production'
                    ? localOriginPatterns.some((allowed) => allowed.test(normalizedOrigin))
                    : false);
            if (isAllowed) {
                return callback(null, true);
            }
            return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
        },
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Authorization',
            'Content-Type',
            'X-Entity-Id',
            'X-Subsidiary-Id',
        ],
    });
    app.use(bodyParser.json({ limit: config_1.config.bodyLimit }));
    app.use(bodyParser.urlencoded({ limit: config_1.config.bodyLimit, extended: true }));
    if (config_1.config.swaggerEnabled) {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Payroll API')
            .setDescription('The Payroll Management API documentation')
            .setVersion('1.0')
            .addTag('payroll')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api', app, document);
    }
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
    });
    await app.listen(config_1.config.port);
}
bootstrap();
//# sourceMappingURL=main.js.map