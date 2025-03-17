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
exports.DiscordService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
let DiscordService = class DiscordService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
    }
    async getPresence() {
        const activities = await this.getActivity();
        const currentTime = new Date();
        const hours = currentTime.getHours();
        const day = currentTime.getDay();
        let status = 'online';
        let statusText = 'Online';
        if (day === 0 || day === 6) {
            statusText = 'Free Time';
        }
        else {
            if (hours >= 8 && hours < 18) {
                statusText = 'At Work';
            }
            else if (hours >= 6 && hours < 8) {
                statusText = 'Free Time';
            }
            else if (hours >= 19 && hours < 24) {
                statusText = 'Free Time';
            }
        }
        if (activities.some(a => a.type === 'GAMING')) {
            statusText = 'Gaming';
        }
        else if (activities.some(a => a.type === 'PROGRAMMING')) {
            statusText = 'Programming';
        }
        else if (activities.some(a => a.type === 'IN_CALL')) {
            statusText = 'With Friends';
        }
        else if (status === 'idle') {
            statusText = 'Out of Home';
        }
        else if (activities.some(a => a.type === 'LISTENING') && !(hours >= 8 && hours < 18 && (day >= 1 && day <= 5))) {
            statusText = 'Vibing';
        }
        return {
            status,
            statusText,
            timestamp: currentTime.toISOString(),
        };
    }
    async getActivity() {
        const currentTime = new Date();
        const hours = currentTime.getHours();
        const activities = [];
        if (hours >= 20 && hours < 23) {
            activities.push({
                type: 'GAMING',
                name: 'Valorant',
                details: 'Competitive Match',
                state: 'In Game',
                timestamps: {
                    start: Date.now() - 1800000,
                },
            });
        }
        else if (hours >= 9 && hours < 18) {
            activities.push({
                type: 'PROGRAMMING',
                name: 'Visual Studio Code',
                details: 'Editing TypeScript',
                state: 'Working on a project',
                timestamps: {
                    start: Date.now() - 3600000,
                },
            });
        }
        else if (hours >= 18 && hours < 20) {
            activities.push({
                type: 'LISTENING',
                name: 'Spotify',
                details: 'Listening to music',
                state: 'Relaxing',
                timestamps: {
                    start: Date.now() - 900000,
                },
            });
        }
        return activities;
    }
};
exports.DiscordService = DiscordService;
exports.DiscordService = DiscordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], DiscordService);
//# sourceMappingURL=discord.service.js.map