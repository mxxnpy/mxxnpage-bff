import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class WeatherService {
    private readonly httpService;
    private readonly configService;
    private readonly apiKey;
    private readonly apiUrl;
    private readonly defaultCity;
    private readonly defaultCountry;
    constructor(httpService: HttpService, configService: ConfigService);
    getCurrentWeather(city?: string, country?: string): Promise<any>;
    private getMockWeatherData;
}
