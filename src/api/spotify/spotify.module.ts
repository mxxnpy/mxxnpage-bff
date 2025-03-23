import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SpotifyController } from './spotify.controller';
import { SpotifyService } from './spotify.service';
import { SpotifyAuthController } from './auth.controller';
import { TokenStorageService } from './token-storage.service';
import { FileTokenStorageService } from './file-token-storage.service';
import { TokenRefreshService } from './token-refresh.service';
import { ServerlessTokenStorageService } from './serverless-token-storage.service';
import { SpotifyDeveloperActivityController } from './developer-activity.controller';

@Module({
  imports: [HttpModule],
  controllers: [SpotifyController, SpotifyAuthController, SpotifyDeveloperActivityController],
  providers: [SpotifyService, TokenStorageService, FileTokenStorageService, TokenRefreshService, ServerlessTokenStorageService],
  exports: [SpotifyService, TokenStorageService, FileTokenStorageService, TokenRefreshService, ServerlessTokenStorageService],
})
export class SpotifyModule {}
