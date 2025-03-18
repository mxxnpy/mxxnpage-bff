import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.openweathermap.org/data/2.5';
  private readonly defaultCity = 'São Paulo';
  private readonly defaultCountry = 'BR';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    try {
      this.apiKey = process.env.WEATHER_API_KEY || 'demo_key';
      
      if (this.configService) {
        const configApiKey = this.configService.get<string>('WEATHER_API_KEY');
        if (configApiKey) {
          this.apiKey = configApiKey;
        }
      }
      
      if (this.apiKey === 'demo_key') {
        this.logger.warn('Using demo key for weather API. Only mock data will be returned.');
      }
    } catch (error) {
      this.logger.error(`Error initializing WeatherService: ${error.message}`);
      this.apiKey = process.env.WEATHER_API_KEY || 'demo_key';
    }
  }

  async getCurrentWeather(city: string = this.defaultCity, country: string = this.defaultCountry): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/weather`, {
          params: {
            q: `${city},${country}`,
            appid: this.apiKey,
            units: 'metric',
          },
        }),
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error.response?.data || error.message);
      
      // If we're using the demo key, return mock data
      if (this.apiKey === 'demo_key') {
        return this.getMockWeatherData();
      }
      
      throw new HttpException(
        'Failed to fetch weather data',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getMockWeatherData(): any {
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
}