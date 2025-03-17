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
var GithubService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let GithubService = GithubService_1 = class GithubService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(GithubService_1.name);
        this.apiUrl = this.configService.get('GITHUB_API_URL', 'https://api.github.com');
        this.token = this.configService.get('GITHUB_TOKEN');
        console.log("GitHub Token:", this.token);
    }
    async getUserProfile(username) {
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiUrl}/users/${username}`, {
                headers: this.getHeaders(),
            }).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Failed to fetch GitHub user profile: ${error.message}`);
                throw new Error(`Failed to fetch GitHub user profile: ${error.message}`);
            })));
            return data;
        }
        catch (error) {
            this.logger.error(`Error fetching GitHub user profile: ${error.message}`);
            throw error;
        }
    }
    async getUserActivity(username) {
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiUrl}/users/${username}/events`, {
                headers: this.getHeaders(),
                params: {
                    per_page: 10,
                },
            }).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Failed to fetch GitHub user activity: ${error.message}`);
                throw new Error(`Failed to fetch GitHub user activity: ${error.message}`);
            })));
            return data;
        }
        catch (error) {
            this.logger.error(`Error fetching GitHub user activity: ${error.message}`);
            throw error;
        }
    }
    async getUserContributions(username) {
        try {
            const events = await this.getUserActivity(username);
            const { data: repos } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiUrl}/users/${username}/repos`, {
                headers: this.getHeaders(),
                params: {
                    per_page: 5,
                    sort: 'updated',
                },
            }).pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Failed to fetch GitHub user repos: ${error.message}`);
                throw new Error(`Failed to fetch GitHub user repos: ${error.message}`);
            })));
            const commitActivities = await Promise.all(repos.map(async (repo) => {
                try {
                    const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiUrl}/repos/${repo.full_name}/stats/commit_activity`, {
                        headers: this.getHeaders(),
                    }).pipe((0, rxjs_1.catchError)((error) => {
                        this.logger.error(`Failed to fetch commit activity for ${repo.full_name}: ${error.message}`);
                        return [];
                    })));
                    return {
                        repo: repo.name,
                        activity: data,
                    };
                }
                catch (error) {
                    this.logger.error(`Error fetching commit activity for ${repo.full_name}: ${error.message}`);
                    return {
                        repo: repo.name,
                        activity: [],
                    };
                }
            }));
            const today = new Date();
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(today.getFullYear() - 1);
            const dates = [];
            for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
                dates.push(new Date(d));
            }
            const contributionMap = new Map();
            dates.forEach(date => {
                const dateString = date.toISOString().split('T')[0];
                contributionMap.set(dateString, 0);
            });
            events.forEach(event => {
                const eventDate = new Date(event.created_at);
                const dateString = eventDate.toISOString().split('T')[0];
                if (contributionMap.has(dateString)) {
                    contributionMap.set(dateString, contributionMap.get(dateString) + 1);
                }
            });
            const contributions = Array.from(contributionMap.entries()).map(([date, count]) => ({
                date,
                count,
            }));
            return {
                username,
                totalContributions: contributions.reduce((sum, day) => sum + day.count, 0),
                contributions,
                recentRepositories: repos.map(repo => ({
                    name: repo.name,
                    url: repo.html_url,
                    description: repo.description,
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    language: repo.language,
                })),
                commitActivity: commitActivities,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching GitHub user contributions: ${error.message}`);
            throw error;
        }
    }
    getHeaders() {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
        };
        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }
        return headers;
    }
};
exports.GithubService = GithubService;
exports.GithubService = GithubService = GithubService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], GithubService);
//# sourceMappingURL=github.service.js.map