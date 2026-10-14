// src/utils/validators.js

/**
 * Common Regular Expression Patterns for ERP Form Validation
 */
export const VALIDATION_REGEX = {
  // Letters, spaces, apostrophes, periods, and hyphens (2-100 chars)
  NAME: /^[a-zA-Z\s.'-]{2,100}$/,

  // Standard Indian 10-digit mobile number starting with 6, 7, 8, or 9
  PHONE_STRICT: /^[6-9]\d{9}$/,

  // Any 10-digit numeric phone number
  PHONE_LENIENT: /^\d{10}$/,

  // Standard RFC 5322 compliant email regex
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // Alphanumeric codes with hyphens and underscores (2-50 chars, no spaces)
  CODE: /^[A-Za-z0-9_-]{2,50}$/,

  // Indian GSTIN: 15 characters
  GSTIN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,

  // Indian PAN: 10 characters
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,

  // Indian Postal PIN Code: 6 digits
  PINCODE: /^[1-9][0-9]{5}$/,

  // HSN / SAC Code: 4, 6, or 8 digits
  HSN_SAC: /^\d{4,8}$/,

  // Bank IFSC Code: 4 letters, 0, then 6 alphanumeric
  IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,

  // Bank Account Number: 9 to 18 digits
  BANK_ACCOUNT: /^\d{9,18}$/
};

/**
 * Validates a Person's Name (First Name, Last Name, Middle Name, Contact Person)
 */
export const validateName = (value, label = 'Name', isRequired = true) => {
  const val = String(value || '').trim();
  if (!val) {
    return isRequired ? `${label} is required` : '';
  }
  if (val.length < 2) {
    return `${label} must be at least 2 characters`;
  }
  if (val.length > 100) {
    return `${label} must not exceed 100 characters`;
  }
  if (!VALIDATION_REGEX.NAME.test(val)) {
    return `${label} must contain only letters, dots, hyphens or spaces`;
  }
  return '';
};

/**
 * Validates a Mobile / Phone Number
 */
export const validatePhone = (value, label = 'Phone number', isRequired = true) => {
  const raw = String(value || '').trim();
  if (!raw) {
    return isRequired ? `${label} is required` : '';
  }
  // Remove formatting characters (spaces, hyphens, parentheses, plus sign)
  const clean = raw.replace(/[\s\-()+]/g, '');
  // Strip optional country code "+91" or "91" if 12 digits
  const tenDigit = clean.length === 12 && clean.startsWith('91') ? clean.slice(2) : clean;

  if (!/^\d+$/.test(tenDigit)) {
    return `${label} must contain digits only`;
  }
  if (tenDigit.length !== 10) {
    return `${label} must be exactly 10 digits`;
  }
  if (!/^[6-9]/.test(tenDigit)) {
    return `${label} must start with 6, 7, 8, or 9`;
  }
  return '';
};

/**
 * Validates an Email Address
 */
export const validateEmail = (value, label = 'Email address', isRequired = true) => {
  const val = String(value || '').trim();
  if (!val) {
    return isRequired ? `${label} is required` : '';
  }
  if (val.length > 150) {
    return `${label} must not exceed 150 characters`;
  }
  if (!VALIDATION_REGEX.EMAIL.test(val)) {
    return `Enter a valid ${label.toLowerCase()} (e.g. user@domain.com)`;
  }
  return '';
};

/**
 * Validates an Entity Code (Company Code, Product Code, Role Code, Material Code, Vendor Code)
 */
export const validateCode = (value, label = 'Code', isRequired = true) => {
  const val = String(value || '').trim();
  if (!val) {
    return isRequired ? `${label} is required` : '';
  }
  if (val.length < 2) {
    return `${label} must be at least 2 characters`;
  }
  if (val.length > 50) {
    return `${label} must not exceed 50 characters`;
  }
  if (/\s/.test(val)) {
    return `${label} cannot contain spaces`;
  }
  if (!VALIDATION_REGEX.CODE.test(val)) {
    return `${label} must be alphanumeric and may only use '-' or '_'`;
  }
  return '';
};

/**
 * Validates a GSTIN / UIN Number
 */
export const validateGSTIN = (value, label = 'GSTIN / UIN', isRequired = false) => {
  const val = String(value || '').trim().toUpperCase();
  if (!val) {
    return isRequired ? `${label} is required` : '';
  }
  if (val.length !== 15) {
    return `${label} must be exactly 15 characters`;
  }
  if (!VALIDATION_REGEX.GSTIN.test(val)) {
    return `Enter a valid 15-character ${label} (e.g. 29ABCDE1234F1Z5)`;
  }
  return '';
};

/**
 * Validates an HSN / SAC Code
 */
export const validateHSN = (value, label = 'HSN / SAC Code', isRequired = false) => {
  const val = String(value || '').trim();
  if (!val) {
    return isRequired ? `${label} is required` : '';
  }
  if (!VALIDATION_REGEX.HSN_SAC.test(val)) {
    return `${label} must be 4, 6, or 8 digits`;
  }
  return '';
};

/**
 * Validates a Password
 */
export const validatePassword = (value, label = 'Password', minLength = 6, isRequired = true) => {
  const val = String(value || '');
  if (!val.trim()) {
    return isRequired ? `${label} is required` : '';
  }
  if (val.length < minLength) {
    return `${label} must be at least ${minLength} characters`;
  }
  return '';
};

/**
 * Validates Date of Birth (must be in past and at least 18 years old)
 */
export const validateDateOfBirth = (value, minAge = 18, isRequired = true) => {
  if (!value) {
    return isRequired ? 'Date of birth is required' : '';
  }
  const dob = new Date(value);
  if (isNaN(dob.getTime())) {
    return 'Enter a valid date of birth';
  }
  const today = new Date();
  if (dob >= today) {
    return 'Date of birth must be in the past';
  }
  const ageDiffMs = today.getTime() - dob.getTime();
  const ageDate = new Date(ageDiffMs);
  const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
  if (calculatedAge < minAge) {
    return `Employee must be at least ${minAge} years old`;
  }
  return '';
};

/**
 * Validates Date of Joining against Date of Birth
 */
export const validateDateOfJoining = (dojValue, dobValue, isRequired = true) => {
  if (!dojValue) {
    return isRequired ? 'Date of joining is required' : '';
  }
  const doj = new Date(dojValue);
  if (isNaN(doj.getTime())) {
    return 'Enter a valid date of joining';
  }
  if (dobValue) {
    const dob = new Date(dobValue);
    if (!isNaN(dob.getTime()) && doj <= dob) {
      return 'Date of joining must be after date of birth';
    }
  }
  return '';
};
