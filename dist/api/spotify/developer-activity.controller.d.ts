import { SpotifyService } from './spotify.service';
export declare class SpotifyDeveloperActivityController {
    private readonly spotifyService;
    constructor(spotifyService: SpotifyService);
    getWorkHoursAnalysis(): Promise<{
        workHoursPercentage: number;
        peakListeningTime: string;
        workGenres: string[];
        nonWorkGenres: string[];
        listeningTrend: string;
        mostProductiveGenre: string;
        isCurrentlyInWorkHours: boolean;
        currentTime: string;
        error?: undefined;
        message?: undefined;
    } | {
        error: string;
        message: any;
        workHoursPercentage?: undefined;
        peakListeningTime?: undefined;
        workGenres?: undefined;
        nonWorkGenres?: undefined;
        listeningTrend?: undefined;
        mostProductiveGenre?: undefined;
        isCurrentlyInWorkHours?: undefined;
        currentTime?: undefined;
    }>;
    getProductivityCorrelation(): Promise<{
        highProductivityGenres: string[];
        lowProductivityGenres: string[];
        bestArtistsForFocus: string[];
        bestAlbumsForFocus: string[];
        recommendedWorkPlaylist: string;
        error?: undefined;
        message?: undefined;
    } | {
        error: string;
        message: any;
        highProductivityGenres?: undefined;
        lowProductivityGenres?: undefined;
        bestArtistsForFocus?: undefined;
        bestAlbumsForFocus?: undefined;
        recommendedWorkPlaylist?: undefined;
    }>;
    getListeningPatterns(period?: string): Promise<{
        totalListeningTime: {
            workHours: string;
            nonWorkHours: string;
        };
        averageDailyListening: {
            workHours: string;
            nonWorkHours: string;
        };
        dayWithMostListening: string;
        timeOfDayDistribution: {
            morning: string;
            afternoon: string;
            evening: string;
        };
        period: string;
        error?: undefined;
        message?: undefined;
    } | {
        error: string;
        message: any;
        totalListeningTime?: undefined;
        averageDailyListening?: undefined;
        dayWithMostListening?: undefined;
        timeOfDayDistribution?: undefined;
        period?: undefined;
    }>;
    private isWorkHours;
    private calculateWorkHoursPercentage;
    private determinePeakListeningTime;
    private categorizeGenres;
    private calculateListeningTrend;
}
