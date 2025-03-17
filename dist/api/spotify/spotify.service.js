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
exports.SpotifyService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const token_storage_service_1 = require("./token-storage.service");
const rxjs_1 = require("rxjs");
const url_1 = require("url");
let SpotifyService = class SpotifyService {
    constructor(httpService, configService, tokenStorageService) {
        this.httpService = httpService;
        this.configService = configService;
        this.tokenStorageService = tokenStorageService;
        this.apiBaseUrl = 'https://api.spotify.com/v1';
        this.authUrl = 'https://accounts.spotify.com/authorize';
        this.tokenUrl = 'https://accounts.spotify.com/api/token';
        this.clientId = this.configService.get('SPOTIFY_CLIENT_ID');
        this.clientSecret = this.configService.get('SPOTIFY_CLIENT_SECRET');
        this.redirectUri = this.configService.get('SPOTIFY_REDIRECT_URI') || 'http://localhost:3000/backend/spotify/auth/callback';
    }
    getAuthorizeUrl(scopes, state) {
        const params = new url_1.URLSearchParams({
            client_id: this.clientId,
            response_type: 'code',
            redirect_uri: this.redirectUri,
            scope: scopes.join(' '),
            state,
            show_dialog: 'true',
        });
        return `${this.authUrl}?${params.toString()}`;
    }
    async getAccessToken(code) {
        var _a;
        const params = new url_1.URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: this.redirectUri,
        });
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
            },
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(this.tokenUrl, params.toString(), config));
            return response.data;
        }
        catch (error) {
            console.error('Error getting access token:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            throw error;
        }
    }
    async refreshAccessToken(refreshToken) {
        var _a;
        const params = new url_1.URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        });
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
            },
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(this.tokenUrl, params.toString(), config));
            return response.data;
        }
        catch (error) {
            console.error('Error refreshing token:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            throw error;
        }
    }
    async getCurrentTrack() {
        return this.makeApiRequest('/me/player/currently-playing');
    }
    async getRecentlyPlayed(limit = 20) {
        return this.makeApiRequest('/me/player/recently-played', { limit });
    }
    async getTopItems(type, timeRange = 'medium_term', limit = 10) {
        return this.makeApiRequest(`/me/top/${type}`, {
            time_range: timeRange,
            limit,
        });
    }
    async getPlaylists(limit = 20, offset = 0) {
        return this.makeApiRequest('/me/playlists', { limit, offset });
    }
    async getPlaylistTracks(playlistId, limit = 100, offset = 0) {
        return this.makeApiRequest(`/playlists/${playlistId}/tracks`, {
            limit,
            offset,
        });
    }
    async getUserProfile() {
        return this.makeApiRequest('/me');
    }
    async makeApiRequest(endpoint, params = {}) {
        var _a;
        try {
            const tokens = this.tokenStorageService.getTokens();
            if (!tokens || !tokens.access_token) {
                throw new Error('No access token available');
            }
            if (tokens.expires_at && Date.now() > tokens.expires_at) {
                if (!tokens.refresh_token) {
                    throw new Error('No refresh token available');
                }
                const refreshedTokens = await this.refreshAccessToken(tokens.refresh_token);
                this.tokenStorageService.updateTokens(refreshedTokens);
            }
            const queryParams = new url_1.URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                queryParams.append(key, value.toString());
            });
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            const url = `${this.apiBaseUrl}${endpoint}${queryString}`;
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                },
            }));
            return response.data;
        }
        catch (error) {
            console.error(`Spotify API error: ${error.message}`);
            if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                try {
                    const tokens = this.tokenStorageService.getTokens();
                    if (tokens && tokens.refresh_token) {
                        const refreshedTokens = await this.refreshAccessToken(tokens.refresh_token);
                        this.tokenStorageService.updateTokens(refreshedTokens);
                        return this.makeApiRequest(endpoint, params);
                    }
                }
                catch (refreshError) {
                    console.error('Error refreshing token:', refreshError);
                }
            }
            if (endpoint.includes('/top/')) {
                return { items: [] };
            }
            else if (endpoint.includes('/playlists')) {
                return { items: [] };
            }
            else if (endpoint.includes('/recently-played')) {
                return { items: [] };
            }
            else if (endpoint.includes('/currently-playing')) {
                return null;
            }
            else {
                return {};
            }
        }
    }
};
exports.SpotifyService = SpotifyService;
exports.SpotifyService = SpotifyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        token_storage_service_1.TokenStorageService])
], SpotifyService);
//# sourceMappingURL=spotify.service.js.map