import { ethers } from 'ethers';
import logger from '../utils/logger';

/**
 * Prediction data interface for type safety
 */
export interface PredictionData {
  groupStandings: Record<string, any>;
  thirdPlaceTeams: any;
  roundOf32: Record<string, any>;
  roundOf16: Record<string, any>;
  quarterFinals: Record<string, any>;
  semiFinals: Record<string, any>;
  final: Record<string, any>;
  thirdPlace: Record<string, any>;
  champion: string;
  runnerUp: string;
}

/**
 * Deep sort an object by keys to ensure deterministic JSON stringification
 * This is critical for generating consistent hashes from the same data
 *
 * @param obj - Object to sort
 * @returns Sorted object with all nested objects also sorted
 */
function deepSortObject(obj: any): any {
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(deepSortObject);
  }

  // Handle objects
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort() // Sort keys alphabetically
      .reduce((sorted: any, key: string) => {
        sorted[key] = deepSortObject(obj[key]);
        return sorted;
      }, {});
  }

  // Return primitives as-is
  return obj;
}

/**
 * Generate a deterministic keccak256 hash from prediction data
 *
 * This function ensures that identical predictions always produce the same hash,
 * which is used for on-chain uniqueness enforcement.
 *
 * Process:
 * 1. Deep sort all objects by keys (ensures consistent ordering)
 * 2. Convert to canonical JSON (no whitespace)
 * 3. Hash with keccak256 (same as Solidity's keccak256)
 *
 * @param predictionData - Complete prediction bracket data
 * @returns bytes32 hex string hash (0x...)
 */
export function generatePredictionHash(predictionData: PredictionData): string {
  try {
    // 1. Deep sort to ensure deterministic ordering
    const sortedData = deepSortObject(predictionData);

    // 2. Convert to canonical JSON (no extra whitespace)
    const canonicalJson = JSON.stringify(sortedData);

    // Log for debugging (truncate if too long)
    const preview = canonicalJson.length > 100
      ? canonicalJson.substring(0, 100) + '...'
      : canonicalJson;
    logger.debug(`Generating hash for prediction data: ${preview}`);

    // 3. Generate keccak256 hash (same as Solidity)
    const hash = ethers.keccak256(ethers.toUtf8Bytes(canonicalJson));

    logger.info(`Generated prediction hash: ${hash}`);

    return hash;
  } catch (error: any) {
    logger.error('Error generating prediction hash:', error);
    throw new Error(`Failed to generate prediction hash: ${error.message}`);
  }
}

/**
 * Verify that a hash matches the given prediction data
 *
 * @param predictionData - Prediction data to verify
 * @param expectedHash - Expected hash to match
 * @returns True if hash matches, false otherwise
 */
export function verifyPredictionHash(
  predictionData: PredictionData,
  expectedHash: string
): boolean {
  try {
    const computedHash = generatePredictionHash(predictionData);
    const matches = computedHash === expectedHash;

    if (!matches) {
      logger.warn(`Hash mismatch - Expected: ${expectedHash}, Got: ${computedHash}`);
    }

    return matches;
  } catch (error: any) {
    logger.error('Error verifying prediction hash:', error);
    return false;
  }
}

/**
 * Generate a short hash for display purposes (first 12 characters)
 *
 * @param fullHash - Full hash string
 * @returns Shortened hash (0x123456...)
 */
export function shortenHash(fullHash: string): string {
  if (!fullHash || fullHash.length < 12) {
    return fullHash;
  }
  return fullHash.substring(0, 12) + '...';
}

/**
 * Format transaction hash for display (first 10 + last 8 characters)
 *
 * @param txHash - Transaction hash
 * @returns Formatted hash (0x1234...56789abc)
 */
export function formatTransactionHash(txHash: string): string {
  if (!txHash || txHash.length < 20) {
    return txHash;
  }
  return `${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}`;
}
