/**
 * Blockchain error codes for categorizing failures
 */
export enum BlockchainErrorCode {
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  DUPLICATE_PREDICTION = 'DUPLICATE_PREDICTION',
  TRANSACTION_TIMEOUT = 'TRANSACTION_TIMEOUT',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  GAS_ESTIMATION_FAILED = 'GAS_ESTIMATION_FAILED',
  BLOCKCHAIN_NOT_INITIALIZED = 'BLOCKCHAIN_NOT_INITIALIZED',
}

/**
 * Custom error class for blockchain operations
 */
export class BlockchainError extends Error {
  public readonly code: BlockchainErrorCode;
  public readonly statusCode: number;
  public readonly originalError?: any;

  constructor(
    code: BlockchainErrorCode,
    message: string,
    statusCode: number = 500,
    originalError?: any
  ) {
    super(message);
    this.name = 'BlockchainError';
    this.code = code;
    this.statusCode = statusCode;
    this.originalError = originalError;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Check if error should be retried
   */
  isRetryable(): boolean {
    return [
      BlockchainErrorCode.NETWORK_ERROR,
      BlockchainErrorCode.TRANSACTION_TIMEOUT,
      BlockchainErrorCode.GAS_ESTIMATION_FAILED,
    ].includes(this.code);
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON() {
    return {
      error: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Result of NFT minting operation
 */
export interface MintResult {
  tokenId: number;
  transactionHash: string;
  predictionHash: string;
  blockNumber: number;
  gasUsed: string;
}

/**
 * Gas price information from network
 */
export interface GasPriceInfo {
  gasPrice: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  gasPriceGwei: string;
}

/**
 * Wallet balance information
 */
export interface WalletBalance {
  balance: bigint;
  balanceEth: string;
  canMint: boolean;
  minBalance: bigint;
}

/**
 * Blockchain configuration
 */
export interface BlockchainConfig {
  network: string;
  contractAddress: string;
  enabled: boolean;
  chainId?: number;
}

/**
 * NFT prediction details from smart contract
 */
export interface NFTPrediction {
  predictionId: string;
  predictionHash: string;
  owner: string;
  timestamp: number;
  unlocked: boolean;
  metadataURI: string;
}

/**
 * Transaction receipt summary
 */
export interface TransactionReceipt {
  hash: string;
  blockNumber: number;
  gasUsed: string;
  status: number;
}
