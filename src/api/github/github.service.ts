import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DiscordService {
  // Note: Real Discord API integration requires user authentication
  // This implementation returns default data when no authentication is present
  // To get real data, implement OAuth 2.0 flow and store user tokens
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

  // Note: Real Discord API integration requires user authentication
  // This implementation returns default data when no authentication is present
  // To get real data, implement OAuth 2.0 flow and store user tokens
  
  async getPresence() {
    try {
      if (!this.clientId || !this.clientSecret) {
        return this.getDefaultPresence();
      }
      
      // Make API request to Discord for presence data
      const token = await this.getDiscordToken();
      
      if (!token) {
        this.logger.warn('No Discord token available, returning default presence');
        return this.getDefaultPresence();
      }
      
      try {
        // Get activity data from real API
        const activities = await this.getActivity();
        
        // Determine status based on activities
        let status = 'online';
        let statusText = 'Online';
        
        // Override based on activities
        if (activities.some(a => a.type === 'PLAYING' || a.type === 'GAMING')) {
          statusText = 'Gaming';
        } else if (activities.some(a => a.type === 'STREAMING')) {
          statusText = 'Streaming';
        } else if (activities.some(a => a.type === 'LISTENING')) {
          statusText = 'Listening to Music';
        } else if (activities.some(a => a.type === 'WATCHING')) {
          statusText = 'Watching Content';
        } else if (activities.some(a => a.type === 'CUSTOM')) {
          const customActivity = activities.find(a => a.type === 'CUSTOM');
          statusText = customActivity.state || 'Custom Status';
        }
        
        return {
          status,
          statusText,
          timestamp: new Date().toISOString(),
        };
      } catch (apiError) {
        this.logger.error(`Discord API error: ${apiError.message}`);
        return this.getDefaultPresence();
      }
    } catch (error) {
      this.logger.error(`Error getting Discord presence: ${error.message}`);
      return this.getDefaultPresence();
    }
  }
  
  private getDefaultPresence() {
    return {
      status: 'offline',
      statusText: 'Offline or Unavailable',
      timestamp: new Date().toISOString(),
      error: 'Discord authentication required',
    };
  }

  async getActivity() {
    try {
      if (!this.clientId || !this.clientSecret) {
        return this.getDefaultActivity();
      }
      
      const token = await this.getDiscordToken();
      
      if (!token) {
        this.logger.warn('No Discord token available, returning default activity');
        return this.getDefaultActivity();
      }
      
      try {
        // Make request to Discord API for user activities
        const response = await firstValueFrom(
          this.httpService.get('https://discord.com/api/v10/users/@me/activities', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        );
        
        // Map response to our activity format
        if (response.data && Array.isArray(response.data)) {
          return response.data.map(activity => ({
            type: activity.type === 0 ? 'PLAYING' : 
                  activity.type === 1 ? 'STREAMING' :
                  activity.type === 2 ? 'LISTENING' :
                  activity.type === 3 ? 'WATCHING' :
                  activity.type === 4 ? 'CUSTOM' : 'UNKNOWN',
            name: activity.name || 'Unknown Activity',
            details: activity.details || '',
            state: activity.state || '',
            timestamps: activity.timestamps || { start: Date.now() },
          }));
        }
        
        return this.getDefaultActivity();
      } catch (apiError) {
        this.logger.error(`Discord API error: ${apiError.message}`);
        return this.getDefaultActivity();
      }
    } catch (error) {
      this.logger.error(`Error getting Discord activity: ${error.message}`);
      return this.getDefaultActivity();
    }
  }
  
  private getDefaultActivity() {
    return [{
      type: 'UNKNOWN',
      name: 'No activity data available',
      details: 'Authentication required',
      state: 'Please connect Discord account',
      timestamps: {
        start: Date.now(),
      },
    }];
  }
  
  private async getDiscordToken(): Promise<string | null> {
    try {
      if (!this.clientId || !this.clientSecret) {
        return null;
      }
      
      // In a real implementation, you would retrieve the stored token
      // or exchange a code for a token if you have an auth flow
      
      // Since we don't have user authentication flow yet,
      // return null to indicate we don't have a token
      return null;
      
      // When implementing OAuth, you would:
      // 1. Store the tokens securely (similar to SpotifyTokenStorageService)
      // 2. Implement refresh token mechanism
      // 3. Return the access token here
    } catch (error) {
      this.logger.error(`Error retrieving Discord token: ${error.message}`);
      return null;
    }
  }
}
