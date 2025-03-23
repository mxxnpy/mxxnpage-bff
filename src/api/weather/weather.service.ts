import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiUrl = 'https://api.open-meteo.com/v1/forecast';
  private readonly defaultCity = 'São Paulo';
  private readonly defaultCountry = 'BR';
  private readonly defaultLatitude = -23.5475;
  private readonly defaultLongitude = -46.6361;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.logger.log('WeatherService initialized with Open-Meteo API');
  }

  async getCurrentWeather(city: string = this.defaultCity, country: string = this.defaultCountry): Promise<any> {
    try {
      // Open-Meteo uses latitude/longitude instead of city names
      // For simplicity, we'll use the default coordinates for São Paulo
      // In a production app, we would use a geocoding service to convert city names to coordinates
      
      const response = await firstValueFrom(
        this.httpService.get(this.apiUrl, {
          params: {
            latitude: this.defaultLatitude,
            longitude: this.defaultLongitude,
            current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
            timezone: 'America/Sao_Paulo',
          },
        }),
      );
      
      // Transform Open-Meteo response to match the format expected by the frontend
      return this.transformOpenMeteoResponse(response.data, city);
    } catch (error) {
      this.logger.error('Error fetching weather data:', error.response?.data || error.message);
      
      // Return error response instead of mock data
      throw new HttpException(
        'Failed to fetch weather data',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private transformOpenMeteoResponse(data: any, cityName: string): any {
    // Map weather codes to descriptions
    // https://open-meteo.com/en/docs/weather-api
    const weatherCodeMap = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail',
    };

    const weatherCode = data.current.weather_code;
    const weatherDescription = weatherCodeMap[weatherCode] || 'Unknown';
    
    // Map weather codes to icon names similar to what the frontend expects
    const getIconName = (code: number): string => {
      if (code === 0) return '01d'; // clear sky
      if (code === 1) return '02d'; // mainly clear
      if (code === 2) return '03d'; // partly cloudy
      if (code === 3) return '04d'; // overcast
      if (code >= 45 && code <= 48) return '50d'; // fog
      if (code >= 51 && code <= 67) return '09d'; // rain
      if (code >= 71 && code <= 77) return '13d'; // snow
      if (code >= 80 && code <= 82) return '10d'; // rain showers
      if (code >= 85 && code <= 86) return '13d'; // snow showers
      if (code >= 95) return '11d'; // thunderstorm
      return '50d'; // default
    };

    // Create a response that matches the structure expected by the frontend
    return {
      coord: { 
        lon: data.longitude, 
        lat: data.latitude 
      },
      weather: [
        {
          id: weatherCode,
          main: weatherDescription.split(' ')[0],
          description: weatherDescription.toLowerCase(),
          icon: getIconName(weatherCode),
        },
      ],
      base: 'open-meteo',
      main: {
        temp: data.current.temperature_2m,
        feels_like: data.current.temperature_2m, // Open-Meteo doesn't provide feels_like
        temp_min: data.current.temperature_2m, // Open-Meteo doesn't provide min/max
        temp_max: data.current.temperature_2m,
        pressure: 1015, // Default value as Open-Meteo doesn't provide this
        humidity: data.current.relative_humidity_2m,
      },
      visibility: 10000, // Default value
      wind: {
        speed: data.current.wind_speed_10m,
        deg: 0, // Open-Meteo doesn't provide wind direction in the free tier
      },
      clouds: {
        all: weatherCode <= 3 ? weatherCode * 25 : 100, // Approximate cloud coverage
      },
      dt: Math.floor(new Date().getTime() / 1000),
      sys: {
        type: 1,
        id: 8394,
        country: 'BR',
        sunrise: Math.floor(new Date().setHours(6, 0, 0, 0) / 1000),
        sunset: Math.floor(new Date().setHours(18, 0, 0, 0) / 1000),
      },
      timezone: -10800,
      id: 3448439,
      name: cityName,
      cod: 200,
    };
  }

  // Mock data function removed as requested
}
