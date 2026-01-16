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
 * Extract passive/inactive time from recipe instructions
 * Looks for patterns like "let rise for 2 hours", "chill for 30 minutes", etc.
 * Returns total passive time in minutes
 */
export function extractPassiveTime(instructions?: string[]): number {
  if (!instructions || instructions.length === 0) return 0;

  const text = instructions.join(' ').toLowerCase();
  let totalMinutes = 0;

  // Patterns for passive time (action + duration)
  // These are activities where you're waiting, not actively cooking
  const passivePatterns = [
    // Rising/proofing (bread, dough)
    /(?:let\s+)?(?:rise|proof|ferment)\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,
    /(?:allow|leave)\s+(?:to\s+)?(?:rise|proof)\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,

    // Resting
    /(?:let\s+)?rest\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,
    /(?:let\s+)?(?:it\s+)?sit\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,
    /(?:let\s+)?stand\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,

    // Chilling/refrigerating
    /(?:chill|refrigerate|cool)\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,
    /(?:chill|refrigerate)\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,
    /(?:in\s+(?:the\s+)?(?:fridge|refrigerator))\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,

    // Marinating
    /marinate\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,

    // Soaking
    /soak\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,

    // Freezing
    /freeze\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,

    // Setting (for desserts like panna cotta, jello)
    /(?:let\s+)?set\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,

    // Cooling
    /(?:let\s+)?cool\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,

    // Generic waiting patterns with specific keywords indicating passive time
    /(?:wait|leave)\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,
  ];

  // Track matched time spans to avoid double-counting
  const matchedSpans: Array<{ start: number; end: number }> = [];

  for (const pattern of passivePatterns) {
    let match;
    // Reset regex lastIndex
    pattern.lastIndex = 0;

    while ((match = pattern.exec(text)) !== null) {
      const matchStart = match.index;
      const matchEnd = match.index + match[0].length;

      // Check if this match overlaps with any previous match
      const overlaps = matchedSpans.some(
        span => (matchStart >= span.start && matchStart < span.end) ||
                (matchEnd > span.start && matchEnd <= span.end)
      );

      if (!overlaps) {
        matchedSpans.push({ start: matchStart, end: matchEnd });
        const minutes = parseTimeToMinutes(match[1], match[2]);
        totalMinutes += minutes;
      }
    }
  }

  // Special case: "overnight" without specific hours (assume 8 hours)
  if (text.includes('overnight') && totalMinutes < 480) {
    // Only add if we haven't already counted a large passive time
    const overnightMatch = text.match(/overnight/gi);
    if (overnightMatch) {
      // Check if overnight is in context of passive activity
      const overnightPatterns = [
        /(?:chill|refrigerate|rest|rise|proof|marinate|soak|sit|stand|ferment)\s+overnight/i,
        /overnight\s+(?:in\s+(?:the\s+)?(?:fridge|refrigerator)|chilling|rest)/i,
        /leave\s+overnight/i,
        /let\s+(?:it\s+)?(?:sit|rest|rise)\s+overnight/i,
      ];

      for (const pattern of overnightPatterns) {
        if (pattern.test(text) && totalMinutes < 480) {
          totalMinutes = Math.max(totalMinutes, 480); // 8 hours minimum for overnight
          break;
        }
      }
    }
  }

  // Special case: "24 hours" or "48 hours" mentioned (long fermentation)
  const longHoursMatch = text.match(/(\d+)\s*hours?\s*(?:\(|in\s+(?:the\s+)?(?:fridge|refrigerator))/gi);
  if (longHoursMatch) {
    for (const match of longHoursMatch) {
      const hours = parseInt(match.match(/\d+/)?.[0] || '0');
      if (hours >= 8) {
        totalMinutes = Math.max(totalMinutes, hours * 60);
      }
    }
  }

  return totalMinutes;
}

/**
 * Parse a time string like "2 hours" or "30 minutes" to minutes
 * Handles ranges like "1 to 2 hours" by taking the minimum
 */
function parseTimeToMinutes(timeValue: string, unit: string): number {
  // Handle ranges like "1 to 2" or "1-2"
  const rangeMatch = timeValue.match(/(\d+)\s*(?:to|-)\s*(\d+)/);
  let value: number;

  if (rangeMatch) {
    // Take the minimum of the range for conservative estimate
    value = Math.min(parseInt(rangeMatch[1]), parseInt(rangeMatch[2]));
  } else {
    value = parseInt(timeValue);
  }

  // Convert to minutes based on unit
  const unitLower = unit.toLowerCase();
  if (unitLower.startsWith('hour') || unitLower === 'hrs' || unitLower === 'hr') {
    return value * 60;
  }

  // Default to minutes
  return value;
}

/**
 * Calculate total realistic time for a recipe
 * Combines active time (prep + cook) with passive time
 */
export function calculateTotalTime(
  prepTime?: number,
  cookTime?: number,
  inactiveTime?: number
): number {
  const activeTime = (prepTime || 0) + (cookTime || 0);
  return activeTime + (inactiveTime || 0);
}

/**
 * Format time breakdown for display
 * Returns an object with formatted strings for different time components
 */
export function formatTimeBreakdown(
  prepTime?: number,
  cookTime?: number,
  inactiveTime?: number
): {
  activeTime: string;
  inactiveTime: string;
  totalTime: string;
  hasInactiveTime: boolean;
} {
  const active = (prepTime || 0) + (cookTime || 0);
  const inactive = inactiveTime || 0;
  const total = active + inactive;

  return {
    activeTime: formatDuration(active),
    inactiveTime: formatDuration(inactive),
    totalTime: formatDuration(total),
    hasInactiveTime: inactive > 0,
  };
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
