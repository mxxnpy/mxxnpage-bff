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
exports.StatusController = void 0;
const common_1 = require("@nestjs/common");
const status_service_1 = require("./status.service");
const swagger_1 = require("@nestjs/swagger");
let StatusController = class StatusController {
    constructor(statusService) {
        this.statusService = statusService;
    }
    async getStatus() {
        return this.statusService.getCurrentStatus();
    }
    async getSchedule() {
        return this.statusService.getSchedule();
    }
};
exports.StatusController = StatusController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns the current status based on schedule and activity',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatusController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('schedule'),
    (0, swagger_1.ApiOperation)({ summary: 'Get schedule information' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns the schedule configuration',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatusController.prototype, "getSchedule", null);
exports.StatusController = StatusController = __decorate([
    (0, swagger_1.ApiTags)('status'),
    (0, common_1.Controller)('status'),
    __metadata("design:paramtypes", [status_service_1.StatusService])
], StatusController);
//# sourceMappingURL=status.controller.js.map