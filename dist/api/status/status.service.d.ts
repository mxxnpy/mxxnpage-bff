interface ScheduleConfig {
    weekdays: {
        [key: string]: string;
    };
    weekends: string;
}
export declare class StatusService {
    private scheduleConfig;
    getCurrentStatus(): {
        status: string;
        timestamp: string;
    };
    getSchedule(): ScheduleConfig;
    private determineStatusFromSchedule;
    private isTimeInRange;
}
export {};
