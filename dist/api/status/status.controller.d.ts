import { StatusService } from './status.service';
import { ScheduleConfig } from '../../interfaces/status.interface';
export declare class StatusController {
    private readonly statusService;
    constructor(statusService: StatusService);
    getStatus(): Promise<{
        status: string;
        timestamp: string;
    }>;
    getSchedule(): Promise<ScheduleConfig>;
}
