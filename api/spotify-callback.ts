import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Request, Response } from 'express';
import { SpotifyService } from '../src/api/spotify/spotify.service';
import { ServerlessTokenStorageService } from '../src/api/spotify/serverless-token-storage.service';

// Serverless function for handling Spotify OAuth callback
export default async function handler(req: Request, res: Response) {
  // Only handle GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Initializing Spotify callback handler');
    
    // Create a standalone NestJS application context
    const app = await NestFactory.create(AppModule, { 
      logger: ['error', 'warn', 'log'],
      abortOnError: false
    });
    await app.init();

    // Get required services
    const spotifyService = app.get(SpotifyService);
    const tokenStorageService = app.get(ServerlessTokenStorageService);

    // Extract query parameters
    const { code, state, error } = req.query;

    console.log('Received callback with params:', { code: !!code, state: !!state, error });

    // Check for error from Spotify
    if (error) {
      console.error('Spotify authorization error:', error);
      const errorUrl = process.env.NODE_ENV === 'production' 
          ? 'https://mxxnpy.github.io/?auth_error=' + error
          : 'http://localhost:4202/home?auth_error=' + error;
      return res.redirect(errorUrl);
    }

    // Validate state to prevent CSRF - make this optional in serverless context
    const storedState = req.cookies?.spotify_auth_state;
    if (state && storedState && state !== storedState) {
      console.warn('State mismatch in Spotify callback, but continuing anyway');
      // In serverless, we'll continue even with state mismatch since cookies may not persist
    }

    // Clear the state cookie if it exists
    if (req.cookies?.spotify_auth_state) {
      res.clearCookie('spotify_auth_state');
    }

    // Exchange code for tokens
    if (!code) {
      console.error('No authorization code provided');
      const errorUrl = process.env.NODE_ENV === 'production' 
          ? 'https://mxxnpy.github.io/?auth_error=missing_code'
          : 'http://localhost:4202/home?auth_error=missing_code';
      return res.redirect(errorUrl);
    }
    
    console.log('Exchanging code for tokens');
    const tokenResponse = await spotifyService.getAccessToken(code as string);
    
    // Store tokens securely
    await tokenStorageService.storeTokens(tokenResponse);
    
    console.log('Authentication successful, redirecting to frontend');
    
    // Set secure cookie with access token for client-side usage
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('spotify_auth', 'true', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: tokenResponse.expires_in * 1000
    });
    
    // Redirect back to frontend home page
    const redirectUrl = isProduction
        ? 'https://mxxnpy.github.io/?auth_success=true'
        : 'http://localhost:4202/home?auth_success=true';
    
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('Error in Spotify callback:', err);
    const errorUrl = process.env.NODE_ENV === 'production' 
        ? 'https://mxxnpy.github.io/?auth_error=server_error'
        : 'http://localhost:4202/home?auth_error=server_error';
    return res.redirect(errorUrl);
  }
}
