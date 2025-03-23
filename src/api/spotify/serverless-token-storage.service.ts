import { Injectable, Logger } from '@nestjs/common';

interface SpotifyTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  expires_at?: number;
}

@Injectable()
export class ServerlessTokenStorageService {
  private readonly logger = new Logger(ServerlessTokenStorageService.name);
  private static readonly VERCEL_ENV_TOKEN_KEY = 'SPOTIFY_TOKEN_DATA';

  constructor() {
    this.logger.log('ServerlessTokenStorageService initialized for Vercel environment');
  }

  async storeTokens(tokens: SpotifyTokens): Promise<void> {
    try {
      // Add expiration timestamp
      const tokensWithExpiry = {
        ...tokens,
        expires_at: Date.now() + (tokens.expires_in * 1000),
      };

      // Store tokens in environment variable
      process.env[ServerlessTokenStorageService.VERCEL_ENV_TOKEN_KEY] = JSON.stringify(tokensWithExpiry);
      
      this.logger.log('Spotify tokens stored successfully in environment variable');
    } catch (error) {
      this.logger.error(`Error storing Spotify tokens: ${error.message}`);
      throw error;
    }
  }

  getTokens(): SpotifyTokens | null {
    try {
      const tokenData = process.env[ServerlessTokenStorageService.VERCEL_ENV_TOKEN_KEY];
      if (!tokenData) {
        return null;
      }
      
      return JSON.parse(tokenData);
    } catch (error) {
      this.logger.error(`Error reading Spotify tokens: ${error.message}`);
      return null;
    }
  }

  async updateTokens(tokens: Partial<SpotifyTokens>): Promise<void> {
    try {
      // Get existing tokens
      const existingTokens = this.getTokens();
      
      if (!existingTokens) {
        this.logger.warn('No existing tokens to update, storing as new tokens');
        if (tokens.access_token && tokens.expires_in) {
          await this.storeTokens(tokens as SpotifyTokens);
        } else {
          throw new Error('Incomplete token data for storing new tokens');
        }
        return;
      }
      
      // Merge existing tokens with new tokens
      const updatedTokens = {
        ...existingTokens,
        ...tokens,
        // Update expiration timestamp if expires_in is provided
        expires_at: tokens.expires_in
          ? Date.now() + (tokens.expires_in * 1000)
          : existingTokens.expires_at,
      };
      
      // Store updated tokens
      process.env[ServerlessTokenStorageService.VERCEL_ENV_TOKEN_KEY] = JSON.stringify(updatedTokens);
      
      this.logger.log('Spotify tokens updated successfully');
    } catch (error) {
      this.logger.error(`Error updating Spotify tokens: ${error.message}`);
      throw error;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      delete process.env[ServerlessTokenStorageService.VERCEL_ENV_TOKEN_KEY];
      this.logger.log('Spotify tokens cleared successfully');
    } catch (error) {
      this.logger.error(`Error clearing Spotify tokens: ${error.message}`);
      throw error;
    }
  }
  
  async isAuthenticated(): Promise<boolean> {
    try {
      const tokens = this.getTokens();
      
      if (!tokens || !tokens.access_token) {
        return false;
      }
      
      // Check if token is expired
      if (tokens.expires_at && Date.now() > tokens.expires_at) {
        // Token is expired, but we might be able to refresh it
        return !!tokens.refresh_token;
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Error checking authentication status: ${error.message}`);
      return false;
    }
  }
}
