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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubController = void 0;
const common_1 = require("@nestjs/common");
const github_service_1 = require("./github.service");
const swagger_1 = require("@nestjs/swagger");
let GithubController = class GithubController {
    constructor(githubService) {
        this.githubService = githubService;
    }
    async getUserProfile(username) {
        return this.githubService.getUserProfile(username);
    }
    async getUserActivity(username, limit = 10) {
        return this.githubService.getUserActivity(username);
    }
    async getUserContributions(username) {
        return this.githubService.getUserContributions(username);
    }
};
exports.GithubController = GithubController;
__decorate([
    (0, common_1.Get)('user/:username'),
    (0, swagger_1.ApiOperation)({ summary: 'Get GitHub user profile' }),
    (0, swagger_1.ApiParam)({ name: 'username', description: 'GitHub username' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns GitHub user profile information' }),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GithubController.prototype, "getUserProfile", null);
__decorate([
    (0, common_1.Get)('activity/:username'),
    (0, swagger_1.ApiOperation)({ summary: 'Get GitHub user activity' }),
    (0, swagger_1.ApiParam)({ name: 'username', description: 'GitHub username' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of activities to return' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns GitHub user activity' }),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], GithubController.prototype, "getUserActivity", null);
__decorate([
    (0, common_1.Get)('contributions/:username'),
    (0, swagger_1.ApiOperation)({ summary: 'Get GitHub user contributions' }),
    (0, swagger_1.ApiParam)({ name: 'username', description: 'GitHub username' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns GitHub user contributions' }),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GithubController.prototype, "getUserContributions", null);
exports.GithubController = GithubController = __decorate([
    (0, swagger_1.ApiTags)('github'),
    (0, common_1.Controller)('github'),
    __metadata("design:paramtypes", [github_service_1.GithubService])
], GithubController);
//# sourceMappingURL=github.controller.js.map