import { ethers } from 'ethers';
import { getContract, getProvider, getWallet, isBlockchainEnabled } from '../config/blockchain';
import logger from '../utils/logger';
import { AppError } from '../middleware/error.middleware';
import { generatePredictionHash, type PredictionData } from './hash.service';
import {
  BlockchainError,
  BlockchainErrorCode,
  type MintResult,
  type GasPriceInfo,
  type WalletBalance,
} from '../types/blockchain.types';

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get current gas price information from network
 */
export async function estimateGasPrice(): Promise<GasPriceInfo> {
  try {
    const provider = getProvider();
    const feeData = await provider.getFeeData();

    return {
      gasPrice: feeData.gasPrice || 0n,
      maxFeePerGas: feeData.maxFeePerGas || 0n,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || 0n,
      gasPriceGwei: ethers.formatUnits(feeData.gasPrice || 0n, 'gwei'),
    };
  } catch (error: any) {
    logger.error('Error estimating gas price:', error);
    throw new BlockchainError(
      BlockchainErrorCode.NETWORK_ERROR,
      'Failed to estimate gas price',
      500,
      error
    );
  }
}

/**
 * Check minter wallet balance
 */
export async function checkMinterBalance(): Promise<WalletBalance> {
  try {
    const wallet = getWallet();
    const provider = getProvider();
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);

    // Minimum balance: 0.01 ETH/MATIC
    const minBalance = ethers.parseEther('0.01');

    return {
      balance,
      balanceEth,
      canMint: balance > minBalance,
      minBalance,
    };
  } catch (error: any) {
    logger.error('Error checking minter balance:', error);
    throw new BlockchainError(
      BlockchainErrorCode.NETWORK_ERROR,
      'Failed to check wallet balance',
      500,
      error
    );
  }
}

/**
 * Wait for low gas price (optional optimization)
 */
export async function waitForLowGasPrice(
  maxGasPriceGwei: number = 50,
  maxWaitTime: number = 300000
): Promise<void> {
  const startTime = Date.now();
  const provider = getProvider();

  while (Date.now() - startTime < maxWaitTime) {
    const feeData = await provider.getFeeData();
    const gasPriceGwei = Number(ethers.formatUnits(feeData.gasPrice || 0n, 'gwei'));

    if (gasPriceGwei <= maxGasPriceGwei) {
      logger.info(`Gas price acceptable: ${gasPriceGwei} gwei`);
      return;
    }

    logger.info(`Gas price too high: ${gasPriceGwei} gwei, waiting...`);
    await sleep(10000); // Wait 10 seconds
  }

  logger.warn('Max wait time exceeded for low gas price, proceeding anyway');
}

/**
 * Mint a prediction NFT on the blockchain
 *
 * @param userAddress - User wallet address (or user ID as fallback)
 * @param predictionId - Off-chain prediction ID
 * @param predictionData - Full prediction data for hash generation
 * @returns MintResult with tokenId, transactionHash, and predictionHash
 */
