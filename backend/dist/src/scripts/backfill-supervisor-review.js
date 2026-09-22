"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const performance_service_1 = require("../services/performance/performance.service");
const REVIEW_ID = process.argv[2] ?? '69ca91ada19e5893e886fbbd';
async function main() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: ['error', 'warn'],
    });
    try {
        const service = app.get(performance_service_1.PerformanceService);
        console.log(`Backfilling supervisor KPI results for review ${REVIEW_ID}...`);
        const result = await service.backfillSupervisorKpiResultsForReview(REVIEW_ID);
        console.log('Done:', result);
    }
    finally {
        await app.close();
    }
}
main().catch((error) => {
    console.error('Backfill failed:', error);
    process.exit(1);
});
//# sourceMappingURL=backfill-supervisor-review.js.map