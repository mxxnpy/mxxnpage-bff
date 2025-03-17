import { Controller, Get } from '@nestjs/common';
import { StatusService } from './status.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ScheduleConfig } from '../../interfaces/status.interface';

@ApiTags('status')
@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  @ApiOperation({ summary: 'Get current status' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current status based on schedule and activity',
  })
  async getStatus() {
    return this.statusService.getCurrentStatus();
  }

  @Get('schedule')
  @ApiOperation({ summary: 'Get schedule information' })
  @ApiResponse({
    status: 200,
    description: 'Returns the schedule configuration',
  })
  async getSchedule(): Promise<ScheduleConfig> {
    return this.statusService.getSchedule();
  }
}
