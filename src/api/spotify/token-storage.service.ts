import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { ServerlessTokenStorageService } from './serverless-token-storage.service';

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
  private readonly logger = new Logger(TokenStorageService.name);
  private readonly tokenFilePath: string;
  private memoryTokens: SpotifyTokens | null = null;
  private isServerless: boolean;
  private serverlessStorage: ServerlessTokenStorageService;
  
  constructor() {
    // Determine if we're running in a serverless environment
    this.isServerless = process.env.VERCEL === '1' || process.env.NETLIFY === 'true';
    
    // Store tokens in a file within the project directory (for non-serverless environments)
    this.tokenFilePath = path.join(process.cwd(), 'spotify-tokens.json');
    
    // Initialize serverless storage for Vercel environments
    if (this.isServerless) {
      this.serverlessStorage = new ServerlessTokenStorageService();
    }
    
    this.logger.log(`TokenStorageService initialized in ${this.isServerless ? 'serverless' : 'standard'} mode`);
  }
  
  async storeTokens(tokens: SpotifyTokens): Promise<void> {
    try {
      // Add expiration timestamp
      const tokensWithExpiry = {
        ...tokens,
        expires_at: Date.now() + (tokens.expires_in * 1000),
      };
      
      // Always store in memory
      this.memoryTokens = tokensWithExpiry;
      
      // In serverless environments, use serverless storage
      if (this.isServerless) {
        await this.serverlessStorage.storeTokens(tokensWithExpiry);
      } else {
        // In non-serverless environments, store to file
        try {
          await fs.writeFile(
            this.tokenFilePath,
            JSON.stringify(tokensWithExpiry, null, 2),
            'utf8',
          );
        } catch (fileError) {
          this.logger.warn(`Could not write tokens to file: ${fileError.message}`);
        }
      }
      
      this.logger.log('Spotify tokens stored successfully');
    } catch (error) {
      this.logger.error(`Error storing Spotify tokens: ${error.message}`);
      throw error;
    }
  }
  
  getTokens(): SpotifyTokens | null {
    try {
      // First check memory
      if (this.memoryTokens) {
        return this.memoryTokens;
      }
      
      // In serverless environments, try to get from serverless storage
      if (this.isServerless) {
        const tokens = this.serverlessStorage.getTokens();
        if (tokens) {
          this.memoryTokens = tokens; // Cache in memory
          return tokens;
        }
        return null;
      }
      
      // In non-serverless environments, try to read from file
      try {
        const data = require('fs').readFileSync(this.tokenFilePath, 'utf8');
        const tokens = JSON.parse(data);
        
        // Cache in memory for future use
        this.memoryTokens = tokens;
        
        return tokens;
      } catch (fileError) {
        this.logger.warn(`Could not read tokens from file: ${fileError.message}`);
        return null;
      }
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
      
      // Update memory storage
      this.memoryTokens = updatedTokens;
      
      // In serverless environments, use serverless storage
      if (this.isServerless) {
        await this.serverlessStorage.updateTokens(updatedTokens);
      } else {
        // In non-serverless environments, also update file
        try {
          await fs.writeFile(
            this.tokenFilePath,
            JSON.stringify(updatedTokens, null, 2),
            'utf8',
          );
        } catch (fileError) {
          this.logger.warn(`Could not write updated tokens to file: ${fileError.message}`);
        }
      }
      
      this.logger.log('Spotify tokens updated successfully');
    } catch (error) {
      this.logger.error(`Error updating Spotify tokens: ${error.message}`);
      throw error;
    }
  }
  
  async clearTokens(): Promise<void> {
    try {
      // Clear memory storage
      this.memoryTokens = null;
      
      // In serverless environments, use serverless storage
      if (this.isServerless) {
        await this.serverlessStorage.clearTokens();
      } else {
        // In non-serverless environments, also clear file
        try {
          // Check if file exists
          try {
            await fs.access(this.tokenFilePath);
            // Delete the token file
            await fs.unlink(this.tokenFilePath);
          } catch {
            // File doesn't exist, nothing to clear
          }
        } catch (fileError) {
          this.logger.warn(`Could not clear tokens file: ${fileError.message}`);
        }
      }
      
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
