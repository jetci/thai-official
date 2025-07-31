"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const announcements_controller_1 = require("./announcements.controller");
describe('AnnouncementsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [announcements_controller_1.AnnouncementsController],
        }).compile();
        controller = module.get(announcements_controller_1.AnnouncementsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=announcements.controller.spec.js.map