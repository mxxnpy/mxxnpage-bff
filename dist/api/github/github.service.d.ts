import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class GithubService {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly apiUrl;
    private readonly token;
    constructor(httpService: HttpService, configService: ConfigService);
    getUserProfile(username: string): Promise<any>;
    getUserActivity(username: string): Promise<any>;
    getUserContributions(username: string): Promise<{
        username: string;
        totalContributions: any;
        contributions: {
            date: any;
            count: any;
        }[];
        recentRepositories: any;
        commitActivity: any[];
    }>;
    private getHeaders;
}
