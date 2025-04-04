import { Module } from '@nestjs/common';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';
import { DiscordAuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { StatusModule } from '../status/status.module';

@Module({
  imports: [HttpModule, StatusModule],
  controllers: [DiscordController, DiscordAuthController],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
