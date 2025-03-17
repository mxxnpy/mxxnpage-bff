import { Controller, Get, Query } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('spotify-developer-activity')
@Controller('spotify/developer-activity')
export class SpotifyDeveloperActivityController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('work-hours-analysis')
  @ApiOperation({ summary: 'Get developer\'s work hours listening analysis' })
  @ApiResponse({ status: 200, description: 'Returns analysis of listening patterns during work hours' })
  async getWorkHoursAnalysis() {
    try {
      // Get recently played tracks
      const recentlyPlayed = await this.spotifyService.getRecentlyPlayed(50);
      
      // Get top artists for genre analysis
      const topArtists = await this.spotifyService.getTopItems('artists', 'short_term', 10);
      
      // Calculate work hours listening percentage
      const workHoursPercentage = this.calculateWorkHoursPercentage(recentlyPlayed.items || []);
      
      // Determine peak listening time
      const peakListeningTime = this.determinePeakListeningTime(recentlyPlayed.items || []);
      
      // Extract work and non-work genres
      const { workGenres, nonWorkGenres } = this.categorizeGenres(topArtists.items || [], recentlyPlayed.items || []);
      
      // Calculate listening trend compared to previous period
      const listeningTrend = this.calculateListeningTrend(recentlyPlayed.items || []);
      
      return {
        workHoursPercentage,
        peakListeningTime,
        workGenres,
        nonWorkGenres,
        listeningTrend,
        mostProductiveGenre: workGenres[0] || 'Electronic',
        isCurrentlyInWorkHours: this.isWorkHours(),
        currentTime: new Date().toISOString()
      };
    } catch (error) {
      return {
        error: 'Failed to analyze work hours listening',
        message: error.message,
      };
    }
  }

  @Get('productivity-correlation')
  @ApiOperation({ summary: 'Get correlation between music genres and productivity' })
  @ApiResponse({ status: 200, description: 'Returns analysis of how music genres correlate with productivity' })
  async getProductivityCorrelation() {
    try {
      // This would ideally use data from multiple sources to correlate
      // music listening with productivity metrics
      
      // For now, return a placeholder analysis
      return {
        highProductivityGenres: ['Electronic', 'Classical', 'Ambient', 'Lo-Fi'],
        lowProductivityGenres: ['Heavy Metal', 'Hard Rock', 'Pop'],
        bestArtistsForFocus: ['Brian Eno', 'Tycho', 'Bonobo'],
        bestAlbumsForFocus: ['Music For Airports', 'Dive', 'Black Sands'],
        recommendedWorkPlaylist: 'spotify:playlist:37i9dQZF1DX5trt9i14X7j'
      };
    } catch (error) {
      return {
        error: 'Failed to analyze productivity correlation',
        message: error.message,
      };
    }
  }

  @Get('listening-patterns')
  @ApiOperation({ summary: 'Get developer\'s listening patterns over time' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (day, week, month)' })
  @ApiResponse({ status: 200, description: 'Returns analysis of listening patterns over time' })
  async getListeningPatterns(@Query('period') period: string = 'week') {
    try {
      // This would analyze listening patterns over the specified time period
      
      // For now, return a placeholder analysis
      return {
        totalListeningTime: {
          workHours: '12.5 hours',
          nonWorkHours: '18.2 hours'
        },
        averageDailyListening: {
          workHours: '2.5 hours',
          nonWorkHours: '3.6 hours'
        },
        dayWithMostListening: 'Wednesday',
        timeOfDayDistribution: {
          morning: '25%',
          afternoon: '45%',
          evening: '30%'
        },
        period
      };
    } catch (error) {
      return {
        error: 'Failed to analyze listening patterns',
        message: error.message,
      };
    }
  }

  private isWorkHours(): boolean {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour + (minute / 60);
    
    // Check if it's a weekday (1-5 is Monday-Friday)
    const isWeekday = day >= 1 && day <= 5;
    
    // Check if current time is between 8:30 and 18:30
    const isWorkTime = currentTime >= 8.5 && currentTime <= 18.5;
    
    return isWeekday && isWorkTime;
  }

  private calculateWorkHoursPercentage(tracks: any[]): number {
    if (!tracks.length) return 0;
    
    // Count tracks played during work hours
    let workHoursTracks = 0;
    
    tracks.forEach(item => {
      const playedAt = new Date(item.playedAt);
      const day = playedAt.getDay();
      const hour = playedAt.getHours();
      const minute = playedAt.getMinutes();
      const playTime = hour + (minute / 60);
      
      // Check if played during work hours
      const isWeekday = day >= 1 && day <= 5;
      const isWorkTime = playTime >= 8.5 && playTime <= 18.5;
      
      if (isWeekday && isWorkTime) {
        workHoursTracks++;
      }
    });
    
    // Calculate percentage
    return Math.round((workHoursTracks / tracks.length) * 100);
  }

  private determinePeakListeningTime(tracks: any[]): string {
    if (!tracks.length) return '10:00 - 12:00';
    
    // Group tracks by hour
    const hourCounts = new Array(24).fill(0);
    
    tracks.forEach(item => {
      const playedAt = new Date(item.playedAt);
      const day = playedAt.getDay();
      const hour = playedAt.getHours();
      
      // Only count weekday work hours
      const isWeekday = day >= 1 && day <= 5;
      const isWorkHour = hour >= 8 && hour <= 18;
      
      if (isWeekday && isWorkHour) {
        hourCounts[hour]++;
      }
    });
    
    // Find peak hour
    let peakHour = 9; // Default to 9 AM
    let maxCount = hourCounts[9];
    
    for (let i = 9; i <= 18; i++) {
      if (hourCounts[i] > maxCount) {
        maxCount = hourCounts[i];
        peakHour = i;
      }
    }
    
    // Format peak time range
    return `${peakHour}:00 - ${peakHour + 1}:00`;
  }

  private categorizeGenres(artists: any[], tracks: any[]): { workGenres: string[], nonWorkGenres: string[] } {
    // Extract all genres from artists
    const allGenres = artists.flatMap(artist => artist.genres || []);
    
    // Default genres if no data is available
    if (!allGenres.length) {
      return {
        workGenres: ['Electronic', 'Ambient', 'Classical', 'Jazz', 'Lo-Fi'],
        nonWorkGenres: ['Rock', 'Pop', 'Hip-Hop', 'R&B', 'Metal']
      };
    }
    
    // In a real implementation, we would:
    // 1. Categorize tracks as work or non-work based on when they were played
    // 2. Map tracks to artists and their genres
    // 3. Count genre occurrences in work vs. non-work hours
    // 4. Sort genres by frequency in each category
    
    // For now, we'll just split the available genres
    const uniqueGenres = [...new Set(allGenres)];
    const midpoint = Math.ceil(uniqueGenres.length / 2);
    
    return {
      workGenres: uniqueGenres.slice(0, midpoint).slice(0, 5),
      nonWorkGenres: uniqueGenres.slice(midpoint).slice(0, 5)
    };
  }

  private calculateListeningTrend(tracks: any[]): string {
    // In a real implementation, this would compare current listening
    // patterns with a previous time period
    
    // For now, return a random trend between -20% and +20%
    const trendValue = Math.floor(Math.random() * 41) - 20;
    return `${trendValue >= 0 ? '+' : ''}${trendValue}%`;
  }
}
