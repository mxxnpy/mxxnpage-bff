import { SpotifyService } from './spotify.service';
export declare class SpotifyController {
    private readonly spotifyService;
    constructor(spotifyService: SpotifyService);
    getCurrentUser(): Promise<any>;
    getCurrentTrack(): Promise<any>;
    getRecentlyPlayed(limit?: number): Promise<any>;
    getTopItems(type: 'artists' | 'tracks', timeRange?: 'short_term' | 'medium_term' | 'long_term', limit?: number): Promise<any>;
    getPlaylists(limit?: number, offset?: number): Promise<any>;
    getPlaylistTracks(id: string, limit?: number, offset?: number): Promise<any>;
}
