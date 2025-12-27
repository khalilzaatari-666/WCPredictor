import * as puppeteerService from './image.service.playwright';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const PREDICTIONS_DIR = path.join(UPLOAD_DIR, 'predictions');
const PREVIEW_DIR = path.join(UPLOAD_DIR, 'previews');

/**
 * Generate bracket image and thumbnail using Puppeteer (POST-PAYMENT)
 * @param prediction - The prediction data
 * @param username - The username of the predictor
 * @param predictionId - The unique prediction ID
 * @param blockchainData - Blockchain/NFT data from minting
 * @returns Object containing full image buffer and thumbnail buffer
 */
export async function generateBracketImage(
  prediction: any,
  username: string,
  predictionId: string,
  blockchainData?: {
    tokenId: number | null;
    nftHash: string | null;
    transactionHash: string | null;
  }
): Promise<{ imageBuffer: Buffer; thumbnailBuffer: Buffer }> {
  try {
    // Ensure upload directories exist
    await fs.mkdir(PREDICTIONS_DIR, { recursive: true });

    // Generate full image with blockchain data (post-payment)
    const { imageBuffer, thumbnailBuffer } = await puppeteerService.generateBracketImage(
      prediction,
      username,
      predictionId,
      blockchainData
    );

    logger.info(`Generated bracket image with blockchain data for prediction: ${predictionId}`);

    return { imageBuffer, thumbnailBuffer };
  } catch (error) {
    logger.error('Error generating bracket image:', error);
    throw new Error('Failed to generate bracket image');
  }
}

/**
 * Generate a blurred preview image for payment page (before payment is confirmed)
 * Shows the full bracket with prediction data, but blurred and without blockchain data
 * @param prediction - The prediction data
 * @param username - The username of the predictor
 * @returns Blurred preview buffer
 */
export async function generateBlurredPreview(
  prediction: any,
  username: string
): Promise<Buffer> {
  try {
    await fs.mkdir(PREVIEW_DIR, { recursive: true });

    // Generate full bracket WITHOUT blockchain data (payment not confirmed yet)
    const { thumbnailBuffer } = await puppeteerService.generateBracketImage(
      prediction,
      username,
      'preview-temp-id',
      undefined // No blockchain data yet
    );

    // Apply light blur for preview
    const blurredPreview = await sharp(thumbnailBuffer)
      .blur(3)
      .modulate({ brightness: 0.9 })
      .toBuffer();

    logger.info('Generated blurred preview with prediction data');
    return blurredPreview;
  } catch (error) {
    logger.error('Error generating blurred preview:', error);
    throw new Error('Failed to generate blurred preview');
  }
}


/**
 * Save the full prediction image to permanent storage
 * This is called after successful payment
 * @param buffer - The image buffer
 * @param predictionId - The prediction ID
 * @returns The public URL path to the saved image
 */
export async function savePredictionImage(buffer: Buffer, predictionId: string): Promise<string> {
  try {
    const filename = `${predictionId}-full.png`;
    const filepath = path.join(PREDICTIONS_DIR, filename);
    await fs.writeFile(filepath, buffer);

    logger.info(`Saved prediction image: ${filename}`);
    return `/uploads/predictions/${filename}`;
  } catch (error) {
    logger.error('Error saving prediction image:', error);
    throw new Error('Failed to save prediction image');
  }
}

/**
 * Save the thumbnail image
 * @param buffer - The thumbnail buffer
 * @param predictionId - The prediction ID
 * @returns The public URL path to the saved thumbnail
 */
export async function savePredictionThumbnail(buffer: Buffer, predictionId: string): Promise<string> {
  try {
    const filename = `${predictionId}-thumb.png`;
    const filepath = path.join(PREDICTIONS_DIR, filename);
    await fs.writeFile(filepath, buffer);

    logger.info(`Saved prediction thumbnail: ${filename}`);
    return `/uploads/predictions/${filename}`;
  } catch (error) {
    logger.error('Error saving prediction thumbnail:', error);
    throw new Error('Failed to save prediction thumbnail');
  }
}

