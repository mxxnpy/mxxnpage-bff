import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StatusModule } from './api/status/status.module';
import { GithubModule } from './api/github/github.module';
import { SpotifyModule } from './api/spotify/spotify.module';
import { DiscordModule } from './api/discord/discord.module';
import { WeatherModule } from './api/weather/weather.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? ['.env'] : ['.env.local', '.env'],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    StatusModule,
    GithubModule,
    SpotifyModule,
    DiscordModule,
    WeatherModule,
  ],
})
export class AppModule {}