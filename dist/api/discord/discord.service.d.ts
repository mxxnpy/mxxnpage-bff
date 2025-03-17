import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class DiscordService {
    private readonly httpService;
    private readonly configService;
    constructor(httpService: HttpService, configService: ConfigService);
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
