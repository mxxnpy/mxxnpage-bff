import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    try {
      this.clientId = process.env.DISCORD_CLIENT_ID || '';
      this.clientSecret = process.env.DISCORD_CLIENT_SECRET || '';
      this.redirectUri = process.env.DISCORD_REDIRECT_URI || 'https://mxxnbff.netlify.app/backend/discord/auth/callback';
      
      if (this.configService) {
        const configClientId = this.configService.get<string>('DISCORD_CLIENT_ID');
        const configClientSecret = this.configService.get<string>('DISCORD_CLIENT_SECRET');
        const configRedirectUri = this.configService.get<string>('DISCORD_REDIRECT_URI');
        
        if (configClientId) this.clientId = configClientId;
        if (configClientSecret) this.clientSecret = configClientSecret;
        if (configRedirectUri) this.redirectUri = configRedirectUri;
      }
      
      if (!this.clientId || !this.clientSecret) {
        this.logger.warn('Discord credentials missing. Some Discord API features may not work correctly.');
      }
    } catch (error) {
      this.logger.error(`Error initializing DiscordService: ${error.message}`);
      this.clientId = process.env.DISCORD_CLIENT_ID || '';
      this.clientSecret = process.env.DISCORD_CLIENT_SECRET || '';
      this.redirectUri = process.env.DISCORD_REDIRECT_URI || 'https://mxxnbff.netlify.app/backend/discord/auth/callback';
    }
  }

  async getPresence() {
    // In a real implementation, this would connect to Discord's API
    // For this demo, we'll simulate the presence data
    const activities = await this.getActivity();
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const day = currentTime.getDay();
    
    // Determine status based on time and day
    let status = 'online';
    let statusText = 'Online';
    
    // Weekend (0 = Sunday, 6 = Saturday)
    if (day === 0 || day === 6) {
      statusText = 'Free Time';
    } else {
      // Weekday
      if (hours >= 8 && hours < 18) {
        statusText = 'At Work';
      } else if (hours >= 6 && hours < 8) {
        statusText = 'Free Time';
      } else if (hours >= 19 && hours < 24) {
        statusText = 'Free Time';
      }
    }
    
    // Override based on activities
    if (activities.some(a => a.type === 'GAMING')) {
      statusText = 'Gaming';
    } else if (activities.some(a => a.type === 'PROGRAMMING')) {
      statusText = 'Programming';
    } else if (activities.some(a => a.type === 'IN_CALL')) {
      statusText = 'With Friends';
    } else if (status === 'idle') {
      statusText = 'Out of Home';
    } else if (activities.some(a => a.type === 'LISTENING') && !(hours >= 8 && hours < 18 && (day >= 1 && day <= 5))) {
      statusText = 'Vibing';
    }
    
    return {
      status,
      statusText,
      timestamp: currentTime.toISOString(),
    };
  }

  async getActivity() {
    // In a real implementation, this would connect to Discord's API
    // For this demo, we'll simulate the activity data
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const activities: Array<{
      type: string;
      name: string;
      details: string;
      state: string;
      timestamps: {
        start: number;
      };
    }> = [];
    
    // Simulate different activities based on time of day
    if (hours >= 20 && hours < 23) {
      activities.push({
        type: 'GAMING',
        name: 'Valorant',
        details: 'Competitive Match',
        state: 'In Game',
        timestamps: {
          start: Date.now() - 1800000, // 30 minutes ago
        },
      });
    } else if (hours >= 9 && hours < 18) {
      activities.push({
        type: 'PROGRAMMING',
        name: 'Visual Studio Code',
        details: 'Editing TypeScript',
        state: 'Working on a project',
        timestamps: {
          start: Date.now() - 3600000, // 1 hour ago
        },
      });
    } else if (hours >= 18 && hours < 20) {
      activities.push({
        type: 'LISTENING',
        name: 'Spotify',
        details: 'Listening to music',
        state: 'Relaxing',
        timestamps: {
          start: Date.now() - 900000, // 15 minutes ago
        },
      });
    }
    
    return activities;
  }
}