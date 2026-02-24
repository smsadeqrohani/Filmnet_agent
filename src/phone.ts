/**
 * Iranian mobile number validation and normalization.
 * Supports (with optional spaces/dashes/parentheses):
 *   +989XXXXXXXXX, 989XXXXXXXXX, 09XXXXXXXXX, 9XXXXXXXXX,
 *   09XX XXX XX XX, 9XX XXX XX XX
 * Normalizes to: 989XXXXXXXXX (no plus) for API usage.
 */

const IRAN_MOBILE_REGEX = /^9\d{9}$/;

function digitsOnly(input: string): string {
  return input.replace(/\D/g, '');
}

export function normalizeIranianMobile(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const digits = digitsOnly(input.trim());
  let normalized: string;
  if (digits.startsWith('98') && digits.length === 12) {
    normalized = digits; // +989... or 989...
  } else if (digits.startsWith('09') && digits.length === 11) {
    normalized = '98' + digits.slice(1); // 09XX... or 09XX XXX XX XX
  } else if (digits.startsWith('9') && digits.length === 10) {
    normalized = '98' + digits; // 9XX... or 9XX XXX XX XX
  } else {
    return null;
  }
  const mobilePart = normalized.slice(2);
  return IRAN_MOBILE_REGEX.test(mobilePart) ? normalized : null;
}

/**
 * Check if input is a valid Iranian mobile (without necessarily normalizing).
 */
export function isValidIranianMobile(input: string): boolean {
  return normalizeIranianMobile(input) !== null;
}
