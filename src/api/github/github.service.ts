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

  async getUserProfile(username: string): Promise<any> {
    const url = `${this.apiUrl}/users/${username}`;
    return this.makeRequest(url);
  }

  async getUserRepos(username: string): Promise<any> {
    const url = `${this.apiUrl}/users/${username}/repos`;
    return this.makeRequest(url);
  }

  async getRepoDetails(owner: string, repo: string): Promise<any> {
    const url = `${this.apiUrl}/repos/${owner}/${repo}`;
    return this.makeRequest(url);
  }

  async getRepoLanguages(owner: string, repo: string): Promise<any> {
    const url = `${this.apiUrl}/repos/${owner}/${repo}/languages`;
    return this.makeRequest(url);
  }

  async getRepoContributors(owner: string, repo: string): Promise<any> {
    const url = `${this.apiUrl}/repos/${owner}/${repo}/contributors`;
    return this.makeRequest(url);
  }

  private async makeRequest(url: string): Promise<any> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (this.token) {
      headers.Authorization = `token ${this.token}`;
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(url, { headers }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `GitHub API request failed: ${error.message}`,
              error.stack,
            );
            throw error;
          }),
        ),
      );
      return data;
    } catch (error) {
      this.logger.error(`Error making request to ${url}: ${error.message}`);
      throw error;
    }
  }
}