"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let QuestionsService = class QuestionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createQuestionDto) {
        const { choices, position_ids, ...questionData } = createQuestionDto;
        return this.prisma.question.create({
            data: {
                ...questionData,
                choices: {
                    create: choices,
                },
                positions: position_ids
                    ? {
                        create: position_ids.map((id) => ({
                            position: { connect: { id } },
                        })),
                    }
                    : undefined,
            },
            include: { choices: true, positions: { include: { position: true } } },
        });
    }
    findAll() {
        return this.prisma.question.findMany({ include: { choices: true, subject: true, positions: true } });
    }
    findOne(id) {
        return this.prisma.question.findUnique({ where: { id }, include: { choices: true, subject: true, positions: true } });
    }
    async update(id, updateQuestionDto) {
        const { choices, position_ids, ...questionData } = updateQuestionDto;
        return this.prisma.$transaction(async (tx) => {
            const updatedQuestion = await tx.question.update({
                where: { id },
                data: {
                    ...questionData,
                },
            });
            if (position_ids) {
                await tx.positionQuestion.deleteMany({ where: { question_id: id } });
                await tx.positionQuestion.createMany({
                    data: position_ids.map((posId) => ({
                        question_id: id,
                        position_id: posId,
                    })),
                });
            }
            if (choices) {
                await tx.choice.deleteMany({ where: { question_id: id } });
                await tx.choice.createMany({
                    data: choices.map(choice => ({ ...choice, question_id: id }))
                });
            }
            return tx.question.findUnique({
                where: { id },
                include: { choices: true, positions: { include: { position: true } } }
            });
        });
    }
    remove(id) {
        return this.prisma.question.delete({ where: { id } });
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuestionsService);
//# sourceMappingURL=questions.service.js.map