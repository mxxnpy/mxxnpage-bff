import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);
  private readonly apiUrl: string;
  private readonly token: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('GITHUB_API_URL', 'https://api.github.com');
    this.token = this.configService.get<string>('GITHUB_TOKEN') || '';
    if (!this.token) {
      this.logger.warn('GITHUB_TOKEN is not set. GitHub API requests may be rate-limited.');
    }
  }

  async getUserProfile(username: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/users/${username}`, {
          headers: this.getHeaders(),
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Failed to fetch GitHub user profile: ${error.message}`);
            throw new Error(`Failed to fetch GitHub user profile: ${error.message}`);
          }),
        ),
      );
      return data;
    } catch (error) {
      this.logger.error(`Error fetching GitHub user profile: ${error.message}`);
      throw error;
    }
  }

  async getUserActivity(username: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/users/${username}/events`, {
          headers: this.getHeaders(),
          params: {
            per_page: 10,
          },
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Failed to fetch GitHub user activity: ${error.message}`);
            throw new Error(`Failed to fetch GitHub user activity: ${error.message}`);
          }),
        ),
      );
      return data;
    } catch (error) {
      this.logger.error(`Error fetching GitHub user activity: ${error.message}`);
      throw error;
    }
  }

  async getUserContributions(username: string) {
    try {
      // GitHub doesn't have a direct API for contributions graph
      // We'll use the user's events as a proxy for contributions
      const events = await this.getUserActivity(username);
      
      // Get user's repositories
      const { data: repos } = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/users/${username}/repos`, {
          headers: this.getHeaders(),
          params: {
            per_page: 5,
            sort: 'updated',
          },
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Failed to fetch GitHub user repos: ${error.message}`);
            throw new Error(`Failed to fetch GitHub user repos: ${error.message}`);
          }),
        ),
      );
      
      // Get commit activity for the user's top repositories
      const commitActivities = await Promise.all(
        repos.map(async (repo) => {
          try {
            const { data } = await firstValueFrom(
              this.httpService.get(`${this.apiUrl}/repos/${repo.full_name}/stats/commit_activity`, {
                headers: this.getHeaders(),
              }).pipe(
                catchError((error: AxiosError) => {
                  this.logger.error(`Failed to fetch commit activity for ${repo.full_name}: ${error.message}`);
                  return [];
                }),
              ),
            );
            return {
              repo: repo.name,
              activity: data,
            };
          } catch (error) {
            this.logger.error(`Error fetching commit activity for ${repo.full_name}: ${error.message}`);
            return {
              repo: repo.name,
              activity: [],
            };
          }
        }),
      );
      
      // Generate a contributions grid (similar to GitHub's contribution graph)
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      // Create an array of dates for the past year
      const dates = [];
      for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
      
      // Map events to dates to count contributions
      const contributionMap = new Map();
      
      // Initialize all dates with 0 contributions
      dates.forEach(date => {
        const dateString = date.toISOString().split('T')[0];
        contributionMap.set(dateString, 0);
      });
      
      // Count events as contributions
      events.forEach(event => {
        const eventDate = new Date(event.created_at);
        const dateString = eventDate.toISOString().split('T')[0];
        
        if (contributionMap.has(dateString)) {
          contributionMap.set(dateString, contributionMap.get(dateString) + 1);
        }
      });
      
      // Convert map to array of objects
      const contributions = Array.from(contributionMap.entries()).map(([date, count]) => ({
        date,
        count,
      }));
      
      return {
        username,
        totalContributions: contributions.reduce((sum, day) => sum + day.count, 0),
        contributions,
        recentRepositories: repos.map(repo => ({
          name: repo.name,
          url: repo.html_url,
          description: repo.description,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
        })),
        commitActivity: commitActivities,
      };
    } catch (error) {
      this.logger.error(`Error fetching GitHub user contributions: ${error.message}`);
      throw error;
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }
    
    return headers;
  }
}