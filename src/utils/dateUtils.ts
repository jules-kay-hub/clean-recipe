// src/utils/dateUtils.ts
// Date formatting utilities

/**
 * Format a timestamp as a relative time string
 * e.g., "Just now", "5 minutes ago", "3 days ago"
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  // Time constants in milliseconds
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;

  if (diff < MINUTE) {
    return 'Just now';
  }

  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  if (diff < WEEK) {
    const days = Math.floor(diff / DAY);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  if (diff < MONTH) {
    const weeks = Math.floor(diff / WEEK);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }

  if (diff < YEAR) {
    const months = Math.floor(diff / MONTH);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }

  const years = Math.floor(diff / YEAR);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

/**
 * Format a duration in minutes to a human-readable string
 * e.g., 90 -> "1h 30m", 1500 -> "1d 1h", 45 -> "45m"
 */
export function formatDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return '';

  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 && days === 0) {
    // Only show minutes if no days (keep it concise)
    parts.push(`${minutes}m`);
  }

  // If we have days but no hours/minutes shown, add hours if non-zero
  if (days > 0 && parts.length === 1 && hours > 0) {
    parts.push(`${hours}h`);
  }

  return parts.join(' ') || `${totalMinutes}m`;
}

/**
 * Check if a recipe requires overnight chilling based on instructions or time
 */
export function detectOvernightChill(instructions?: string[], prepTime?: number, cookTime?: number): boolean {
  // Check instructions for overnight keywords
  if (instructions) {
    const text = instructions.join(' ').toLowerCase();
    const overnightKeywords = [
      'overnight',
      'refrigerate for at least 8 hours',
      'refrigerate for 8 hours',
      'chill for at least 8 hours',
      'chill for 8 hours',
      'rest overnight',
      'let sit overnight',
      'marinate overnight',
      '24 hours',
      '12 hours',
    ];

    for (const keyword of overnightKeywords) {
      if (text.includes(keyword)) {
        return true;
      }
    }
  }

  // Check if total time is 8+ hours (480 minutes)
  const totalTime = (prepTime || 0) + (cookTime || 0);
  if (totalTime >= 480) {
    return true;
  }

  return false;
}

/**
 * Format a timestamp as a short relative time
 * e.g., "now", "5m", "3d", "2w"
 */
export function formatShortRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;

  if (diff < MINUTE) return 'now';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d`;
  if (diff < MONTH) return `${Math.floor(diff / WEEK)}w`;
  if (diff < YEAR) return `${Math.floor(diff / MONTH)}mo`;
  return `${Math.floor(diff / YEAR)}y`;
}
