"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const status_module_1 = require("./api/status/status.module");
const github_module_1 = require("./api/github/github.module");
const spotify_module_1 = require("./api/spotify/spotify.module");
const discord_module_1 = require("./api/discord/discord.module");
const weather_module_1 = require("./api/weather/weather.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            status_module_1.StatusModule,
            github_module_1.GithubModule,
            spotify_module_1.SpotifyModule,
            discord_module_1.DiscordModule,
            weather_module_1.WeatherModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map