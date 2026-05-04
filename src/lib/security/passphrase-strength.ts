/**
 * Passphrase strength requirements and validation.
 */

export interface PassphraseStrength {
  score: number;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  meetsMinimum: boolean;
}

/**
 * Minimum passphrase length requirement.
 */
export const MIN_PASSPHRASE_LENGTH = 12;

/**
 * Minimum strength score required (out of 4 criteria).
 */
export const MIN_STRENGTH_SCORE = 3;

/**
 * Evaluate passphrase strength based on character variety.
 * 
 * @param passphrase - The passphrase to evaluate
 * @returns PassphraseStrength object with score and criteria details
 */
export function evaluatePassphraseStrength(passphrase: string): PassphraseStrength {
  const hasUpper = /[A-Z]/.test(passphrase);
  const hasLower = /[a-z]/.test(passphrase);
  const hasNumber = /[0-9]/.test(passphrase);
  const hasSpecial = /[^A-Za-z0-9]/.test(passphrase);
  
  const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const meetsMinimum = passphrase.length >= MIN_PASSPHRASE_LENGTH && score >= MIN_STRENGTH_SCORE;

  return {
    score,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    meetsMinimum,
  };
}

/**
 * Validate passphrase meets minimum requirements.
 * 
 * @param passphrase - The passphrase to validate
 * @returns True if passphrase meets minimum requirements
 */
export function isValidPassphrase(passphrase: string): boolean {
  return evaluatePassphraseStrength(passphrase).meetsMinimum;
}

/**
 * Get validation error message for passphrase.
 * 
 * @param passphrase - The passphrase to validate
 * @returns Error message if invalid, null if valid
 */
export function getPassphraseError(passphrase: string): string | null {
  if (!passphrase) {
    return 'Passphrase is required';
  }

  if (passphrase.length < MIN_PASSPHRASE_LENGTH) {
    return `Passphrase must be at least ${MIN_PASSPHRASE_LENGTH} characters`;
  }

  const strength = evaluatePassphraseStrength(passphrase);
  if (strength.score < MIN_STRENGTH_SCORE) {
    return 'Passphrase should include uppercase, lowercase, numbers, and symbols';
  }

  return null;
}
