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
exports.WeatherService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let WeatherService = class WeatherService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.apiUrl = 'https://api.openweathermap.org/data/2.5';
        this.defaultCity = 'São Paulo';
        this.defaultCountry = 'BR';
        this.apiKey = this.configService.get('OPENWEATHER_API_KEY') || 'demo_key';
    }
    async getCurrentWeather(city = this.defaultCity, country = this.defaultCountry) {
        var _a, _b;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiUrl}/weather`, {
                params: {
                    q: `${city},${country}`,
                    appid: this.apiKey,
                    units: 'metric',
                },
            }));
            return response.data;
        }
        catch (error) {
            console.error('Error fetching weather data:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            if (this.apiKey === 'demo_key') {
                return this.getMockWeatherData();
            }
            throw new common_1.HttpException('Failed to fetch weather data', ((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    getMockWeatherData() {
        return {
            coord: { lon: -46.6333, lat: -23.5478 },
            weather: [
                {
                    id: 801,
                    main: 'Clouds',
                    description: 'few clouds',
                    icon: '02d',
                },
            ],
            base: 'stations',
            main: {
                temp: 25.2,
                feels_like: 25.4,
                temp_min: 23.9,
                temp_max: 26.7,
                pressure: 1015,
                humidity: 65,
            },
            visibility: 10000,
            wind: {
                speed: 3.6,
                deg: 140,
            },
            clouds: {
                all: 20,
            },
            dt: 1616782800,
            sys: {
                type: 1,
                id: 8394,
                country: 'BR',
                sunrise: 1616752347,
                sunset: 1616795553,
            },
            timezone: -10800,
            id: 3448439,
            name: 'São Paulo',
            cod: 200,
        };
    }
};
exports.WeatherService = WeatherService;
exports.WeatherService = WeatherService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], WeatherService);
//# sourceMappingURL=weather.service.js.map