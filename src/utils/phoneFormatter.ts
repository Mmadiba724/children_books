/**
 * Utility for formatting phone numbers to include country codes
 * Converts local phone numbers (starting with 0) to international format
 */

interface CountryConfig {
  code: string;
  name: string;
}

const countryCodeMap: Record<string, CountryConfig> = {
  UG: { code: "256", name: "Uganda" },
  KE: { code: "254", name: "Kenya" },
  TZ: { code: "255", name: "Tanzania" },
  NG: { code: "234", name: "Nigeria" },
  GH: { code: "233", name: "Ghana" },
  ZA: { code: "27", name: "South Africa" },
  // Add more countries as needed
};

/**
 * Format a phone number by replacing leading zero with country code
 * @param phoneNumber - The phone number to format
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'UG' for Uganda)
 * @returns Formatted phone number with country code, or original if already formatted
 * @example
 * formatPhoneNumber('0789123456', 'UG') // Returns '+256789123456'
 * formatPhoneNumber('+256789123456', 'UG') // Returns '+256789123456'
 */
export const formatPhoneNumber = (
  phoneNumber: string,
  countryCode: string = "UG",
): string => {
  if (!phoneNumber) {
    return phoneNumber;
  }

  // Remove any spaces or hyphens
  const cleanedNumber = phoneNumber.trim().replace(/[\s\-]/g, "");

  // If already starts with +, return as is
  if (cleanedNumber.startsWith("+")) {
    return cleanedNumber;
  }

  // Get country config
  const country = countryCodeMap[countryCode.toUpperCase()];
  if (!country) {
    console.warn(
      `Country code ${countryCode} not found, returning original number`,
    );
    return phoneNumber;
  }

  // If starts with 0, replace with country code
  if (cleanedNumber.startsWith("0")) {
    return `+${country.code}${cleanedNumber.substring(1)}`;
  }

  // If doesn't start with 0 or +, prepend country code
  if (!cleanedNumber.startsWith(country.code)) {
    return `+${country.code}${cleanedNumber}`;
  }

  return `+${cleanedNumber}`;
};

/**
 * Validate phone number format after formatting
 * @param phoneNumber - The formatted phone number
 * @returns true if valid, false otherwise
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) return false;

  // Remove + and check if only digits remain
  const digitsOnly = phoneNumber.replace(/\D/g, "");

  // Valid phone numbers should have 10-15 digits (E.164 standard)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

/**
 * Get the formatted phone number for a specific country
 * This is useful for display purposes
 * @param phoneNumber - The phone number
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Object with formatted number and country info
 */
export const getFormattedPhoneInfo = (
  phoneNumber: string,
  countryCode: string = "UG",
) => {
  const formatted = formatPhoneNumber(phoneNumber, countryCode);
  const country = countryCodeMap[countryCode.toUpperCase()];

  return {
    formatted,
    country: country?.name || "Unknown",
    countryCode,
    isValid: isValidPhoneNumber(formatted),
  };
};

export default {
  formatPhoneNumber,
  isValidPhoneNumber,
  getFormattedPhoneInfo,
};
