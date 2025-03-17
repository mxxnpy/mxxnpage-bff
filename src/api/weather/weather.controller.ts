import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

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
    // Return mock forecast data for now
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
}
