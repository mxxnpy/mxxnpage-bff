import { DiscordService } from './discord.service';
export declare class DiscordController {
    private readonly discordService;
    constructor(discordService: DiscordService);
    getPresence(): Promise<{
        status: string;
        statusText: string;
        timestamp: string;
    }>;
    getActivity(): Promise<{
        type: string;
        name: string;
        details: string;
        state: string;
        timestamps: {
            start: number;
        };
    }[]>;
}
