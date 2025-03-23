import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { TokenStorageService } from './token-storage.service';
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

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly tokenStorageService: TokenStorageService,
  ) {
    try {
      this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
      this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
      this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'https://mxxnpage-bff.vercel.app/backend/spotify/auth/callback';
      
      if (this.configService) {
        const configClientId = this.configService.get<string>('SPOTIFY_CLIENT_ID');
        const configClientSecret = this.configService.get<string>('SPOTIFY_CLIENT_SECRET');
        const configRedirectUri = this.configService.get<string>('SPOTIFY_REDIRECT_URI');
        
        if (configClientId) this.clientId = configClientId;
        if (configClientSecret) this.clientSecret = configClientSecret;
        if (configRedirectUri) this.redirectUri = configRedirectUri;
      }
      
      if (!this.clientId || !this.clientSecret) {
        console.warn('Spotify credentials missing. Some Spotify API features may not work correctly.');
      }
    } catch (error) {
      console.error(`Error initializing SpotifyService: ${error.message}`);
      this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
      this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
      this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'https://mxxnpage-bff.vercel.app/backend/spotify/auth/callback';
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

  async getCurrentTrack(): Promise<any> {
    return this.makeApiRequest('/me/player/currently-playing');
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
      // Get tokens from storage
      const tokens = this.tokenStorageService.getTokens();

      if (!tokens || !tokens.access_token) {
        throw new Error('No access token available');
      }

      // Check if token is expired and refresh if needed
      if (tokens.expires_at && Date.now() > tokens.expires_at) {
        if (!tokens.refresh_token) {
          throw new Error('No refresh token available');
        }

        const refreshedTokens = await this.refreshAccessToken(tokens.refresh_token);
        this.tokenStorageService.updateTokens(refreshedTokens);
      }

      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value.toString());
      });

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const url = `${this.apiBaseUrl}${endpoint}${queryString}`;

      // Make the API request
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }),
      );

      return response.data;
    } catch (error) {
      console.error(`Spotify API error: ${error.message}`);
      
      // If token is expired, try to refresh and retry once
      if (error.response?.status === 401) {
        try {
          const tokens = this.tokenStorageService.getTokens();
          if (tokens && tokens.refresh_token) {
            const refreshedTokens = await this.refreshAccessToken(tokens.refresh_token);
            this.tokenStorageService.updateTokens(refreshedTokens);
            
            // Retry the request with new token
            return this.makeApiRequest(endpoint, params);
          }
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
        }
      }
      
      // Return empty data structure based on endpoint
      if (endpoint.includes('/top/')) {
        return { items: [] };
      } else if (endpoint.includes('/playlists')) {
        return { items: [] };
      } else if (endpoint.includes('/recently-played')) {
        return { items: [] };
      } else if (endpoint.includes('/currently-playing')) {
        return null;
      } else {
        return {};
      }
    }
  }
}
