/**
 * Validation utilities for form inputs
 */

/**
 * Check if a string is empty
 */
export function isEmpty(value: string | undefined | null): boolean {
  return !value || value.trim() === "";
}

/**
 * Check if an email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a phone number is valid (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9+\-() ]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Check if a string has minimum length
 */
export function hasMinLength(value: string, minLength: number): boolean {
  return value.trim().length >= minLength;
}

/**
 * Check if a number is positive
 */
export function isPositiveNumber(value: string | number): boolean {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
}

/**
 * Tailwind CSS class for input error styling
 */
export const inputErrorClass = "border-red-500 focus:border-red-500 focus:ring-red-500";

/**
 * Tailwind CSS class for error text styling
 */
export const errorTextClass = "text-red-600 text-sm mt-1";
