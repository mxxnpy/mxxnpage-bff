import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { TokenStorageService } from './token-storage.service';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class TokenRefreshService implements OnModuleInit {
  private readonly logger = new Logger(TokenRefreshService.name);
  private isRefreshing = false;
  private lastRefreshTime = 0;
  private readonly REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

  constructor(
    private readonly spotifyService: SpotifyService,
    private readonly tokenStorageService: TokenStorageService,
  ) {}

  async onModuleInit() {
    // Initial token refresh attempt
    await this.attemptTokenRefresh();
  }

  @Interval(5 * 60 * 1000) // Check every 5 minutes
  async scheduledTokenRefresh() {
    await this.attemptTokenRefresh();
  }

  async attemptTokenRefresh(): Promise<void> {
    try {
      // Prevent concurrent refreshes
      if (this.isRefreshing) {
        return;
      }

      // Check if enough time has passed since last refresh
      const now = Date.now();
      if (now - this.lastRefreshTime < this.REFRESH_INTERVAL) {
        return;
      }

      this.isRefreshing = true;

      const tokens = this.tokenStorageService.getTokens();
      if (!tokens || !tokens.refresh_token) {
        this.logger.debug('No refresh token available for automatic refresh');
        this.isRefreshing = false;
        return;
      }

      // Check if token is expired or will expire soon (within 10 minutes)
      const tokenExpiresAt = tokens.expires_at || 0;
      const expiresInMs = tokenExpiresAt - now;
      
      if (expiresInMs > 10 * 60 * 1000) {
        this.logger.debug('Token still valid, no need to refresh yet');
        this.isRefreshing = false;
        return;
      }

      this.logger.log('Automatically refreshing Spotify token');
      const refreshedTokens = await this.spotifyService.refreshAccessToken(tokens.refresh_token);
      await this.tokenStorageService.updateTokens(refreshedTokens);
      
      this.lastRefreshTime = now;
      this.logger.log('Spotify token refreshed successfully');
    } catch (error) {
      this.logger.error(`Error during automatic token refresh: ${error.message}`);
    } finally {
      this.isRefreshing = false;
    }
  }
}
