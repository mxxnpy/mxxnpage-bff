import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map, of } from 'rxjs';
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
    try {
      this.apiUrl = 'https://api.github.com';
      this.token = process.env.GITHUB_TOKEN || '';
      
      if (this.configService) {
        this.apiUrl = this.configService.get<string>('GITHUB_API_URL', 'https://api.github.com');
        const configToken = this.configService.get<string>('GITHUB_TOKEN');
        if (configToken) {
          this.token = configToken;
        }
      }
      
      if (!this.token) {
        this.logger.warn('GITHUB_TOKEN is not set. GitHub API requests may be rate-limited.');
      }
    } catch (error) {
      this.logger.error(`Error initializing GithubService: ${error.message}`);
      this.apiUrl = 'https://api.github.com';
      this.token = process.env.GITHUB_TOKEN || '';
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
      // Using GitHub GraphQL API to fetch actual contributions data
      const query = `
        query($username: String!) {
          user(login: $username) {
            name
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }
      `;
      
      const variables = { username };
      
      // Check if token is available
      if (!this.token) {
        this.logger.warn('No GitHub token available. Returning default contribution data.');
        return this.getDefaultContributions(username);
      }
      
      try {
        const { data } = await firstValueFrom(
          this.httpService.post('https://api.github.com/graphql', {
            query,
            variables
          }, {
            headers: {
              'Authorization': `bearer ${this.token}`,
              'Content-Type': 'application/json'
            }
          }).pipe(
            catchError((error: AxiosError) => {
              this.logger.error(`Failed to fetch GitHub contributions via GraphQL: ${error.message}`);
              throw new Error(`Failed to fetch GitHub contributions: ${error.message}`);
            }),
          ),
        );
        
        // Extract contributions data from GraphQL response
        const contributionCalendar = data?.data?.user?.contributionsCollection?.contributionCalendar;
        if (!contributionCalendar) {
          this.logger.warn('Invalid GraphQL response from GitHub API. Returning default data.');
          return this.getDefaultContributions(username);
        }
        
        // Format the contributions data
        const contributions = [];
        contributionCalendar.weeks.forEach(week => {
          week.contributionDays.forEach(day => {
            contributions.push({
              date: day.date,
              count: day.contributionCount
            });
          });
        });
        
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
              // Return an observable with empty data array
              return of({ data: [] });
            }),
          ),
        );
        
        return {
          username,
          totalContributions: contributionCalendar.totalContributions,
          contributions,
          recentRepositories: Array.isArray(repos) ? repos.map(repo => ({
            name: repo.name,
            url: repo.html_url,
            description: repo.description,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language,
          })) : [],
        };
      } catch (graphqlError) {
        this.logger.error(`GraphQL API error: ${graphqlError.message}`);
        return this.getDefaultContributions(username);
      }
    } catch (error) {
      this.logger.error(`Error fetching GitHub user contributions: ${error.message}`);
      return this.getDefaultContributions(username);
    }
  }
  
  private getDefaultContributions(username: string) {
    // Create a default response with empty data
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Create empty contributions for the past year
    const contributions = [];
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      contributions.push({
        date: dateString,
        count: 0
      });
    }
    
    return {
      username,
      totalContributions: 0,
      contributions,
      recentRepositories: [],
      error: "Authentication required. Please provide a GitHub token."
    };
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
