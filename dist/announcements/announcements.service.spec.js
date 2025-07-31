"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const announcements_service_1 = require("./announcements.service");
describe('AnnouncementsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [announcements_service_1.AnnouncementsService],
        }).compile();
        service = module.get(announcements_service_1.AnnouncementsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=announcements.service.spec.js.map