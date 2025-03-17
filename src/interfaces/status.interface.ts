export interface Status {
  status: string;
  timestamp: string;
}

export interface ScheduleConfig {
  weekdays: {
    [key: string]: string;
  };
  weekends: string;
}

export interface ActivityStatus {
  type: string;
  name: string;
  details?: string;
  state?: string;
  timestamps?: {
    start: number;
  };
}