export async function mintPredictionNFT(
  userAddress: string,
  predictionId: string,
  predictionData: PredictionData
): Promise<MintResult> {
  try {
    if (!isBlockchainEnabled()) {
      throw new BlockchainError(
        BlockchainErrorCode.BLOCKCHAIN_NOT_INITIALIZED,
        'Blockchain is not initialized',
        500
      );
    }

    const contract = getContract();

    // 1. Generate deterministic hash from full prediction data
    const predictionHash = generatePredictionHash(predictionData);
    logger.info(`Generated prediction hash: ${predictionHash}`);

    // 2. Check uniqueness on-chain BEFORE attempting mint (if contract supports it)
    try {
      const isUnique = await contract.isPredictionUnique(predictionHash);
      if (!isUnique) {
        logger.warn(`Prediction hash already exists: ${predictionHash}`);
        throw new BlockchainError(
          BlockchainErrorCode.DUPLICATE_PREDICTION,
          'Prediction with this hash already exists on blockchain',
          409
        );
      }
      logger.info(`Prediction hash is unique, proceeding with mint`);
    } catch (error: any) {
      // If contract doesn't have isPredictionUnique method, skip check
      if (error.message?.includes('is not a function')) {
        logger.warn('Contract does not support isPredictionUnique, skipping uniqueness check');
      } else {
        throw error; // Re-throw if it's a different error
      }
    }

    // 3. Check wallet balance
    const walletBalance = await checkMinterBalance();
    if (!walletBalance.canMint) {
      throw new BlockchainError(
        BlockchainErrorCode.INSUFFICIENT_FUNDS,
        `Insufficient balance: ${walletBalance.balanceEth} (need at least ${ethers.formatEther(walletBalance.minBalance)})`,
        500
      );
    }

    logger.info(`Wallet balance sufficient: ${walletBalance.balanceEth}`);

    // 4. Generate metadata URI
    const metadataURI = `${process.env.BACKEND_URL}/api/predictions/${predictionId}/metadata`;

    // 5. Estimate gas and add 20% buffer
    logger.info(`Estimating gas for mint transaction...`);
    let gasEstimate: bigint;
    try {
      gasEstimate = await contract.mintPrediction.estimateGas(
        userAddress,
        predictionId,
        predictionHash,
        metadataURI
      );
      logger.info(`Gas estimate: ${gasEstimate.toString()}`);
    } catch (error: any) {
      logger.error('Gas estimation failed:', error);
      throw new BlockchainError(
        BlockchainErrorCode.GAS_ESTIMATION_FAILED,
        'Failed to estimate gas for transaction',
        500,
        error
      );
    }

    // 6. Send transaction with gas buffer (20% extra)
    const gasLimit = (gasEstimate * 120n) / 100n;
    logger.info(`Sending mint transaction with gas limit: ${gasLimit.toString()}`);

    const tx = await contract.mintPrediction(
      userAddress,
      predictionId,
      predictionHash,
      metadataURI,
      { gasLimit }
    );

    logger.info(`Transaction sent: ${tx.hash}`);

    // 7. Wait for confirmation with timeout
    const timeoutMs = Number(process.env.BLOCKCHAIN_TRANSACTION_TIMEOUT) || 120000;
    logger.info(`Waiting for confirmation (timeout: ${timeoutMs}ms)...`);

    const receipt = await Promise.race([
      tx.wait(2), // Wait for 2 confirmations
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(
            new BlockchainError(
              BlockchainErrorCode.TRANSACTION_TIMEOUT,
              `Transaction timeout after ${timeoutMs}ms`,
              500
            )
          ),
          timeoutMs
        )
      ),
    ]);

    logger.info(`Transaction confirmed in block: ${receipt.blockNumber}`);

    // 8. Extract tokenId from PredictionMinted event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'PredictionMinted';
      } catch {
        return false;
      }
    });

    if (!event) {
      throw new BlockchainError(
        BlockchainErrorCode.CONTRACT_ERROR,
        'PredictionMinted event not found in transaction logs',
        500
      );
    }

    const parsedEvent = contract.interface.parseLog(event);
    const tokenId = Number(parsedEvent?.args.tokenId);

    logger.info(`NFT minted successfully: Token #${tokenId}`);

    return {
      tokenId,
      transactionHash: receipt.hash,
      predictionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error: any) {
    logger.error('Error minting NFT:', error);

    // Handle different error types
    if (error instanceof BlockchainError) {
      throw error;
    }

    // Parse ethers.js errors
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new BlockchainError(
        BlockchainErrorCode.INSUFFICIENT_FUNDS,
        'Insufficient gas funds in minter wallet',
        500,
        error
      );
    }

    if (error.message?.includes('already exists')) {
      throw new BlockchainError(
        BlockchainErrorCode.DUPLICATE_PREDICTION,
        'Prediction already minted on blockchain',
        409,
        error
      );
    }

    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
      throw new BlockchainError(
        BlockchainErrorCode.NETWORK_ERROR,
        `Network error: ${error.message}`,
        500,
        error
      );
    }

    // Generic blockchain error
    throw new BlockchainError(
      BlockchainErrorCode.CONTRACT_ERROR,
      `Failed to mint NFT: ${error.message}`,
      500,
      error
    );
  }
}

