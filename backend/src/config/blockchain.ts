import { ethers } from 'ethers';
import PredictionNFT from './PredictionNFT.json';
import logger from '../utils/logger';

// Blockchain is optional - app works without it
let provider: ethers.JsonRpcProvider | null = null;
let wallet: ethers.Wallet | null = null;
let contract: ethers.Contract | null = null;

export const BLOCKCHAIN_CONFIG = {
  network: process.env.NETWORK || 'amoy',
  contractAddress: process.env.CONTRACT_ADDRESS || '',
  enabled: false,
};

// Initialize blockchain connection (optional)
export function initializeBlockchain() {
  try {
    if (!process.env.RPC_URL || !process.env.PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
      logger.warn('⚠️ Blockchain configuration incomplete - running without NFT features');
      return;
    }

    // Create provider with static network to avoid ENS issues
    const network = ethers.Network.from({
      name: process.env.NETWORK || 'matic-amoy',
      chainId: 80002, // Polygon Amoy testnet
    });

    provider = new ethers.JsonRpcProvider(
      process.env.RPC_URL,
      network,
      {
        staticNetwork: true,
      }
    );

    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      PredictionNFT.abi,
      wallet
    );

    BLOCKCHAIN_CONFIG.enabled = true;
    BLOCKCHAIN_CONFIG.contractAddress = process.env.CONTRACT_ADDRESS;

    logger.info('✅ Blockchain initialized successfully', {
      network: BLOCKCHAIN_CONFIG.network,
      contractAddress: BLOCKCHAIN_CONFIG.contractAddress,
    });
  } catch (error: any) {
    logger.error('⚠️ Blockchain initialization failed:', error.message);
    logger.warn('App will continue without blockchain features');
  }
}

// Export getters to ensure safe access
export function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    throw new Error('Blockchain not initialized');
  }
  return provider;
}

export function getWallet(): ethers.Wallet {
  if (!wallet) {
    throw new Error('Blockchain not initialized');
  }
  return wallet;
}

export function getContract(): ethers.Contract {
  if (!contract) {
    throw new Error('Blockchain not initialized');
  }
  return contract;
}

export function isBlockchainEnabled(): boolean {
  return BLOCKCHAIN_CONFIG.enabled;
}