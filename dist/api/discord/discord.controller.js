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
exports.DiscordController = void 0;
const common_1 = require("@nestjs/common");
const discord_service_1 = require("./discord.service");
const swagger_1 = require("@nestjs/swagger");
let DiscordController = class DiscordController {
    constructor(discordService) {
        this.discordService = discordService;
    }
    async getPresence() {
        return this.discordService.getPresence();
    }
    async getActivity() {
        return this.discordService.getActivity();
    }
};
exports.DiscordController = DiscordController;
__decorate([
    (0, common_1.Get)('presence'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Discord presence' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns Discord presence information',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DiscordController.prototype, "getPresence", null);
__decorate([
    (0, common_1.Get)('activity'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Discord activity' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns Discord activity information',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DiscordController.prototype, "getActivity", null);
exports.DiscordController = DiscordController = __decorate([
    (0, swagger_1.ApiTags)('discord'),
    (0, common_1.Controller)('discord'),
    __metadata("design:paramtypes", [discord_service_1.DiscordService])
], DiscordController);
//# sourceMappingURL=discord.controller.js.map