/**
 * Iranian mobile number validation and normalization.
 * Accepts: 09XXXXXXXXX, +989XXXXXXXXX, 989XXXXXXXXX, with optional spaces/dashes/parentheses.
 * Normalizes to: 989XXXXXXXXX (no plus sign) for API usage.
 */

const IRAN_MOBILE_REGEX = /^9\d{9}$/;

/**
 * Strip all non-digit characters from a string.
 */
function digitsOnly(input: string): string {
  return input.replace(/\D/g, '');
}

/**
 * Normalize and validate Iranian mobile number.
 * @param input - User input (e.g. "0912 123 4567", "+989121234567", "989121234567")
 * @returns Normalized "989XXXXXXXXX" or null if invalid
 */
export function normalizeIranianMobile(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const digits = digitsOnly(input.trim());
  let normalized: string;
  if (digits.startsWith('98') && digits.length === 12) {
    normalized = digits; // 989XXXXXXXXX
  } else if (digits.startsWith('9') && digits.length === 10) {
    normalized = '98' + digits; // 09XXXXXXXXX -> 989XXXXXXXXX
  } else {
    return null;
  }
  const mobilePart = normalized.slice(2); // 9XXXXXXXXX
  return IRAN_MOBILE_REGEX.test(mobilePart) ? normalized : null;
}

/**
 * Check if input is a valid Iranian mobile (without necessarily normalizing).
 */
export function isValidIranianMobile(input: string): boolean {
  return normalizeIranianMobile(input) !== null;
}
