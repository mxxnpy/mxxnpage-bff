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
exports.TokenStorageService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path = require("path");
let TokenStorageService = class TokenStorageService {
    constructor() {
        this.tokenFilePath = path.join(process.cwd(), 'spotify-tokens.json');
    }
    async storeTokens(tokens) {
        try {
            const tokensWithExpiry = Object.assign(Object.assign({}, tokens), { expires_at: Date.now() + (tokens.expires_in * 1000) });
            await fs_1.promises.writeFile(this.tokenFilePath, JSON.stringify(tokensWithExpiry, null, 2), 'utf8');
            console.log('Spotify tokens stored successfully');
        }
        catch (error) {
            console.error('Error storing Spotify tokens:', error);
            throw error;
        }
    }
    getTokens() {
        try {
            const data = require('fs').readFileSync(this.tokenFilePath, 'utf8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Error reading Spotify tokens:', error.message);
            return null;
        }
    }
    async updateTokens(tokens) {
        try {
            const existingTokens = this.getTokens();
            if (!existingTokens) {
                throw new Error('No existing tokens to update');
            }
            const updatedTokens = Object.assign(Object.assign(Object.assign({}, existingTokens), tokens), { expires_at: tokens.expires_in
                    ? Date.now() + (tokens.expires_in * 1000)
                    : existingTokens.expires_at });
            await fs_1.promises.writeFile(this.tokenFilePath, JSON.stringify(updatedTokens, null, 2), 'utf8');
            console.log('Spotify tokens updated successfully');
        }
        catch (error) {
            console.error('Error updating Spotify tokens:', error);
            throw error;
        }
    }
    async clearTokens() {
        try {
            try {
                await fs_1.promises.access(this.tokenFilePath);
            }
            catch (_a) {
                return;
            }
            await fs_1.promises.unlink(this.tokenFilePath);
            console.log('Spotify tokens cleared successfully');
        }
        catch (error) {
            console.error('Error clearing Spotify tokens:', error);
            throw error;
        }
    }
    async isAuthenticated() {
        try {
            const tokens = this.getTokens();
            if (!tokens || !tokens.access_token) {
                return false;
            }
            if (tokens.expires_at && Date.now() > tokens.expires_at) {
                return !!tokens.refresh_token;
            }
            return true;
        }
        catch (_a) {
            return false;
        }
    }
};
exports.TokenStorageService = TokenStorageService;
exports.TokenStorageService = TokenStorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TokenStorageService);
//# sourceMappingURL=token-storage.service.js.map