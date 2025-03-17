"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusService = void 0;
const common_1 = require("@nestjs/common");
let StatusService = class StatusService {
    constructor() {
        this.scheduleConfig = {
            weekdays: {
                '06:00-07:30': 'Free Time',
                '08:30-18:30': 'At Work',
                '19:00-00:00': 'Free Time',
            },
            weekends: 'Free Time',
        };
    }
    getCurrentStatus() {
        const now = new Date();
        const currentStatus = this.determineStatusFromSchedule(now);
        return {
            status: currentStatus,
            timestamp: now.toISOString(),
        };
    }
    getSchedule() {
        return this.scheduleConfig;
    }
    determineStatusFromSchedule(date) {
        const day = date.getDay();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        if (day === 0 || day === 6) {
            return this.scheduleConfig.weekends;
        }
        for (const timeRange in this.scheduleConfig.weekdays) {
            const [start, end] = timeRange.split('-');
            if (this.isTimeInRange(currentTime, start, end)) {
                return this.scheduleConfig.weekdays[timeRange];
            }
        }
        return 'Unknown';
    }
    isTimeInRange(time, start, end) {
        return time >= start && time <= end;
    }
};
exports.StatusService = StatusService;
exports.StatusService = StatusService = __decorate([
    (0, common_1.Injectable)()
], StatusService);
//# sourceMappingURL=status.service.js.map