import { format, formatDistance } from 'date-fns';

/**
 * Format a date to a readable string
 * @param {Date|String} date - Date to format
 * @param {String} formatString - Format string
 * @returns {String} Formatted date string
 */
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return 'N/A';
  return format(new Date(date), formatString);
};

/**
 * Format a date to a relative time string
 * @param {Date|String} date - Date to format
 * @returns {String} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

/**
 * Format a number to a percentage string
 * @param {Number} value - Value to format
 * @returns {String} Percentage string
 */
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return `${Math.round(value)}%`;
};

/**
 * Format a number to a currency string
 * @param {Number} value - Value to format
 * @param {String} currency - Currency code
 * @returns {String} Currency string
 */
export const formatCurrency = (value, currency = 'USD') => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value);
};

/**
 * Truncate a string to a maximum length
 * @param {String} str - String to truncate
 * @param {Number} maxLength - Maximum length
 * @returns {String} Truncated string
 */
export const truncateString = (str, maxLength = 50) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
};

/**
 * Capitalize the first letter of a string
 * @param {String} str - String to capitalize
 * @returns {String} Capitalized string
 */
export const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format a status string to a readable format
 * @param {String} status - Status string
 * @returns {String} Formatted status
 */
export const formatStatus = (status) => {
  if (!status) return '';
  return status.split('-').map(capitalizeFirstLetter).join(' ');
};
