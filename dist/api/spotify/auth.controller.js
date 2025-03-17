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
exports.SpotifyAuthController = void 0;
const common_1 = require("@nestjs/common");
const spotify_service_1 = require("./spotify.service");
const token_storage_service_1 = require("./token-storage.service");
const swagger_1 = require("@nestjs/swagger");
let SpotifyAuthController = class SpotifyAuthController {
    constructor(spotifyService, tokenStorageService) {
        this.spotifyService = spotifyService;
        this.tokenStorageService = tokenStorageService;
    }
    login(res) {
        const scopes = [
            'user-read-private',
            'user-read-email',
            'user-read-currently-playing',
            'user-read-recently-played',
            'user-top-read',
            'playlist-read-private',
            'playlist-read-collaborative',
        ];
        const state = this.generateRandomString(16);
        const authorizeUrl = this.spotifyService.getAuthorizeUrl(scopes, state);
        res.cookie('spotify_auth_state', state, { httpOnly: true });
        res.redirect(authorizeUrl);
    }
    async callback(code, state, error, req, res) {
        var _a;
        try {
            if (error) {
                console.error('Spotify authorization error:', error);
                res.redirect('http://localhost:4202/home?auth_error=' + error);
                return;
            }
            const storedState = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.spotify_auth_state;
            if (!state || state !== storedState) {
                console.error('State mismatch in Spotify callback');
                res.redirect('http://localhost:4202/home?auth_error=state_mismatch');
                return;
            }
            res.clearCookie('spotify_auth_state');
            const tokenResponse = await this.spotifyService.getAccessToken(code);
            this.tokenStorageService.storeTokens(tokenResponse);
            console.log('Authentication successful, redirecting to frontend');
            res.redirect('http://localhost:4202/home?auth_success=true');
        }
        catch (err) {
            console.error('Error in Spotify callback:', err);
            res.redirect('http://localhost:4202/home?auth_error=server_error');
        }
    }
    async refreshToken(res) {
        try {
            const tokens = this.tokenStorageService.getTokens();
            if (!tokens || !tokens.refresh_token) {
                res.status(401).json({ error: 'No refresh token available' });
                return;
            }
            const refreshedTokens = await this.spotifyService.refreshAccessToken(tokens.refresh_token);
            this.tokenStorageService.updateTokens(refreshedTokens);
            res.status(200).json({ success: true, expires_in: refreshedTokens.expires_in });
        }
        catch (err) {
            console.error('Error refreshing token:', err);
            res.status(500).json({ error: 'Failed to refresh token' });
        }
    }
    getAuthStatus(res) {
        const tokens = this.tokenStorageService.getTokens();
        const isAuthenticated = !!tokens && !!tokens.access_token;
        res.status(200).json({
            authenticated: isAuthenticated,
            expires_in: (tokens === null || tokens === void 0 ? void 0 : tokens.expires_in) || 0,
            expires_at: (tokens === null || tokens === void 0 ? void 0 : tokens.expires_at) || 0
        });
    }
    logout(res) {
        this.tokenStorageService.clearTokens();
        res.status(200).json({ success: true });
    }
    generateRandomString(length) {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let text = '';
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
};
exports.SpotifyAuthController = SpotifyAuthController;
__decorate([
    (0, common_1.Get)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate Spotify OAuth login flow with developer credentials' }),
    (0, swagger_1.ApiResponse)({ status: 302, description: 'Redirects to Spotify authorization page' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SpotifyAuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('callback'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Spotify OAuth callback' }),
    (0, swagger_1.ApiResponse)({ status: 302, description: 'Redirects to frontend after processing callback' }),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('state')),
    __param(2, (0, common_1.Query)('error')),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], SpotifyAuthController.prototype, "callback", null);
__decorate([
    (0, common_1.Get)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh Spotify access token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns refreshed token information' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SpotifyAuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Check Spotify authentication status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns authentication status' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SpotifyAuthController.prototype, "getAuthStatus", null);
__decorate([
    (0, common_1.Get)('logout'),
    (0, swagger_1.ApiOperation)({ summary: 'Log out from Spotify' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Clears Spotify authentication tokens' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SpotifyAuthController.prototype, "logout", null);
exports.SpotifyAuthController = SpotifyAuthController = __decorate([
    (0, swagger_1.ApiTags)('spotify-auth'),
    (0, common_1.Controller)('spotify/auth'),
    __metadata("design:paramtypes", [spotify_service_1.SpotifyService,
        token_storage_service_1.TokenStorageService])
], SpotifyAuthController);
//# sourceMappingURL=auth.controller.js.map