/**
 * Save the blurred thumbnail for payment page preview
 * @param buffer - The blurred thumbnail buffer
 * @param predictionId - The prediction ID
 * @returns The public URL path to the saved blurred thumbnail
 */
export async function saveBlurredThumbnail(buffer: Buffer, predictionId: string): Promise<string> {
  try {
    const filename = `${predictionId}-blur.png`;
    const filepath = path.join(PREDICTIONS_DIR, filename);
    await fs.writeFile(filepath, buffer);

    logger.info(`Saved blurred thumbnail: ${filename}`);
    return `/uploads/predictions/${filename}`;
  } catch (error) {
    logger.error('Error saving blurred thumbnail:', error);
    throw new Error('Failed to save blurred thumbnail');
  }
}

/**
 * Save all image variants for a prediction
 * @param imageBuffer - The full image buffer
 * @param thumbnailBuffer - The thumbnail buffer
 * @param blurredThumbnail - The blurred thumbnail buffer
 * @param predictionId - The prediction ID
 * @returns Object containing all image URLs
 */
export async function savePredictionImages(
  imageBuffer: Buffer,
  thumbnailBuffer: Buffer,
  blurredThumbnail: Buffer,
  predictionId: string
): Promise<{ fullImageUrl: string; thumbnailUrl: string; blurredUrl: string }> {
  try {
    const [fullImageUrl, thumbnailUrl, blurredUrl] = await Promise.all([
      savePredictionImage(imageBuffer, predictionId),
      savePredictionThumbnail(thumbnailBuffer, predictionId),
      saveBlurredThumbnail(blurredThumbnail, predictionId),
    ]);

    return { fullImageUrl, thumbnailUrl, blurredUrl };
  } catch (error) {
    logger.error('Error saving prediction images:', error);
    throw new Error('Failed to save prediction images');
  }
}

/**
 * Get the full image path for a prediction
 * @param predictionId - The prediction ID
 * @returns The full file system path to the image
 */
export async function getPredictionImagePath(predictionId: string): Promise<string | null> {
  try {
    const filename = `${predictionId}-full.png`;
    const filepath = path.join(PREDICTIONS_DIR, filename);

    // Check if file exists
    await fs.access(filepath);
    return filepath;
  } catch (error) {
    logger.warn(`Prediction image not found: ${predictionId}`);
    return null;
  }
}

/**
 * Check if a prediction image exists
 * @param predictionId - The prediction ID
 * @returns True if the image exists, false otherwise
 */
export async function predictionImageExists(predictionId: string): Promise<boolean> {
  const imagePath = await getPredictionImagePath(predictionId);
  return imagePath !== null;
}

/**
 * Delete all images associated with a prediction
 * @param predictionId - The prediction ID
 */
export async function deletePredictionImages(predictionId: string): Promise<void> {
  try {
    const filenames = [
      `${predictionId}-full.png`,
      `${predictionId}-thumb.png`,
      `${predictionId}-blur.png`,
    ];

    await Promise.all(
      filenames.map(async (filename) => {
        try {
          const filepath = path.join(PREDICTIONS_DIR, filename);
          await fs.unlink(filepath);
          logger.info(`Deleted image: ${filename}`);
        } catch (error) {
          // Ignore if file doesn't exist
          logger.debug(`File not found (skipping): ${filename}`);
        }
      })
    );
  } catch (error) {
    logger.error('Error deleting prediction images:', error);
  }
}

/**
 * Legacy save image function for backwards compatibility
 */
export async function saveImage(buffer: Buffer, filename: string): Promise<string> {
  const filepath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filepath, buffer);
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  return `${backendUrl}/uploads/${filename}`;
}

/**
 * Legacy delete image function for backwards compatibility
 */
export async function deleteImage(filepath: string): Promise<void> {
  try {
    const fullPath = path.join(__dirname, '../../', filepath);
    await fs.unlink(fullPath);
    logger.info(`Deleted image: ${filepath}`);
  } catch (error) {
    logger.error('Error deleting image:', error);
  }
}

/**
 * Cleanup browser instance on application shutdown
 */
export async function cleanup(): Promise<void> {
  await puppeteerService.closeBrowser();
}