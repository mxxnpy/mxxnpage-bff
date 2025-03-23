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
      // Get top artists and tracks
      const topArtists = await this.spotifyService.getTopItems('artists', 'medium_term', 10);
      const topTracks = await this.spotifyService.getTopItems('tracks', 'medium_term', 20);
      const recentlyPlayed = await this.spotifyService.getRecentlyPlayed(50);
      
      // Extract genres from top artists
      const allGenres = topArtists.items?.flatMap(artist => artist.genres || []) || [];
      const uniqueGenres = [...new Set(allGenres)];
      
      // Split genres based on frequency
      const genreFrequency = {};
      allGenres.forEach(genre => {
        genreFrequency[genre] = (genreFrequency[genre] || 0) + 1;
      });
      
      // Sort genres by frequency
      const sortedGenres = Object.keys(genreFrequency).sort((a, b) => 
        genreFrequency[b] - genreFrequency[a]
      );
      
      return {
        highProductivityGenres: sortedGenres.slice(0, 4) || ['Electronic', 'Classical', 'Ambient', 'Lo-Fi'],
        lowProductivityGenres: sortedGenres.slice(4, 8) || ['Rock', 'Pop', 'Hip-Hop', 'R&B'],
        bestArtistsForFocus: topArtists.items?.slice(0, 3).map(a => a.name) || [],
        bestAlbumsForFocus: topTracks.items?.slice(0, 3).map(t => t.album?.name) || [],
        recommendedWorkPlaylist: 'spotify:playlist:37i9dQZF1DX5trt9i14X7j'
      };
    } catch (error) {
      console.error('Error analyzing productivity correlation:', error.message);
      return {
        error: 'Failed to analyze productivity correlation',
        message: error.message,
        highProductivityGenres: ['Electronic', 'Classical', 'Ambient', 'Lo-Fi'],
        lowProductivityGenres: ['Rock', 'Pop', 'Hip-Hop', 'R&B']
      };
    }
  }

  @Get('listening-patterns')
  @ApiOperation({ summary: 'Get developer\'s listening patterns over time' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (day, week, month)' })
  @ApiResponse({ status: 200, description: 'Returns analysis of listening patterns over time' })
  async getListeningPatterns(@Query('period') period: string = 'week') {
    try {
      // Get recently played tracks
      const recentlyPlayed = await this.spotifyService.getRecentlyPlayed(50);
      
      if (!recentlyPlayed.items || recentlyPlayed.items.length === 0) {
        throw new Error('No recently played tracks available');
      }
      
      // Calculate listening time (approximate based on track duration)
      let workHoursTime = 0;
      let nonWorkHoursTime = 0;
      
      recentlyPlayed.items.forEach(item => {
        const track = item.track;
        const playedAt = new Date(item.played_at);
        const duration = track?.duration_ms || 180000; // Default to 3 minutes if duration unknown
        
        const day = playedAt.getDay();
        const hour = playedAt.getHours();
        
        // Check if played during work hours
        const isWeekday = day >= 1 && day <= 5;
        const isWorkHour = hour >= 9 && hour <= 18;
        
        if (isWeekday && isWorkHour) {
          workHoursTime += duration;
        } else {
          nonWorkHoursTime += duration;
        }
      });
      
      // Convert to hours
      const workHoursInHours = (workHoursTime / 3600000);
      const nonWorkHoursInHours = (nonWorkHoursTime / 3600000);
      
      // Calculate daily average
      const averageWorkHours = (workHoursInHours / 5).toFixed(1); // 5 workdays per week
      const averageNonWorkHours = (nonWorkHoursInHours / 7).toFixed(1); // 7 days per week
      
      // Determine day with most listening
      const dayCount = [0, 0, 0, 0, 0, 0, 0]; // Sun - Sat
      recentlyPlayed.items.forEach(item => {
        const playedAt = new Date(item.played_at);
        dayCount[playedAt.getDay()]++;
      });
      
      const maxDay = dayCount.indexOf(Math.max(...dayCount));
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      // Time of day distribution
      const timeDistribution = {
        morning: 0,
        afternoon: 0,
        evening: 0
      };
      
      recentlyPlayed.items.forEach(item => {
        const playedAt = new Date(item.played_at);
        const hour = playedAt.getHours();
        
        if (hour >= 5 && hour < 12) {
          timeDistribution.morning++;
        } else if (hour >= 12 && hour < 18) {
          timeDistribution.afternoon++;
        } else {
          timeDistribution.evening++;
        }
      });
      
      const total = recentlyPlayed.items.length;
      
      return {
        totalListeningTime: {
          workHours: `${workHoursInHours.toFixed(1)} hours`,
          nonWorkHours: `${nonWorkHoursInHours.toFixed(1)} hours`
        },
        averageDailyListening: {
          workHours: `${averageWorkHours} hours`,
          nonWorkHours: `${averageNonWorkHours} hours`
        },
        dayWithMostListening: days[maxDay],
        timeOfDayDistribution: {
          morning: `${Math.round((timeDistribution.morning / total) * 100)}%`,
          afternoon: `${Math.round((timeDistribution.afternoon / total) * 100)}%`,
          evening: `${Math.round((timeDistribution.evening / total) * 100)}%`
        },
        period
      };
    } catch (error) {
      console.error('Error analyzing listening patterns:', error.message);
      return {
        error: 'Failed to analyze listening patterns',
        message: error.message,
        totalListeningTime: { workHours: '0 hours', nonWorkHours: '0 hours' },
        averageDailyListening: { workHours: '0 hours', nonWorkHours: '0 hours' },
        dayWithMostListening: 'N/A',
        timeOfDayDistribution: { morning: '0%', afternoon: '0%', evening: '0%' },
        period
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
    
    // Count genres by frequency
    const genreCount = {};
    allGenres.forEach(genre => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
    
    // Sort genres by frequency
    const sortedGenres = Object.keys(genreCount).sort((a, b) => 
      genreCount[b] - genreCount[a]
    );
    
    // Divide into work and non-work genres
    const uniqueGenres = [...new Set(allGenres)];
    const midpoint = Math.ceil(uniqueGenres.length / 2);
    
    return {
      workGenres: sortedGenres.slice(0, 5),
      nonWorkGenres: sortedGenres.slice(5, 10)
    };
  }

  private calculateListeningTrend(tracks: any[]): string {
    // Calculate trend based on listening frequency over time
    if (!tracks.length) return '0%';
    
    // Group tracks by day
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    // Count tracks from last week and the week before
    const lastWeekCount = tracks.filter(item => {
      const playedAt = new Date(item.playedAt || item.played_at);
      return playedAt >= oneWeekAgo && playedAt <= now;
    }).length;
    
    const previousWeekCount = tracks.filter(item => {
      const playedAt = new Date(item.playedAt || item.played_at);
      return playedAt >= twoWeeksAgo && playedAt < oneWeekAgo;
    }).length;
    
    // Calculate percentage change
    if (previousWeekCount === 0) return '+100%';
    const percentChange = Math.round(((lastWeekCount - previousWeekCount) / previousWeekCount) * 100);
    
    return `${percentChange >= 0 ? '+' : ''}${percentChange}%`;
  }
}
