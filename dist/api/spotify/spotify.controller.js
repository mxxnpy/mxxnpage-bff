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
exports.SpotifyController = void 0;
const common_1 = require("@nestjs/common");
const spotify_service_1 = require("./spotify.service");
const swagger_1 = require("@nestjs/swagger");
let SpotifyController = class SpotifyController {
    constructor(spotifyService) {
        this.spotifyService = spotifyService;
    }
    async getCurrentUser() {
        return this.spotifyService.getUserProfile();
    }
    async getCurrentTrack() {
        return this.spotifyService.getCurrentTrack();
    }
    async getRecentlyPlayed(limit = 10) {
        return this.spotifyService.getRecentlyPlayed(limit);
    }
    async getTopItems(type, timeRange = 'medium_term', limit = 10) {
        return this.spotifyService.getTopItems(type, timeRange, limit);
    }
    async getPlaylists(limit = 20, offset = 0) {
        return this.spotifyService.getPlaylists(limit, offset);
    }
    async getPlaylistTracks(id, limit = 20, offset = 0) {
        return this.spotifyService.getPlaylistTracks(id, limit, offset);
    }
};
exports.SpotifyController = SpotifyController;
__decorate([
    (0, common_1.Get)('current-user'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns the current user profile',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SpotifyController.prototype, "getCurrentUser", null);
__decorate([
    (0, common_1.Get)('current-track'),
    (0, swagger_1.ApiOperation)({ summary: 'Get currently playing track' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns currently playing track information',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SpotifyController.prototype, "getCurrentTrack", null);
__decorate([
    (0, common_1.Get)('recently-played'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recently played tracks' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of tracks to return' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns recently played tracks',
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SpotifyController.prototype, "getRecentlyPlayed", null);
__decorate([
    (0, common_1.Get)('top/:type'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user top items (artists or tracks)' }),
    (0, swagger_1.ApiParam)({ name: 'type', description: 'Type of top items (artists or tracks)' }),
    (0, swagger_1.ApiQuery)({ name: 'time_range', required: false, description: 'Time range (short_term, medium_term, long_term)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of items to return' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns user top items',
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Query)('time_range')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], SpotifyController.prototype, "getTopItems", null);
__decorate([
    (0, common_1.Get)('playlists'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user playlists' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of playlists to return' }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, description: 'Offset for pagination' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns user playlists',
    }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], SpotifyController.prototype, "getPlaylists", null);
__decorate([
    (0, common_1.Get)('playlists/:id/tracks'),
    (0, swagger_1.ApiOperation)({ summary: 'Get playlist tracks' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Playlist ID' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of tracks to return' }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, description: 'Offset for pagination' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns playlist tracks',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], SpotifyController.prototype, "getPlaylistTracks", null);
exports.SpotifyController = SpotifyController = __decorate([
    (0, swagger_1.ApiTags)('spotify'),
    (0, common_1.Controller)('spotify'),
    __metadata("design:paramtypes", [spotify_service_1.SpotifyService])
], SpotifyController);
//# sourceMappingURL=spotify.controller.js.map