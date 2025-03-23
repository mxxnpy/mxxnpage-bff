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
      this.redirectUri = process.env.DISCORD_REDIRECT_URI || 'https://mxxnpage-bff.vercel.app/backend/discord/auth/callback';
      
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
      this.redirectUri = process.env.DISCORD_REDIRECT_URI || 'https://mxxnpage-bff.vercel.app/backend/discord/auth/callback';
    }
  }
  
  async getPresence() {
    try {
      const token = await this.getDiscordToken();
      
      if (!token) {
        return {
          status: 'offline',
          statusText: 'Offline',
          timestamp: new Date().toISOString(),
        };
      }
      
      try {
        const activities = await this.getActivity();
        let status = 'online';
        let statusText = 'Online';
        
        if (activities && activities.length > 0) {
          const activity = activities[0];
          if (activity.type === 'PLAYING') {
            statusText = `Playing ${activity.name}`;
          } else if (activity.type === 'STREAMING') {
            statusText = `Streaming ${activity.name}`;
          } else if (activity.type === 'LISTENING') {
            statusText = `Listening to ${activity.name}`;
          } else if (activity.type === 'WATCHING') {
            statusText = `Watching ${activity.name}`;
          } else if (activity.type === 'CUSTOM') {
            statusText = activity.state || 'Custom Status';
          }
        }
        
        return {
          status,
          statusText,
          timestamp: new Date().toISOString(),
        };
      } catch (apiError) {
        this.logger.error(`Discord API error: ${apiError.message}`);
        return {
          status: 'error',
          statusText: 'Error fetching status',
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      this.logger.error(`Error getting Discord presence: ${error.message}`);
      return {
        status: 'error',
        statusText: 'Error fetching status',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getActivity() {
    try {
      const token = await this.getDiscordToken();
      
      if (!token) {
        return [];
      }
      
      try {
        const response = await firstValueFrom(
          this.httpService.get('https://discord.com/api/v10/users/@me/activities', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        );
        
        if (response.data && Array.isArray(response.data)) {
          return response.data.map(activity => ({
            type: activity.type === 0 ? 'PLAYING' : 
                  activity.type === 1 ? 'STREAMING' :
                  activity.type === 2 ? 'LISTENING' :
                  activity.type === 3 ? 'WATCHING' :
                  activity.type === 4 ? 'CUSTOM' : 'UNKNOWN',
            name: activity.name || '',
            details: activity.details || '',
            state: activity.state || '',
            timestamps: activity.timestamps || { start: Date.now() },
          }));
        }
        
        return [];
      } catch (apiError) {
        this.logger.error(`Discord API error: ${apiError.message}`);
        return [];
      }
    } catch (error) {
      this.logger.error(`Error getting Discord activity: ${error.message}`);
      return [];
    }
  }
  
  private async getDiscordToken(): Promise<string | null> {
    try {
      if (!this.clientId || !this.clientSecret) {
        return null;
      }
      
      // This would be replaced with actual token retrieval logic
      // when Discord OAuth flow is implemented
      return null;
    } catch (error) {
      this.logger.error(`Error retrieving Discord token: ${error.message}`);
      return null;
    }
  }
}
