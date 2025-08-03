import { VALIDATION_PATTERNS } from './constants';

/**
 * Validates if a string is a valid Sui address format
 * Sui addresses are 32 bytes (64 hex characters) with 0x prefix
 */
export function isValidSuiAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Remove any whitespace
  const cleanAddress = address.trim();

  // Check basic format: 0x followed by 64 hex characters
  if (!VALIDATION_PATTERNS.SUI_ADDRESS.test(cleanAddress)) {
    return false;
  }

  // Additional validation: ensure it's exactly 66 characters (0x + 64 hex)
  if (cleanAddress.length !== 66) {
    return false;
  }

  return true;
}

/**
 * Normalizes a Sui address to ensure consistent format
 * Pads with zeros if needed and ensures lowercase hex
 */
export function normalizeSuiAddress(address: string): string {
  if (!isValidSuiAddress(address)) {
    throw new Error('Invalid Sui address format');
  }

  // Remove 0x prefix, pad to 64 characters, add 0x prefix back
  const hexPart = address.slice(2).padStart(64, '0').toLowerCase();
  return `0x${hexPart}`;
}

/**
 * Validates and normalizes a Sui address
 * Returns normalized address or throws error
 */
export function validateAndNormalizeSuiAddress(address: string): string {
  try {
    return normalizeSuiAddress(address);
  } catch (error) {
    throw new Error(`Invalid Sui address: ${address}`);
  }
}

/**
 * Check if address is likely a valid recipient
 * (not zero address, not obviously invalid patterns)
 */
export function isValidRecipientAddress(address: string): boolean {
  if (!isValidSuiAddress(address)) {
    return false;
  }

  const normalized = normalizeSuiAddress(address);
  
  // Check for zero address
  const zeroAddress = '0x0000000000000000000000000000000000000000000000000000000000000000';
  if (normalized === zeroAddress) {
    return false;
  }

  return true;
}

/**
 * Format address for display (show first 6 and last 4 characters)
 */
export function formatAddressForDisplay(address: string): string {
  if (!isValidSuiAddress(address)) {
    return 'Invalid Address';
  }

  const normalized = normalizeSuiAddress(address);
  return `${normalized.slice(0, 6)}...${normalized.slice(-4)}`;
}
