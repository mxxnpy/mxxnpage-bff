/**
 * Date utility functions for the backend
 */

/**
 * Checks if a date is within work hours (8:30 - 18:30)
 * @param date The date to check
 * @returns True if within work hours
 */
export function isWorkHours(date: Date): boolean {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  
  // Work hours: 8:30 - 18:30
  const workStartMinutes = 8 * 60 + 30;
  const workEndMinutes = 18 * 60 + 30;
  
  return totalMinutes >= workStartMinutes && totalMinutes <= workEndMinutes;
}

/**
 * Checks if a date is a weekday (Monday-Friday)
 * @param date The date to check
 * @returns True if weekday
 */
export function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5; // Monday-Friday
}

/**
 * Gets the current status based on time
 * @param date The date to check
 * @returns Status string
 */
export function getTimeBasedStatus(date: Date): string {
  if (!isWeekday(date)) {
    return 'Free Time';
  }
  
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  
  // Morning free time: 6:00 - 7:30
  const morningStartMinutes = 6 * 60;
  const morningEndMinutes = 7 * 60 + 30;
  
  // Work hours: 8:30 - 18:30
  const workStartMinutes = 8 * 60 + 30;
  const workEndMinutes = 18 * 60 + 30;
  
  // Evening free time: 19:00 - 00:00
  const eveningStartMinutes = 19 * 60;
  const eveningEndMinutes = 24 * 60;
  
  if (totalMinutes >= morningStartMinutes && totalMinutes <= morningEndMinutes) {
    return 'Free Time';
  } else if (totalMinutes >= workStartMinutes && totalMinutes <= workEndMinutes) {
    return 'At Work';
  } else if (totalMinutes >= eveningStartMinutes && totalMinutes <= eveningEndMinutes) {
    return 'Free Time';
  } else {
    return 'Free Time';
  }
}
