import { Controller, Get, Query, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);
  private readonly apiUrl = 'https://api.open-meteo.com/v1/forecast';
  private readonly defaultLatitude = -23.5475;
  private readonly defaultLongitude = -46.6361;
  
  constructor(
    private readonly weatherService: WeatherService,
    private readonly httpService: HttpService
  ) {}
  
  private getWeatherInfo(code: number): { main: string; description: string } {
    // Map weather codes to descriptions
    const weatherCodeMap = {
      0: { main: 'Clear', description: 'clear sky' },
      1: { main: 'Clear', description: 'mainly clear' },
      2: { main: 'Clouds', description: 'partly cloudy' },
      3: { main: 'Clouds', description: 'overcast' },
      45: { main: 'Fog', description: 'fog' },
      48: { main: 'Fog', description: 'depositing rime fog' },
      51: { main: 'Drizzle', description: 'light drizzle' },
      53: { main: 'Drizzle', description: 'moderate drizzle' },
      55: { main: 'Drizzle', description: 'dense drizzle' },
      56: { main: 'Drizzle', description: 'light freezing drizzle' },
      57: { main: 'Drizzle', description: 'dense freezing drizzle' },
      61: { main: 'Rain', description: 'slight rain' },
      63: { main: 'Rain', description: 'moderate rain' },
      65: { main: 'Rain', description: 'heavy rain' },
      66: { main: 'Rain', description: 'light freezing rain' },
      67: { main: 'Rain', description: 'heavy freezing rain' },
      71: { main: 'Snow', description: 'slight snow fall' },
      73: { main: 'Snow', description: 'moderate snow fall' },
      75: { main: 'Snow', description: 'heavy snow fall' },
      77: { main: 'Snow', description: 'snow grains' },
      80: { main: 'Rain', description: 'slight rain showers' },
      81: { main: 'Rain', description: 'moderate rain showers' },
      82: { main: 'Rain', description: 'violent rain showers' },
      85: { main: 'Snow', description: 'slight snow showers' },
      86: { main: 'Snow', description: 'heavy snow showers' },
      95: { main: 'Thunderstorm', description: 'thunderstorm' },
      96: { main: 'Thunderstorm', description: 'thunderstorm with slight hail' },
      99: { main: 'Thunderstorm', description: 'thunderstorm with heavy hail' },
    };
    
    return weatherCodeMap[code] || { main: 'Unknown', description: 'unknown weather' };
  }

  @Get()
  @ApiOperation({ summary: 'Get current weather' })
  @ApiQuery({ name: 'city', required: false, description: 'City name' })
  @ApiQuery({ name: 'country', required: false, description: 'Country code' })
  @ApiResponse({ status: 200, description: 'Returns current weather data' })
  async getCurrentWeather(
    @Query('city') city?: string,
    @Query('country') country?: string,
  ) {
    return this.weatherService.getCurrentWeather(city, country);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current weather (alias)' })
  @ApiQuery({ name: 'city', required: false, description: 'City name' })
  @ApiQuery({ name: 'country', required: false, description: 'Country code' })
  @ApiResponse({ status: 200, description: 'Returns current weather data' })
  async getCurrentWeatherAlias(
    @Query('city') city?: string,
    @Query('country') country?: string,
  ) {
    return this.weatherService.getCurrentWeather(city, country);
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Get weather forecast' })
  @ApiQuery({ name: 'city', required: false, description: 'City name' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days' })
  @ApiResponse({ status: 200, description: 'Returns weather forecast data' })
  async getWeatherForecast(
    @Query('city') city?: string,
    @Query('days') days?: number,
  ) {
    try {
      // Use Open-Meteo API to get real forecast data
      const response = await firstValueFrom(
        this.httpService.get(this.apiUrl, {
          params: {
            latitude: this.defaultLatitude,
            longitude: this.defaultLongitude,
            daily: 'temperature_2m_max,temperature_2m_min,weather_code',
            timezone: 'America/Sao_Paulo',
            forecast_days: days || 3,
          },
        }),
      );
      
      // Transform the response to match the expected format
      const forecastData = response.data;
      const forecasts = [];
      
      for (let i = 0; i < forecastData.daily.time.length; i++) {
        const weatherCode = forecastData.daily.weather_code[i];
        const weatherInfo = this.getWeatherInfo(weatherCode);
        
        forecasts.push({
          date: forecastData.daily.time[i],
          temp: {
            min: forecastData.daily.temperature_2m_min[i],
            max: forecastData.daily.temperature_2m_max[i]
          },
          weather: {
            main: weatherInfo.main,
            description: weatherInfo.description
          }
        });
      }
      
      return {
        city: city || 'São Paulo',
        country: 'BR',
        forecast: forecasts.slice(0, days || 3)
      };
    } catch (error) {
      this.logger.error('Error fetching forecast data:', error.response?.data || error.message);
      throw new HttpException(
        'Failed to fetch forecast data',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
