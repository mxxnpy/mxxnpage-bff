import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { TokenStorageService } from './token-storage.service';
export declare class SpotifyService {
    private readonly httpService;
    private readonly configService;
    private readonly tokenStorageService;
    private readonly clientId;
    private readonly clientSecret;
    private readonly redirectUri;
    private readonly apiBaseUrl;
    private readonly authUrl;
    private readonly tokenUrl;
    constructor(httpService: HttpService, configService: ConfigService, tokenStorageService: TokenStorageService);
    getAuthorizeUrl(scopes: string[], state: string): string;
    getAccessToken(code: string): Promise<any>;
    refreshAccessToken(refreshToken: string): Promise<any>;
    getCurrentTrack(): Promise<any>;
    getRecentlyPlayed(limit?: number): Promise<any>;
    getTopItems(type: 'artists' | 'tracks', timeRange?: string, limit?: number): Promise<any>;
    getPlaylists(limit?: number, offset?: number): Promise<any>;
    getPlaylistTracks(playlistId: string, limit?: number, offset?: number): Promise<any>;
    getUserProfile(): Promise<any>;
    private makeApiRequest;
}