/**
 * Mint with retry logic (exponential backoff)
 *
 * @param userAddress - User wallet address
 * @param predictionId - Prediction ID
 * @param predictionData - Full prediction data
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns MintResult
 */
export async function mintWithRetry(
  userAddress: string,
  predictionId: string,
  predictionData: PredictionData,
  maxRetries: number = 3
): Promise<MintResult> {
  let lastError: BlockchainError | Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Mint attempt ${attempt}/${maxRetries} for prediction ${predictionId}`);
      return await mintPredictionNFT(userAddress, predictionId, predictionData);
    } catch (error: any) {
      lastError = error;

      // Don't retry on uniqueness errors or user errors
      if (error instanceof BlockchainError) {
        if (!error.isRetryable()) {
          logger.error(`Non-retryable error (${error.code}), aborting`);
          throw error;
        }
      }

      if (attempt < maxRetries) {
        // Exponential backoff: 2^attempt seconds
        const delayMs = Math.pow(2, attempt) * 1000;
        logger.warn(`Mint failed (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms...`);
        await sleep(delayMs);
      }
    }
  }

  logger.error(`All ${maxRetries} mint attempts failed`);
  throw lastError!;
}

/**
 * Unlock a prediction NFT after payment
 *
 * @param tokenId - Token ID to unlock
 * @returns Transaction hash of unlock transaction
 */
export async function unlockPredictionNFT(tokenId: number): Promise<string> {
  try {
    if (!isBlockchainEnabled()) {
      throw new BlockchainError(
        BlockchainErrorCode.BLOCKCHAIN_NOT_INITIALIZED,
        'Blockchain is not initialized',
        500
      );
    }

    const contract = getContract();

    // Check if already unlocked
    const prediction = await contract.getPrediction(tokenId);
    if (prediction.unlocked) {
      logger.warn(`NFT token #${tokenId} already unlocked`);
      return ''; // Return empty hash if already unlocked
    }

    logger.info(`Unlocking NFT token #${tokenId}`);

    const tx = await contract.unlockPrediction(tokenId);
    const receipt = await tx.wait(1);

    logger.info(`NFT token #${tokenId} unlocked successfully, tx: ${receipt.hash}`);

    return receipt.hash;
  } catch (error: any) {
    logger.error('Error unlocking NFT:', error);

    if (error instanceof BlockchainError) {
      throw error;
    }

    throw new BlockchainError(
      BlockchainErrorCode.CONTRACT_ERROR,
      `Failed to unlock NFT: ${error.message}`,
      500,
      error
    );
  }
}

export async function getUserNFTs(userAddress: string): Promise<number[]> {
  try {
    const contract = getContract();

    const tokenIds = await contract.getUserPredictions(userAddress);
    return tokenIds.map((id: bigint) => Number(id));
  } catch (error: any) {
    logger.error('Error getting user NFTs:', error);
    return [];
  }
}

export async function getNFTDetails(tokenId: number): Promise<{
  predictionId: string;
  predictionHash: string;
  timestamp: number;
  unlocked: boolean;
}> {
  try {
    const contract = getContract();
    const prediction = await contract.getPrediction(tokenId);
    return {
      predictionId: prediction.predictionId,
      predictionHash: prediction.predictionHash,
      timestamp: Number(prediction.timestamp),
      unlocked: prediction.unlocked,
    };
  } catch (error: any) {
    logger.error('Error getting NFT details:', error);
    throw new AppError('NFT not found', 404);
  }
}