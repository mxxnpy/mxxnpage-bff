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
    private readonly tokenStorageService: TokenStorageService,
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
    const authorizeUrl = this.spotifyService.getAuthorizeUrl(scopes, state);
    
    // Store state for validation in callback
    res.cookie('spotify_auth_state', state, { httpOnly: true });
    
    // Redirect to Spotify authorization page - this will auto-connect with the developer's account
    // since the developer will be already logged in to Spotify in their browser
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
      
      // Store tokens securely
      this.tokenStorageService.storeTokens(tokenResponse);
      
      console.log('Authentication successful, redirecting to frontend');
      
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
      const tokens = this.tokenStorageService.getTokens();
      
      if (!tokens || !tokens.refresh_token) {
        res.status(401).json({ error: 'No refresh token available' });
        return;
      }
      
      const refreshedTokens = await this.spotifyService.refreshAccessToken(tokens.refresh_token);
      
      // Update stored tokens
      this.tokenStorageService.updateTokens(refreshedTokens);
      
      res.status(200).json({ success: true, expires_in: refreshedTokens.expires_in });
    } catch (err) {
      console.error('Error refreshing token:', err);
      res.status(500).json({ error: 'Failed to refresh token' });
    }
  }

  @Get('status')
  @ApiOperation({ summary: 'Check Spotify authentication status' })
  @ApiResponse({ status: 200, description: 'Returns authentication status' })
  getAuthStatus(@Res() res: Response): void {
    const tokens = this.tokenStorageService.getTokens();
    const isAuthenticated = !!tokens && !!tokens.access_token;
    
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
    this.tokenStorageService.clearTokens();
    res.status(200).json({ success: true });
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
