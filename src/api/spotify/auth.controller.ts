import { Controller, Get, Req, Res, Query } from '@nestjs/common';
import { Response, Request } from 'express';
import { SpotifyService } from './spotify.service';
import { TokenStorageService } from './token-storage.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('spotify-auth')
@Controller('spotify/auth')
export class SpotifyAuthController {
  constructor(
    private readonly spotifyService: SpotifyService,
    private readonly tokenStorageService?: TokenStorageService,
  ) {}

  @Get('login')
  @ApiOperation({ summary: 'Initiate Spotify OAuth login flow with developer credentials' })
  @ApiResponse({ status: 302, description: 'Redirects to Spotify authorization page' })
  login(@Res() res: Response): void {
    // Use developer-specific scopes
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-read-currently-playing',
      'user-read-recently-played',
      'user-top-read',
      'playlist-read-private',
      'playlist-read-collaborative',
    ];

    const state = this.generateRandomString(16);
    
    // Store state for validation in callback
    res.cookie('spotify_auth_state', state, { httpOnly: true });
    
    // Use hardcoded client ID for testing if environment variables aren't available
    const clientId = process.env.SPOTIFY_CLIENT_ID || '1e6c0d00a7a34f1c9d0d043d2b8e6e0e';
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'https://mxxnpage-bff.vercel.app/backend/spotify/auth/simple-callback';
    
    // Build the authorization URL manually to avoid environment variable interpolation issues
    const authorizeUrl = 'https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + encodeURIComponent(clientId) +
      '&scope=' + encodeURIComponent(scopes.join(' ')) +
      '&redirect_uri=' + encodeURIComponent(redirectUri) +
      '&state=' + encodeURIComponent(state) +
      '&show_dialog=true';
    
