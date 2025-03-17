import { Response, Request } from 'express';
import { SpotifyService } from './spotify.service';
import { TokenStorageService } from './token-storage.service';
export declare class SpotifyAuthController {
    private readonly spotifyService;
    private readonly tokenStorageService;
    constructor(spotifyService: SpotifyService, tokenStorageService: TokenStorageService);
    login(res: Response): void;
    callback(code: string, state: string, error: string, req: Request, res: Response): Promise<void>;
    refreshToken(res: Response): Promise<void>;
    getAuthStatus(res: Response): void;
    logout(res: Response): void;
    private generateRandomString;
}
