// Centralized date utilities to prevent timezone confusion
// All functions consistently use local timezone to match user expectations

/**
 * Format a Date object to 'YYYY-MM-DD' string using local timezone
 * @param {Date} date - Date object to format
 * @returns {string} - Date string in YYYY-MM-DD format
 */
export const formatDateToYYYYMMDD = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Create a Date object from a 'YYYY-MM-DD' string using local timezone
 * This prevents timezone shift issues when parsing date strings
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date|null} - Date object in local timezone or null if invalid
 */
export const createLocalDate = (dateString) => {
  if (!dateString) return null;
  const datePart = dateString.substring(0, 10);
  const [year, month, day] = datePart.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
};

/**
 * Create an ISO string from date and time components using local timezone
 * This ensures consistency between frontend and backend datetime handling
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {string} - ISO string representing the local datetime
 */
export const createLocalDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  const localDateTime = new Date(`${dateStr}T${timeStr}:00`);
  return localDateTime.toISOString();
};

/**
 * Check if two dates represent the same day (ignoring time)
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date  
 * @returns {boolean} - True if dates are the same day
 */
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const d1 = date1 instanceof Date ? date1 : createLocalDate(date1);
  const d2 = date2 instanceof Date ? date2 : createLocalDate(date2);
  
  if (!d1 || !d2) return false;
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

/**
 * Debug function to log timezone-related information
 * Useful for troubleshooting timezone issues in development vs production
 */
export const debugTimezone = (context = '') => {
  const now = new Date();
  console.log(`🕐 [${context}] Timezone Debug Info:`, {
    browserTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: now.getTimezoneOffset(),
    localTime: now.toString(),
    isoTime: now.toISOString(),
    dateString: formatDateToYYYYMMDD(now)
  });
};
