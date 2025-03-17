import { WeatherService } from './weather.service';
export declare class WeatherController {
    private readonly weatherService;
    constructor(weatherService: WeatherService);
    getCurrentWeather(city?: string, country?: string): Promise<any>;
    getCurrentWeatherAlias(city?: string, country?: string): Promise<any>;
    getWeatherForecast(city?: string, days?: number): Promise<{
        city: string;
        country: string;
        forecast: {
            date: string;
            temp: {
                min: number;
                max: number;
            };
            weather: {
                main: string;
                description: string;
            };
        }[];
    }>;
}
