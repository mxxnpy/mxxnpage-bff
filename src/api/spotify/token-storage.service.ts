import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

interface SpotifyTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  expires_at?: number;
}

@Injectable()
export class TokenStorageService {
  private readonly tokenFilePath: string;
  
  constructor() {
    // Store tokens in a file within the project directory
    this.tokenFilePath = path.join(process.cwd(), 'spotify-tokens.json');
  }
  
  async storeTokens(tokens: SpotifyTokens): Promise<void> {
    try {
      // Add expiration timestamp
      const tokensWithExpiry = {
        ...tokens,
        expires_at: Date.now() + (tokens.expires_in * 1000),
      };
      
      // Write tokens to file
      await fs.writeFile(
        this.tokenFilePath,
        JSON.stringify(tokensWithExpiry, null, 2),
        'utf8',
      );
      
      console.log('Spotify tokens stored successfully');
    } catch (error) {
      console.error('Error storing Spotify tokens:', error);
      throw error;
    }
  }
  
  getTokens(): SpotifyTokens | null {
    try {
      // Read tokens from file synchronously
      const data = require('fs').readFileSync(this.tokenFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading Spotify tokens:', error.message);
      return null;
    }
  }
  
  async updateTokens(tokens: Partial<SpotifyTokens>): Promise<void> {
    try {
      // Get existing tokens
      const existingTokens = this.getTokens();
      
      if (!existingTokens) {
        throw new Error('No existing tokens to update');
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
      
      // Write updated tokens to file
      await fs.writeFile(
        this.tokenFilePath,
        JSON.stringify(updatedTokens, null, 2),
        'utf8',
      );
      
      console.log('Spotify tokens updated successfully');
    } catch (error) {
      console.error('Error updating Spotify tokens:', error);
      throw error;
    }
  }
  
  async clearTokens(): Promise<void> {
    try {
      // Check if file exists
      try {
        await fs.access(this.tokenFilePath);
      } catch {
        // File doesn't exist, nothing to clear
        return;
      }
      
      // Delete the token file
      await fs.unlink(this.tokenFilePath);
      console.log('Spotify tokens cleared successfully');
    } catch (error) {
      console.error('Error clearing Spotify tokens:', error);
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
    } catch {
      return false;
    }
  }
}
