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
exports.WeatherController = void 0;
const common_1 = require("@nestjs/common");
const weather_service_1 = require("./weather.service");
const swagger_1 = require("@nestjs/swagger");
let WeatherController = class WeatherController {
    constructor(weatherService) {
        this.weatherService = weatherService;
    }
    async getCurrentWeather(city, country) {
        return this.weatherService.getCurrentWeather(city, country);
    }
    async getCurrentWeatherAlias(city, country) {
        return this.weatherService.getCurrentWeather(city, country);
    }
    async getWeatherForecast(city, days) {
        return {
            city: city || 'São Paulo',
            country: 'BR',
            forecast: [
                {
                    date: new Date().toISOString(),
                    temp: { min: 20, max: 28 },
                    weather: { main: 'Clear', description: 'clear sky' },
                },
                {
                    date: new Date(Date.now() + 86400000).toISOString(),
                    temp: { min: 19, max: 27 },
                    weather: { main: 'Clouds', description: 'few clouds' },
                },
                {
                    date: new Date(Date.now() + 172800000).toISOString(),
                    temp: { min: 18, max: 25 },
                    weather: { main: 'Rain', description: 'light rain' },
                },
            ].slice(0, days || 3),
        };
    }
};
exports.WeatherController = WeatherController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current weather' }),
    (0, swagger_1.ApiQuery)({ name: 'city', required: false, description: 'City name' }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, description: 'Country code' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns current weather data' }),
    __param(0, (0, common_1.Query)('city')),
    __param(1, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WeatherController.prototype, "getCurrentWeather", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current weather (alias)' }),
    (0, swagger_1.ApiQuery)({ name: 'city', required: false, description: 'City name' }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, description: 'Country code' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns current weather data' }),
    __param(0, (0, common_1.Query)('city')),
    __param(1, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WeatherController.prototype, "getCurrentWeatherAlias", null);
__decorate([
    (0, common_1.Get)('forecast'),
    (0, swagger_1.ApiOperation)({ summary: 'Get weather forecast' }),
    (0, swagger_1.ApiQuery)({ name: 'city', required: false, description: 'City name' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, description: 'Number of days' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns weather forecast data' }),
    __param(0, (0, common_1.Query)('city')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], WeatherController.prototype, "getWeatherForecast", null);
exports.WeatherController = WeatherController = __decorate([
    (0, swagger_1.ApiTags)('weather'),
    (0, common_1.Controller)('weather'),
    __metadata("design:paramtypes", [weather_service_1.WeatherService])
], WeatherController);
//# sourceMappingURL=weather.controller.js.map