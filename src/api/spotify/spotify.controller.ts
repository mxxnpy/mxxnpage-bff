import { Controller, Get, Param, Query } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('spotify')
@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('current-user')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current user profile',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getCurrentUser() {
    return this.spotifyService.getUserProfile();
  }

  @Get('current-track')
  @ApiOperation({ summary: 'Get currently playing track' })
  @ApiResponse({
    status: 200,
    description: 'Returns currently playing track information',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or authentication required',
  })
  async getCurrentTrack() {
    try {
      return await this.spotifyService.getCurrentTrack();
    } catch (error) {
      console.error(`Error fetching current track: ${error.message}`);
      // Return a structured error response
      return {
        is_playing: false,
        item: null,
        error: "Authentication required. Please authenticate with Spotify first."
      };
    }
  }

  @Get('recently-played')
  @ApiOperation({ summary: 'Get recently played tracks' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of tracks to return' })
  @ApiResponse({
    status: 200,
    description: 'Returns recently played tracks',
  })
  async getRecentlyPlayed(@Query('limit') limit: number = 10) {
    return this.spotifyService.getRecentlyPlayed(limit);
  }
  
  @Get('top/:type')
  @ApiOperation({ summary: 'Get user top items (artists or tracks)' })
  @ApiParam({ name: 'type', description: 'Type of top items (artists or tracks)' })
  @ApiQuery({ name: 'time_range', required: false, description: 'Time range (short_term, medium_term, long_term)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items to return' })
  @ApiResponse({
    status: 200,
    description: 'Returns user top items',
  })
  async getTopItems(
    @Param('type') type: 'artists' | 'tracks',
    @Query('time_range') timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    @Query('limit') limit: number = 10,
  ) {
    return this.spotifyService.getTopItems(type, timeRange, limit);
  }
  
  @Get('playlists')
  @ApiOperation({ summary: 'Get user playlists' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of playlists to return' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns user playlists',
  })
  async getPlaylists(
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    return this.spotifyService.getPlaylists(limit, offset);
  }
  
  @Get('playlists/:id/tracks')
  @ApiOperation({ summary: 'Get playlist tracks' })
  @ApiParam({ name: 'id', description: 'Playlist ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of tracks to return' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns playlist tracks',
  })
  async getPlaylistTracks(
    @Param('id') id: string,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    return this.spotifyService.getPlaylistTracks(id, limit, offset);
  }
}
