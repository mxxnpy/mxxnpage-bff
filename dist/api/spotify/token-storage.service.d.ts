interface SpotifyTokens {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope?: string;
    expires_at?: number;
}
export declare class TokenStorageService {
    private readonly tokenFilePath;
    constructor();
    storeTokens(tokens: SpotifyTokens): Promise<void>;
    getTokens(): SpotifyTokens | null;
    updateTokens(tokens: Partial<SpotifyTokens>): Promise<void>;
    clearTokens(): Promise<void>;
    isAuthenticated(): Promise<boolean>;
}
export {};
