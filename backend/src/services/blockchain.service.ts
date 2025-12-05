import { ethers } from 'ethers';
import { getContract } from '../config/blockchain';
import logger from '../utils/logger';
import { AppError } from '../middleware/error.middleware';

export async function mintPredictionNFT(
  userAddress: string,
  predictionId: string
): Promise<number> {
  try {
    const contract = getContract();

    // Create hash of prediction ID
    const predictionHash = ethers.keccak256(ethers.toUtf8Bytes(predictionId));

    logger.info(`Minting NFT for prediction: ${predictionId} to ${userAddress}`);

    // Call smart contract
    const tx = await contract.mintPrediction(
      userAddress,
      predictionId,
      predictionHash
    );

    logger.info(`Transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();

    logger.info(`Transaction confirmed in block: ${receipt.blockNumber}`);

    // Extract tokenId from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'PredictionMinted';
      } catch {
        return false;
      }
    });

    if (!event) {
      throw new Error('PredictionMinted event not found');
    }

    const parsedEvent = contract.interface.parseLog(event);
    const tokenId = Number(parsedEvent?.args.tokenId);

    logger.info(`NFT minted successfully: Token #${tokenId}`);

    return tokenId;
  } catch (error: any) {
    logger.error('Error minting NFT:', error);
    throw new AppError(`Failed to mint NFT: ${error.message}`, 500);
  }
}

export async function unlockPredictionNFT(tokenId: number): Promise<void> {
  try {
    const contract = getContract();

    logger.info(`Unlocking NFT token #${tokenId}`);

    const tx = await contract.unlockPrediction(tokenId);
    await tx.wait();

    logger.info(`NFT token #${tokenId} unlocked successfully`);
  } catch (error: any) {
    logger.error('Error unlocking NFT:', error);
    throw new AppError(`Failed to unlock NFT: ${error.message}`, 500);
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