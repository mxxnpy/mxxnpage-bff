import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { TokenStorageService } from './token-storage.service';
import { FileTokenStorageService } from './file-token-storage.service';
import { firstValueFrom } from 'rxjs';
import { URLSearchParams } from 'url';

@Injectable()
export class SpotifyService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly apiBaseUrl = 'https://api.spotify.com/v1';
  private readonly authUrl = 'https://accounts.spotify.com/authorize';
  private readonly tokenUrl = 'https://accounts.spotify.com/api/token';

  private readonly logger = new Logger(SpotifyService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly tokenStorageService?: TokenStorageService,
    private readonly fileTokenStorageService?: FileTokenStorageService,
  ) {
    try {
      // Hardcoded client ID for testing - replace with your actual client ID in production
      this.clientId = process.env.SPOTIFY_CLIENT_ID || '1e6c0d00a7a34f1c9d0d043d2b8e6e0e';
      this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
      this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'https://mxxnpage-bff.vercel.app/backend/spotify/auth/simple-callback';
      
      if (this.configService) {
        const configClientId = this.configService.get<string>('SPOTIFY_CLIENT_ID');
        const configClientSecret = this.configService.get<string>('SPOTIFY_CLIENT_SECRET');
        const configRedirectUri = this.configService.get<string>('SPOTIFY_REDIRECT_URI');
        
        if (configClientId) this.clientId = configClientId;
        if (configClientSecret) this.clientSecret = configClientSecret;
        if (configRedirectUri) this.redirectUri = configRedirectUri;
      }
      
      console.log('SpotifyService initialized with:', {
        clientIdSet: !!this.clientId,
        clientSecretSet: !!this.clientSecret,
        redirectUri: this.redirectUri
      });
      
      if (!this.clientId || !this.clientSecret) {
        console.warn('Spotify credentials missing. Some Spotify API features may not work correctly.');
      }
    } catch (error) {
      console.error(`Error initializing SpotifyService: ${error.message}`);
      this.clientId = process.env.SPOTIFY_CLIENT_ID || '1e6c0d00a7a34f1c9d0d043d2b8e6e0e';
      this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
      this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'https://mxxnpage-bff.vercel.app/backend/spotify/auth/simple-callback';
    }
  }

  getAuthorizeUrl(scopes: string[], state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
      state,
      show_dialog: 'true',
    });

    return `${this.authUrl}?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<any> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
    });

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${this.clientId}:${this.clientSecret}`,
        ).toString('base64')}`,
      },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.tokenUrl, params.toString(), config),
      );
      return response.data;
    } catch (error) {
      console.error('Error getting access token:', error.response?.data || error.message);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<any> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${this.clientId}:${this.clientSecret}`,
        ).toString('base64')}`,
      },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.tokenUrl, params.toString(), config),
      );
      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error.response?.data || error.message);
      throw error;
    }
  }
  
  async getClientCredentialsToken(): Promise<any> {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
    });

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${this.clientId}:${this.clientSecret}`,
        ).toString('base64')}`,
      },
    };

    try {
      console.log('Requesting client credentials token with client ID:', this.clientId);
      const response = await firstValueFrom(
        this.httpService.post(this.tokenUrl, params.toString(), config),
      );
      
      // Add expires_at field for easier expiration checking
      const data = response.data;
      data.expires_at = Date.now() + (data.expires_in * 1000);
      
      return data;
    } catch (error) {
      console.error('Error getting client credentials token:', error.response?.data || error.message);
      throw error;
    }
  }

  async getCurrentTrack(): Promise<any> {
    try {
      const result = await this.makeApiRequest('/me/player/currently-playing');
      
      // If result is null or empty, provide a structured response
      if (!result) {
        return { 
          is_playing: false,
          item: null,
          status: "No track currently playing or authentication required"
        };
      }
      
      return result;
    } catch (error) {
      console.error(`Error fetching current track: ${error.message}`);
      // Return a structured empty response instead of throwing
      return { 
        is_playing: false,
        item: null,
        error: "Authentication required. Please authenticate with Spotify first."
      };
    }
  }

  async getRecentlyPlayed(limit: number = 20): Promise<any> {
    return this.makeApiRequest('/me/player/recently-played', { limit });
  }

  async getTopItems(
    type: 'artists' | 'tracks',
    timeRange: string = 'medium_term',
    limit: number = 10,
  ): Promise<any> {
    return this.makeApiRequest(`/me/top/${type}`, {
      time_range: timeRange,
      limit,
    });
  }

  async getPlaylists(limit: number = 20, offset: number = 0): Promise<any> {
    return this.makeApiRequest('/me/playlists', { limit, offset });
  }

  async getPlaylistTracks(
    playlistId: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<any> {
    return this.makeApiRequest(`/playlists/${playlistId}/tracks`, {
      limit,
      offset,
    });
  }

  async getUserProfile(): Promise<any> {
    return this.makeApiRequest('/me');
  }

  private async makeApiRequest(
    endpoint: string,
    params: Record<string, any> = {},
  ): Promise<any> {
    try {
      // Get tokens from storage service or environment variable
      let tokens = null;
      
      // First try to use file-based token storage (preferred method)
      if (this.fileTokenStorageService) {
        tokens = await this.fileTokenStorageService.getTokens();
        if (tokens) {
          this.logger.debug(`Using tokens from file storage service for endpoint: ${endpoint}`);
        }
      }
      
      // If no tokens from file storage, try standard storage
      if (!tokens && this.tokenStorageService) {
        tokens = this.tokenStorageService.getTokens();
        if (tokens) {
          this.logger.debug(`Using tokens from standard storage service for endpoint: ${endpoint}`);
        }
      }
      
      // Last resort: try environment variables
      if (!tokens) {
        const tokenData = process.env.SPOTIFY_TOKEN_DATA;
        if (tokenData) {
          try {
            tokens = JSON.parse(tokenData);
            this.logger.debug(`Using tokens from environment variable for endpoint: ${endpoint}`);
          } catch (parseError) {
            this.logger.error(`Failed to parse token data from environment: ${parseError.message}`);
          }
        }
      }

      if (!tokens || !tokens.access_token) {
        console.warn(`No access token available for endpoint: ${endpoint}`);
        return this.getEmptyResponseForEndpoint(endpoint);
      }

      // Check if token is expired and refresh if needed
      if (tokens.expires_at && Date.now() > tokens.expires_at) {
        if (!tokens.refresh_token) {
          this.logger.warn('Token expired and no refresh token available');
          return this.getEmptyResponseForEndpoint(endpoint);
        }

        try {
          this.logger.log('Token expired, refreshing before request');
          const refreshedTokens = await this.refreshAccessToken(tokens.refresh_token);
          
          // Update tokens in file storage first (preferred method)
          if (this.fileTokenStorageService) {
            await this.fileTokenStorageService.updateTokens(refreshedTokens);
            this.logger.log('Updated tokens in file storage after refresh');
          } else if (this.tokenStorageService) {
            await this.tokenStorageService.updateTokens(refreshedTokens);
            this.logger.log('Updated tokens in standard storage after refresh');
          } else {
            // Fallback to environment variable
            process.env.SPOTIFY_TOKEN_DATA = JSON.stringify({
              ...refreshedTokens,
              expires_at: Date.now() + (refreshedTokens.expires_in * 1000)
            });
            this.logger.log('Updated tokens in environment variable after refresh');
          }
          
          // Update tokens reference with refreshed tokens
          tokens.access_token = refreshedTokens.access_token;
          tokens.expires_at = Date.now() + (refreshedTokens.expires_in * 1000);
        } catch (refreshError) {
          this.logger.error(`Error pre-emptively refreshing token: ${refreshError.message}`);
          // Continue with existing token and let the request potentially fail
        }
      }

      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value.toString());
      });

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const url = `${this.apiBaseUrl}${endpoint}${queryString}`;

      // Make the API request
      try {
        const response = await firstValueFrom(
          this.httpService.get(url, {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          }),
        );
        
        return response.data;
      } catch (apiError) {
        // If token is expired, try to refresh and retry once
        if (apiError.response?.status === 401 && tokens.refresh_token) {
          try {
            this.logger.log('Token rejected (401), attempting refresh and retry');
            const refreshedTokens = await this.refreshAccessToken(tokens.refresh_token);
            
            // Update tokens in file storage first (preferred method)
            if (this.fileTokenStorageService) {
              await this.fileTokenStorageService.updateTokens(refreshedTokens);
              this.logger.log('Updated tokens in file storage after 401 error');
            } else if (this.tokenStorageService) {
              await this.tokenStorageService.updateTokens(refreshedTokens);
              this.logger.log('Updated tokens in standard storage after 401 error');
            } else {
              // Fallback to environment variable
              process.env.SPOTIFY_TOKEN_DATA = JSON.stringify({
                ...refreshedTokens,
                expires_at: Date.now() + (refreshedTokens.expires_in * 1000)
              });
              this.logger.log('Updated tokens in environment variable after 401 error');
            }
            
            // Retry the request with new token
            const retryResponse = await firstValueFrom(
              this.httpService.get(url, {
                headers: {
                  Authorization: `Bearer ${refreshedTokens.access_token}`,
                },
              }),
            );
            
            return retryResponse.data;
          } catch (refreshError) {
            this.logger.error(`Error refreshing token: ${refreshError.message}`);
            return this.getEmptyResponseForEndpoint(endpoint);
          }
        }
        
        console.error(`Spotify API error for ${endpoint}: ${apiError.message}`);
        return this.getEmptyResponseForEndpoint(endpoint);
      }
    } catch (error) {
      console.error(`Unexpected error in makeApiRequest: ${error.message}`);
      return this.getEmptyResponseForEndpoint(endpoint);
    }
  }
  
  private getEmptyResponseForEndpoint(endpoint: string): any {
    // Return appropriate empty data structure based on endpoint
    if (endpoint.includes('/top/')) {
      return { items: [] };
    } else if (endpoint.includes('/playlists')) {
      return { items: [] };
    } else if (endpoint.includes('/recently-played')) {
      return { items: [] };
    } else if (endpoint.includes('/currently-playing')) {
      return { 
        is_playing: false,
        item: null,
        error: "Authentication required. Please authenticate with Spotify first."
      };
    } else if (endpoint === '/me') {
      return { 
        id: null,
        display_name: null,
        error: "Authentication required. Please authenticate with Spotify first."
      };
    } else {
      return {};
    }
  }
}
