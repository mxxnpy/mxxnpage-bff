import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { StatusModule } from './api/status/status.module';
import { GithubModule } from './api/github/github.module';
import { SpotifyModule } from './api/spotify/spotify.module';
import { DiscordModule } from './api/discord/discord.module';
import { WeatherModule } from './api/weather/weather.module';
import { TokenRefreshService } from './api/spotify/token-refresh.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? ['.env'] : ['.env.local', '.env'],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    ScheduleModule.forRoot(),
    StatusModule,
    GithubModule,
    SpotifyModule,
    DiscordModule,
    WeatherModule,
  ],
  providers: [
    TokenRefreshService,
  ],
  exports: [
    TokenRefreshService,
  ],
})
export class AppModule {}
