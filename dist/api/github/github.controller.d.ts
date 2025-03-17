import { GithubService } from './github.service';
export declare class GithubController {
    private readonly githubService;
    constructor(githubService: GithubService);
    getUserProfile(username: string): Promise<any>;
    getUserActivity(username: string, limit?: number): Promise<any>;
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
}
