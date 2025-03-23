import { Controller, Get } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('discord')
@Controller('discord')
export class DiscordController {
  constructor(private readonly discordService: DiscordService) {}

  @Get('presence')
  @ApiOperation({ summary: 'Get Discord presence' })
  @ApiResponse({
    status: 200,
    description: 'Returns Discord presence information',
  })
  async getPresence() {
    return this.discordService.getPresence();
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get Discord activity' })
  @ApiResponse({
    status: 200,
    description: 'Returns Discord activity information',
  })
  async getActivity() {
    return this.discordService.getActivity();
  }
}
