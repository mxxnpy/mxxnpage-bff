import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

interface ScheduleConfig {
  weekdays: {
    [key: string]: string;
  };
  weekends: string;
}

interface Activity {
  type: string;
  name: string;
  details?: string;
  state?: string;
  timestamps?: {
    start: number;
  };
}

@Injectable()
export class StatusService {
  private readonly logger = new Logger(StatusService.name);
  private currentStatusCache: { status: string; timestamp: string } = {
    status: 'Unknown',
    timestamp: new Date().toISOString(),
  };
  
  private currentActivities: Activity[] = [];
  
  private scheduleConfig: ScheduleConfig = {
    weekdays: {
      '06:00-07:30': 'Free Time',
      '08:30-18:30': 'At Work',
      '19:00-00:00': 'Free Time',
    },
    weekends: 'Free Time',
  };

  constructor() {
    // Initialize status on service creation
    this.updateCurrentStatus();
    this.logger.log('StatusService initialized with real-time updates');
  }

  // Update status every 10 seconds for real-time data
  @Interval(10000) // 10 seconds for real-time updates
  updateCurrentStatus() {
    const now = new Date();
    const currentStatus = this.determineStatusFromSchedule(now);
    
    this.currentStatusCache = {
      status: currentStatus,
      timestamp: now.toISOString(),
    };
    
    // Update activities based on current status
    this.updateActivities(currentStatus, now);
    
    this.logger.debug(`Status updated: ${currentStatus} at ${now.toISOString()}`);
  }

  getCurrentStatus(): { status: string; timestamp: string } {
    // Return cached status for immediate response
    return this.currentStatusCache;
  }

  getCurrentActivities(): Activity[] {
    return this.currentActivities;
  }

  getSchedule(): ScheduleConfig {
    return this.scheduleConfig;
  }

  private updateActivities(status: string, now: Date) {
    const day = now.getDay();
    const hours = now.getHours();
    
    // Clear previous activities
    this.currentActivities = [];
    
    // Create activity based on time and status
    if (day === 0 || day === 6) {
      // Weekend
      this.currentActivities.push({
        type: 'CUSTOM',
        name: 'Weekend',
        details: status,
        state: 'Relaxing',
        timestamps: {
          start: Date.now() - 3600000, // 1 hour ago
        },
      });
    } else if (hours >= 8 && hours < 18) {
      // Weekday work hours
      this.currentActivities.push({
        type: 'WORKING',
        name: 'Work',
        details: status,
        state: 'Busy',
        timestamps: {
          start: Date.now() - 3600000, // 1 hour ago
        },
      });
    } else {
      // Free time
      this.currentActivities.push({
        type: 'CUSTOM',
        name: 'Free Time',
        details: status,
        state: 'Available',
        timestamps: {
          start: Date.now() - 1800000, // 30 minutes ago
        },
      });
    }
  }

  private determineStatusFromSchedule(date: Date): string {
    const day = date.getDay();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Weekend (0 = Sunday, 6 = Saturday)
    if (day === 0 || day === 6) {
      return this.scheduleConfig.weekends;
    }
    
    // Weekday
    for (const timeRange in this.scheduleConfig.weekdays) {
      const [start, end] = timeRange.split('-');
      if (this.isTimeInRange(currentTime, start, end)) {
        return this.scheduleConfig.weekdays[timeRange];
      }
    }
    
    // Default status if not in any defined range
    return 'Unknown';
  }

  private isTimeInRange(time: string, start: string, end: string): boolean {
    return time >= start && time <= end;
  }
}
