import { Injectable } from '@nestjs/common';

interface ScheduleConfig {
  weekdays: {
    [key: string]: string;
  };
  weekends: string;
}

@Injectable()
export class StatusService {
  private scheduleConfig: ScheduleConfig = {
    weekdays: {
      '06:00-07:30': 'Free Time',
      '08:30-18:30': 'At Work',
      '19:00-00:00': 'Free Time',
    },
    weekends: 'Free Time',
  };

  getCurrentStatus(): { status: string; timestamp: string } {
    const now = new Date();
    const currentStatus = this.determineStatusFromSchedule(now);
    
    return {
      status: currentStatus,
      timestamp: now.toISOString(),
    };
  }

  getSchedule(): ScheduleConfig {
    return this.scheduleConfig;
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
