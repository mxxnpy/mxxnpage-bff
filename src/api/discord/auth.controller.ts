import { Controller, Get, Query, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@ApiTags('discord-auth')
@Controller('discord/auth')
export class DiscordAuthController {
  private readonly logger = new Logger(DiscordAuthController.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.clientId = process.env.DISCORD_CLIENT_ID || this.configService.get<string>('DISCORD_CLIENT_ID') || '';
    this.clientSecret = process.env.DISCORD_CLIENT_SECRET || this.configService.get<string>('DISCORD_CLIENT_SECRET') || '';
    this.redirectUri = process.env.DISCORD_REDIRECT_URI || this.configService.get<string>('DISCORD_REDIRECT_URI') || 'https://mxxnpage-bff.vercel.app/backend/discord/auth/callback';
  }

  @Get('login')
  @ApiOperation({ summary: 'Start Discord OAuth flow' })
  async login(@Res() res: Response) {
    const scopes = ['identify', 'email'];
    const authUrl = 'https://discord.com/api/oauth2/authorize';
    
    const url = `${authUrl}?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes.join(' '))}`;
    
    return res.redirect(url);
  }

  @Get('callback')
  @ApiOperation({ summary: 'Handle Discord OAuth callback' })
  async callback(@Query('code') code: string, @Res() res: Response) {
    try {
      if (!code) {
        this.logger.error('No code provided in callback');
        return res.redirect('/backend/error?message=No+authorization+code+provided');
      }

      // Exchange code for token
      const response = await firstValueFrom(
        this.httpService.post('https://discord.com/api/oauth2/token', 
          new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUri,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        )
      );

      // For now, just redirect with success message
      return res.redirect('/backend/success?message=Discord+authentication+successful');
    } catch (error) {
      this.logger.error(`Error in Discord callback: ${error.message}`);
      return res.redirect('/backend/error?message=Authentication+failed');
    }
  }
}
