import { Controller, Get, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

// Import Activity interface for proper typing
interface Activity {
  type: string;
  name: string;
  details?: string;
  state?: string;
  timestamps?: {
    start: number;
  };
}

@ApiTags('discord')
@Controller('discord')
export class DiscordController {
  private readonly logger = new Logger(DiscordController.name);
  
  constructor(private readonly discordService: DiscordService) {}

  @Get('presence')
  @ApiOperation({ summary: 'Get Discord presence' })
  @ApiResponse({
    status: 200,
    description: 'Returns Discord presence information',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve Discord presence data',
  })
  async getPresence() {
    try {
      return await this.discordService.getPresence();
    } catch (error) {
      this.logger.error(`Error in getPresence controller: ${error.message}`);
      throw new HttpException(
        `Failed to get Discord presence: ${error.message}`, 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get Discord activity' })
  @ApiResponse({
    status: 200,
    description: 'Returns Discord activity information',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve Discord activity data',
  })
  async getActivity(): Promise<Activity[]> {
    try {
      return await this.discordService.getActivity();
    } catch (error) {
      this.logger.error(`Error in getActivity controller: ${error.message}`);
      throw new HttpException(
        `Failed to get Discord activity: ${error.message}`, 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
