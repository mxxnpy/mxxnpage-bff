"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const spotify_controller_1 = require("./spotify.controller");
const spotify_service_1 = require("./spotify.service");
const auth_controller_1 = require("./auth.controller");
const token_storage_service_1 = require("./token-storage.service");
const developer_activity_controller_1 = require("./developer-activity.controller");
let SpotifyModule = class SpotifyModule {
};
exports.SpotifyModule = SpotifyModule;
exports.SpotifyModule = SpotifyModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule],
        controllers: [spotify_controller_1.SpotifyController, auth_controller_1.SpotifyAuthController, developer_activity_controller_1.SpotifyDeveloperActivityController],
        providers: [spotify_service_1.SpotifyService, token_storage_service_1.TokenStorageService],
        exports: [spotify_service_1.SpotifyService],
    })
], SpotifyModule);
//# sourceMappingURL=spotify.module.js.map