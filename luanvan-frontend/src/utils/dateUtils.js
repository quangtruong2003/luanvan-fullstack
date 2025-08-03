// Date utility functions to handle timezone issues consistently across the app

/**
 * Format a Date object to 'YYYY-MM-DD' string, timezone-safe.
 * This avoids timezone conversion issues that can occur with toISOString().
 * @param {Date} date - The date object to format
 * @returns {string} - Formatted date string in YYYY-MM-DD format
 */
export const formatDateToYYYYMMDD = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Create a Date object in local timezone from a 'YYYY-MM-DD' string.
 * This ensures consistency with formatDateToYYYYMMDD and prevents timezone confusion.
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date|null} - Date object in local timezone or null if invalid
 */
export const createLocalDate = (dateString) => {
  if (!dateString) return null;
  // Parse as local date instead of UTC to match formatDateToYYYYMMDD behavior
  const datePart = dateString.substring(0, 10);
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
};

/**
 * Create ISO string without timezone conversion.
 * This preserves the local date/time values instead of converting to UTC.
 * @param {Date|string} date - Date object or date string
 * @param {string} time - Optional time string in HH:MM format
 * @returns {string|null} - ISO string without timezone conversion
 */
export const createLocalISOString = (date, time) => {
  if (!date) return null;
  
  let targetDate;
  if (date instanceof Date) {
    targetDate = new Date(date);
  } else {
    targetDate = new Date(date);
  }
  
  if (time) {
    // If time is provided, parse it and set hours/minutes
    const [hours, minutes] = time.split(':').map(Number);
    targetDate.setHours(hours, minutes, 0, 0);
  }
  
  // Create ISO string without timezone conversion
  // This keeps the local date/time values intact
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const hour = String(targetDate.getHours()).padStart(2, '0');
  const minute = String(targetDate.getMinutes()).padStart(2, '0');
  const second = String(targetDate.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
};

/**
 * Parse a date/time string into components without timezone conversion
 * @param {string} dateTimeString - ISO datetime string
 * @returns {Object} - Object with date and time components
 */
export const parseLocalDateTime = (dateTimeString) => {
  if (!dateTimeString) return null;
  
  try {
    const date = new Date(dateTimeString);
    return {
      date: formatDateToYYYYMMDD(date),
      time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
      year: date.getFullYear(),
      month: date.getMonth() + 1, // 1-indexed
      day: date.getDate(),
      hours: date.getHours(),
      minutes: date.getMinutes(),
      seconds: date.getSeconds()
    };
  } catch (error) {
    console.warn('Failed to parse datetime:', dateTimeString, error);
    return null;
  }
};

/**
 * Compare two dates ignoring time and timezone
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} - True if dates are the same day
 */
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);
  
  return formatDateToYYYYMMDD(d1) === formatDateToYYYYMMDD(d2);
};

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is today
 */
export const isToday = (date) => {
  return isSameDay(date, new Date());
};

/**
 * Add days to a date without timezone issues
 * @param {Date} date - Starting date
 * @param {number} days - Number of days to add (can be negative)
 * @returns {Date} - New date object
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Get the start of week (Monday) for a given date
 * @param {Date} date - Reference date
 * @returns {Date} - Start of week
 */
export const getWeekStart = (date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Get array of dates for a week starting from Monday
 * @param {Date} weekStart - Start of the week
 * @returns {Date[]} - Array of 7 dates
 */
export const getWeekDates = (weekStart) => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });
};
