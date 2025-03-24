import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { StatusService } from '../status/status.service';

// Import Activity interface from StatusService
interface Activity {
  type: string;
  name: string;
  details?: string;
  state?: string;
  timestamps?: {
    start: number;
  };
}

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly statusService: StatusService,
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
      // Get status directly from StatusService
      const currentStatus = this.statusService.getCurrentStatus();
      
      return {
        status: 'online',
        statusText: currentStatus.status,
        timestamp: currentStatus.timestamp,
      };
    } catch (error) {
      this.logger.error(`Error getting Discord presence: ${error.message}`);
      throw error;
    }
  }

  async getActivity(): Promise<Activity[]> {
    try {
      // Get activities directly from StatusService
      const activities = this.statusService.getCurrentActivities();
      
      if (!activities || activities.length === 0) {
        this.logger.warn('No activities available from StatusService');
        throw new Error('No activities available');
      }
      
      return activities;
    } catch (error) {
      this.logger.error(`Error getting Discord activity: ${error.message}`);
      throw error;
    }
  }
  
  private async getDiscordToken(): Promise<string | null> {
    try {
      if (!this.clientId || !this.clientSecret) {
        this.logger.error('Discord client ID or secret not configured');
        throw new Error('Discord client ID or secret not configured');
      }
      
      // Discord API requires OAuth2 with authorization code flow for user data
      // For this API endpoint, we'll use a direct API call approach
      
      // Try with client credentials
      try {
        const tokenResponse = await firstValueFrom(
          this.httpService.post('https://discord.com/api/v10/oauth2/token', 
            new URLSearchParams({
              client_id: this.clientId,
              client_secret: this.clientSecret,
              grant_type: 'client_credentials',
              scope: 'identify'
            }),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }
          )
        );
        
        if (tokenResponse.data && tokenResponse.data.access_token) {
          this.logger.log('Successfully obtained Discord token with client credentials');
          return tokenResponse.data.access_token;
        } else {
          this.logger.error('Discord token response did not contain access_token');
          throw new Error('Discord token response did not contain access_token');
        }
      } catch (tokenError) {
        this.logger.error(`Discord token request error: ${tokenError.message}`);
        throw tokenError;
      }
    } catch (error) {
      this.logger.error(`Error retrieving Discord token: ${error.message}`);
      throw error;
    }
  }
}
