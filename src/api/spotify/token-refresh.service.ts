import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { TokenStorageService } from './token-storage.service';
import { ServerlessTokenStorageService } from './serverless-token-storage.service';
import { FileTokenStorageService } from './file-token-storage.service';
import { Interval } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TokenRefreshService implements OnModuleInit {
  private readonly logger = new Logger(TokenRefreshService.name);
  private isRefreshing = false;
  private lastRefreshTime = 0;
  private readonly REFRESH_INTERVAL = 3600 * 1000; // 1 hour (3600 seconds)
  private readonly isServerless: boolean;

  constructor(
    private readonly spotifyService: SpotifyService,
    private readonly tokenStorageService?: TokenStorageService,
    private readonly serverlessTokenStorageService?: ServerlessTokenStorageService,
    private readonly fileTokenStorageService?: FileTokenStorageService,
  ) {
    // Determine if we're running in a serverless environment (Vercel only, not AWS)
    this.isServerless = process.env.VERCEL === '1';
    this.logger.log(`TokenRefreshService initialized in ${this.isServerless ? 'serverless' : 'standard'} mode`);
  }

  async onModuleInit() {
    this.logger.log('TokenRefreshService initializing...');
    
    // First try to generate an initial token from the existing spotify-tokens.json file
    const tokenGenerated = await this.generateInitialToken();
    
    if (tokenGenerated) {
      this.logger.log('Initial token generated successfully, now attempting refresh');
    } else {
      this.logger.warn('Could not generate initial token, attempting regular token refresh');
    }
    
    // Attempt token refresh regardless of whether initial token was generated
    await this.attemptTokenRefresh();
  }

  @Interval(60 * 1000) // Check every minute
  async scheduledTokenRefresh() {
    this.logger.log('Running scheduled token refresh check');
    await this.attemptTokenRefresh();
  }
  
  // Manual method to generate a token using existing spotify-tokens.json file
  async generateInitialToken(): Promise<boolean> {
    try {
      const tokenFilePath = path.resolve(process.cwd(), 'spotify-tokens.json');
      
      if (fs.existsSync(tokenFilePath)) {
        this.logger.log('Found existing spotify-tokens.json file, using it as initial token');
        const fileContent = fs.readFileSync(tokenFilePath, 'utf8');
        const tokens = JSON.parse(fileContent);
        
        // Update expiration time to ensure token is refreshed soon
        const updatedTokens = {
          ...tokens,
          expires_at: Date.now() + (60 * 1000) // Set to expire in 1 minute to force refresh
        };
        
        // Write back the updated tokens
        fs.writeFileSync(tokenFilePath, JSON.stringify(updatedTokens, null, 2));
        
        this.logger.log('Updated existing token file with new expiration time to force refresh');
        return true;
      } else {
        this.logger.warn('No spotify-tokens.json file found, cannot generate initial token');
        return false;
      }
    } catch (error) {
      this.logger.error(`Error generating initial token: ${error.message}`);
      return false;
    }
  }

  async attemptTokenRefresh(): Promise<void> {
    try {
      // Prevent concurrent refreshes
      if (this.isRefreshing) {
        return;
      }

      this.isRefreshing = true;
      const now = Date.now();
      
      // Get tokens from the appropriate storage service
      let tokens = null;
      
      // First try to use file-based token storage (preferred method)
      if (this.fileTokenStorageService) {
        tokens = await this.fileTokenStorageService.getTokens();
        if (tokens) {
          this.logger.log('Using tokens from file storage service (spotify-tokens.json)');
        } else {
          this.logger.warn('No tokens found in file storage service');
        }
      }
      
      // If no tokens from file storage, try serverless or standard storage
      if (!tokens) {
        if (this.isServerless && this.serverlessTokenStorageService) {
          tokens = await this.serverlessTokenStorageService.getTokens();
          if (tokens) {
            this.logger.log('Using serverless token storage service');
          }
        } else if (this.tokenStorageService) {
          tokens = await this.tokenStorageService.getTokens();
          if (tokens) {
            this.logger.log('Using standard token storage service');
          }
        }
      }
      
      // Last resort: try environment variables
      if (!tokens) {
        this.logger.warn('No tokens found in any storage service, trying environment variables');
        const tokenData = process.env.SPOTIFY_TOKEN_DATA;
        if (tokenData) {
          try {
            tokens = JSON.parse(tokenData);
            this.logger.log('Using tokens from environment variable');
          } catch (parseError) {
            this.logger.error(`Failed to parse token data from environment: ${parseError.message}`);
          }
        }
      }
      
      // If no tokens exist or no refresh token is available, try to get a client credentials token
      if (!tokens || !tokens.refresh_token) {
        this.logger.log('No refresh token available, attempting to get client credentials token');
        try {
          const clientCredentialsToken = await this.spotifyService.getClientCredentialsToken();
          
          // Store the token in the appropriate storage service
          if (this.isServerless && this.serverlessTokenStorageService) {
            await this.serverlessTokenStorageService.storeTokens(clientCredentialsToken);
          } else if (this.tokenStorageService) {
            await this.tokenStorageService.storeTokens(clientCredentialsToken);
          } else {
            // Store directly in environment variable as fallback
            process.env.SPOTIFY_TOKEN_DATA = JSON.stringify({
              ...clientCredentialsToken,
              expires_at: Date.now() + (clientCredentialsToken.expires_in * 1000)
            });
          }
          
          this.lastRefreshTime = now;
          this.logger.log('Successfully obtained and stored client credentials token');
          this.isRefreshing = false;
          return;
        } catch (error) {
          this.logger.error(`Failed to get client credentials token: ${error.message}`);
          this.isRefreshing = false;
          return;
        }
      }

      if (!tokens || !tokens.refresh_token) {
        this.logger.debug('No refresh token available for automatic refresh');
        this.isRefreshing = false;
        return;
      }

      // Always refresh the token every hour regardless of expiration
      // This ensures we always have a fresh token with maximum validity
      const tokenExpiresAt = tokens.expires_at || 0;
      const expiresInMs = tokenExpiresAt - now;
      
      // Force refresh if token will expire within 30 minutes or if it's been more than 50 minutes since last refresh
      if (expiresInMs > 30 * 60 * 1000 && (now - this.lastRefreshTime) < 50 * 60 * 1000) {
        this.logger.debug('Token still valid, no need to refresh yet');
        this.isRefreshing = false;
        return;
      }

      this.logger.log('Automatically refreshing Spotify token');
      
      try {
        const refreshedTokens = await this.spotifyService.refreshAccessToken(tokens.refresh_token);
        
        // Update tokens in the file storage service first (preferred method)
        if (this.fileTokenStorageService) {
          await this.fileTokenStorageService.updateTokens(refreshedTokens);
          this.logger.log('Updated tokens in file storage service (spotify-tokens.json)');
        }
        
        // Also update in other storage services as backup
        if (this.isServerless && this.serverlessTokenStorageService) {
          await this.serverlessTokenStorageService.updateTokens(refreshedTokens);
          this.logger.log('Updated tokens in serverless storage service');
        } else if (this.tokenStorageService) {
          await this.tokenStorageService.updateTokens(refreshedTokens);
          this.logger.log('Updated tokens in standard storage service');
        } else if (!this.fileTokenStorageService) {
          // Only use environment variable if file storage is not available
          process.env.SPOTIFY_TOKEN_DATA = JSON.stringify({
            ...refreshedTokens,
            expires_at: Date.now() + (refreshedTokens.expires_in * 1000)
          });
          this.logger.log('Stored refreshed tokens directly in environment variable');
        }
        
        this.lastRefreshTime = now;
        this.logger.log('Spotify token refreshed successfully');
      } catch (refreshError) {
        this.logger.error(`Failed to refresh token: ${refreshError.message}`);
        
        // If refresh token is invalid, clear it to prevent continuous failed refresh attempts
        if (refreshError.message?.includes('invalid_grant')) {
          this.logger.warn('Invalid refresh token detected, clearing tokens');
          if (this.isServerless && this.serverlessTokenStorageService) {
            await this.serverlessTokenStorageService.clearTokens();
          } else if (this.tokenStorageService) {
            await this.tokenStorageService.clearTokens();
          } else {
            delete process.env.SPOTIFY_TOKEN_DATA;
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error during automatic token refresh: ${error.message}`);
    } finally {
      this.isRefreshing = false;
    }
  }
}