    console.log('Redirecting to Spotify authorization with URL:', authorizeUrl);
    res.redirect(authorizeUrl);
  }

  @Get('callback')
  @ApiOperation({ summary: 'Handle Spotify OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend after processing callback' })
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Check for error from Spotify
      if (error) {
        console.error('Spotify authorization error:', error);
        const errorUrl = process.env.NODE_ENV === 'production' 
            ? 'https://mxxnpy.github.io/?auth_error=' + error
            : 'http://localhost:4202/home?auth_error=' + error;
        res.redirect(errorUrl);
        return;
      }

      // Validate state to prevent CSRF
      const storedState = req.cookies?.spotify_auth_state;
      if (!state || state !== storedState) {
        console.error('State mismatch in Spotify callback');
        const errorUrl = process.env.NODE_ENV === 'production' 
            ? 'https://mxxnpy.github.io/?auth_error=state_mismatch'
            : 'http://localhost:4202/home?auth_error=state_mismatch';
        res.redirect(errorUrl);
        return;
      }

      // Clear the state cookie
      res.clearCookie('spotify_auth_state');

      // Exchange code for tokens
      const tokenResponse = await this.spotifyService.getAccessToken(code);
      
      // Store tokens securely if tokenStorageService is available
      if (this.tokenStorageService) {
        await this.tokenStorageService.storeTokens(tokenResponse);
        console.log('Authentication successful, tokens stored in TokenStorageService');
      } else {
        // Fallback to environment variable storage
        process.env.SPOTIFY_TOKEN_DATA = JSON.stringify({
          ...tokenResponse,
          expires_at: Date.now() + (tokenResponse.expires_in * 1000)
        });
        console.log('Authentication successful, tokens stored in environment variable');
      }
      
      // Redirect back to frontend home page (not spotify page to avoid showing auth UI)
      const redirectUrl = process.env.NODE_ENV === 'production' 
          ? 'https://mxxnpy.github.io/?auth_success=true'
          : 'http://localhost:4202/home?auth_success=true';
      res.redirect(redirectUrl);
    } catch (err) {
      console.error('Error in Spotify callback:', err);
      const errorUrl = process.env.NODE_ENV === 'production' 
          ? 'https://mxxnpy.github.io/?auth_error=server_error'
          : 'http://localhost:4202/home?auth_error=server_error';
      res.redirect(errorUrl);
    }
  }

  @Get('refresh')
  @ApiOperation({ summary: 'Refresh Spotify access token' })
  @ApiResponse({ status: 200, description: 'Returns refreshed token information' })
  async refreshToken(@Res() res: Response): Promise<void> {
    try {
      // Get tokens from storage service or environment variable
      let tokens = null;
      if (this.tokenStorageService) {
        tokens = this.tokenStorageService.getTokens();
      } else {
        const tokenData = process.env.SPOTIFY_TOKEN_DATA;
        if (tokenData) {
          try {
            tokens = JSON.parse(tokenData);
          } catch (parseError) {
            console.error(`Failed to parse token data from environment: ${parseError.message}`);
          }
        }
      }
      
      if (!tokens || !tokens.refresh_token) {
        res.status(401).json({ error: 'No refresh token available' });
        return;
      }
      
      const refreshedTokens = await this.spotifyService.refreshAccessToken(tokens.refresh_token);
      
      // Set maximum expiration time (Spotify's maximum is 1 hour = 3600 seconds)
      refreshedTokens.expires_in = 3600;
      
      // Update stored tokens
      if (this.tokenStorageService) {
        await this.tokenStorageService.updateTokens(refreshedTokens);
      } else {
        // Fallback to environment variable storage
        process.env.SPOTIFY_TOKEN_DATA = JSON.stringify({
          ...refreshedTokens,
          expires_at: Date.now() + (refreshedTokens.expires_in * 1000)
        });
      }
      
      res.status(200).json({ 
        success: true, 
        expires_in: refreshedTokens.expires_in,
        expires_at: Date.now() + (refreshedTokens.expires_in * 1000),
        token_type: refreshedTokens.token_type,
        scope: refreshedTokens.scope
      });
    } catch (err) {
      console.error('Error refreshing token:', err);
      res.status(500).json({ error: 'Failed to refresh token', message: err.message });
    }
  }

  @Get('status')
  @ApiOperation({ summary: 'Check Spotify authentication status' })
  @ApiResponse({ status: 200, description: 'Returns authentication status' })
  getAuthStatus(@Res() res: Response): void {
    let tokens = null;
    let isAuthenticated = false;
    
    if (this.tokenStorageService) {
      tokens = this.tokenStorageService.getTokens();
      isAuthenticated = !!tokens && !!tokens.access_token;
    } else {
      const tokenData = process.env.SPOTIFY_TOKEN_DATA;
      if (tokenData) {
        try {
          tokens = JSON.parse(tokenData);
          isAuthenticated = !!tokens && !!tokens.access_token;
        } catch (parseError) {
          console.error(`Failed to parse token data from environment: ${parseError.message}`);
        }
      }
    }
    
    res.status(200).json({ 
      authenticated: isAuthenticated,
      expires_in: tokens?.expires_in || 0,
      expires_at: tokens?.expires_at || 0
    });
  }

  @Get('logout')
  @ApiOperation({ summary: 'Log out from Spotify' })
  @ApiResponse({ status: 200, description: 'Clears Spotify authentication tokens' })
  logout(@Res() res: Response): void {
    if (this.tokenStorageService) {
      this.tokenStorageService.clearTokens();
    } else {
      delete process.env.SPOTIFY_TOKEN_DATA;
    }
    res.status(200).json({ success: true });
  }
  
  @Get('generate-token')
  @ApiOperation({ summary: 'Generate a new Spotify token with maximum expiration time' })
  @ApiResponse({ status: 200, description: 'Returns newly generated token information' })
  async generateToken(@Res() res: Response): Promise<void> {
    try {
      // Use provided Spotify account credentials
      const clientId = process.env.SPOTIFY_CLIENT_ID || '1e6c0d00a7a34f1c9d0d043d2b8e6e0e';
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
      
      if (!clientId || !clientSecret) {
        res.status(400).json({
          error: 'Missing Spotify credentials',
          message: 'SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in environment variables'
        });
        return;
      }
      
      // Get token directly using client credentials flow (no user authentication required)
      const tokenResponse = await this.spotifyService.getClientCredentialsToken();
      
      // Set maximum expiration time
      tokenResponse.expires_in = 3600; // 1 hour (maximum allowed by Spotify)
      
      // Add user account info for reference (not used in authentication)
      tokenResponse.user_email = 'ayu.leandro@icloud.com'; // Store reference to account
      
      // Store the token
      if (this.tokenStorageService) {
        await this.tokenStorageService.storeTokens(tokenResponse);
      } else {
        // Fallback to environment variable storage
        process.env.SPOTIFY_TOKEN_DATA = JSON.stringify({
          ...tokenResponse,
          expires_at: Date.now() + (tokenResponse.expires_in * 1000)
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'New token generated successfully with auto-refresh enabled',
        expires_in: tokenResponse.expires_in,
        expires_at: Date.now() + (tokenResponse.expires_in * 1000),
        token_type: tokenResponse.token_type,
        scope: tokenResponse.scope || 'client_credentials',
        auto_refresh: true,
        refresh_interval: '3600 seconds (1 hour)'
      });
    } catch (err) {
      console.error('Error generating token:', err);
      res.status(500).json({ error: 'Failed to generate token', message: err.message });
    }
  }

  private generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    
    return text;
  }
}
