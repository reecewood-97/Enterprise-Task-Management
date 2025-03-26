/**
 * Validate an email address
 * @param {String} email - Email to validate
 * @returns {Boolean} True if valid, false otherwise
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate a password (at least 8 characters, one uppercase, one lowercase, one number)
 * @param {String} password - Password to validate
 * @returns {Boolean} True if valid, false otherwise
 */
export const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Get password strength (0-4)
 * @param {String} password - Password to check
 * @returns {Number} Strength from 0 (weak) to 4 (strong)
 */
export const getPasswordStrength = (password) => {
  if (!password) return 0;
  
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength += 1;
  
  // Contains lowercase
  if (/[a-z]/.test(password)) strength += 1;
  
  // Contains uppercase
  if (/[A-Z]/.test(password)) strength += 1;
  
  // Contains number
  if (/\d/.test(password)) strength += 1;
  
  // Contains special character
  if (/[\W_]/.test(password)) strength += 1;
  
  return Math.min(4, strength);
};

/**
 * Validate a URL
 * @param {String} url - URL to validate
 * @returns {Boolean} True if valid, false otherwise
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Validate a phone number
 * @param {String} phone - Phone number to validate
 * @returns {Boolean} True if valid, false otherwise
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {Boolean} True if empty, false otherwise
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};
