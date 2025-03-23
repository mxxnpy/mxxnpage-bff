import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileTokenStorageService {
  private readonly logger = new Logger(FileTokenStorageService.name);
  private readonly tokenFilePath: string;

  constructor() {
    // Use the root directory of the project for the token file
    this.tokenFilePath = path.resolve(process.cwd(), 'spotify-tokens.json');
    this.logger.log(`Using token file at: ${this.tokenFilePath}`);
  }

  async getTokens(): Promise<any> {
    try {
      if (!fs.existsSync(this.tokenFilePath)) {
        this.logger.warn('Token file does not exist');
        return null;
      }

      const fileContent = fs.readFileSync(this.tokenFilePath, 'utf8');
      const tokens = JSON.parse(fileContent);
      
      this.logger.log('Successfully retrieved tokens from file');
      return tokens;
    } catch (error) {
      this.logger.error(`Error reading token file: ${error.message}`);
      return null;
    }
  }

  async storeTokens(tokens: any): Promise<void> {
    try {
      // Add expires_at field if not present
      if (tokens.expires_in && !tokens.expires_at) {
        tokens.expires_at = Date.now() + (tokens.expires_in * 1000);
      }

      const fileContent = JSON.stringify(tokens, null, 2);
      fs.writeFileSync(this.tokenFilePath, fileContent);
      
      this.logger.log('Successfully stored tokens to file');
    } catch (error) {
      this.logger.error(`Error writing token file: ${error.message}`);
    }
  }

  async updateTokens(newTokens: any): Promise<void> {
    try {
      const currentTokens = await this.getTokens() || {};
      
      // Merge the new tokens with the existing ones
      const updatedTokens = {
        ...currentTokens,
        ...newTokens,
        // Always update the expires_at field
        expires_at: Date.now() + (newTokens.expires_in * 1000)
      };
      
      // Preserve the refresh_token if it's not in the new tokens
      if (!newTokens.refresh_token && currentTokens.refresh_token) {
        updatedTokens.refresh_token = currentTokens.refresh_token;
      }

      await this.storeTokens(updatedTokens);
      this.logger.log('Successfully updated tokens in file');
    } catch (error) {
      this.logger.error(`Error updating token file: ${error.message}`);
    }
  }

  async clearTokens(): Promise<void> {
    try {
      if (fs.existsSync(this.tokenFilePath)) {
        fs.unlinkSync(this.tokenFilePath);
        this.logger.log('Successfully cleared tokens file');
      }
    } catch (error) {
      this.logger.error(`Error clearing token file: ${error.message}`);
    }
  }
}
