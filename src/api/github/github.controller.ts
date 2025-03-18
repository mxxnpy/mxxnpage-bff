import { Controller, Get, Param, Query } from '@nestjs/common';
import { GithubService } from './github.service';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('github')
@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('user/:username')
  @ApiOperation({ summary: 'Get GitHub user profile' })
  @ApiParam({ name: 'username', description: 'GitHub username' })
  @ApiResponse({ status: 200, description: 'Returns GitHub user profile information' })
  async getUserProfile(@Param('username') username: string) {
    return this.githubService.getUserProfile(username);
  }

  @Get('activity/:username')
  @ApiOperation({ summary: 'Get GitHub user activity' })
  @ApiParam({ name: 'username', description: 'GitHub username' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of activities to return' })
  @ApiResponse({ status: 200, description: 'Returns GitHub user activity' })
  async getUserActivity(
    @Param('username') username: string,
    @Query('limit') limit: number = 10,
  ) {
    return this.githubService.getUserActivity(username);
  }

  @Get('contributions/:username')
  @ApiOperation({ summary: 'Get GitHub user contributions' })
  @ApiParam({ name: 'username', description: 'GitHub username' })
  @ApiResponse({ status: 200, description: 'Returns GitHub user contributions' })
  async getUserContributions(@Param('username') username: string) {
    return this.githubService.getUserContributions(username);
  }
}