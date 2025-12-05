import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger';

const CANVAS_WIDTH = 3000;
const CANVAS_HEIGHT = 4000;
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

export async function generateBracketImage(
  prediction: any,
  username: string,
  predictionId: string
): Promise<{ imageBuffer: Buffer; thumbnailBuffer: Buffer }> {
  try {
    // Ensure upload directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1e3a8a'); // Blue
    gradient.addColorStop(0.5, '#4c1d95'); // Purple
    gradient.addColorStop(1, '#1e3a8a'); // Blue
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw decorative elements
    drawBackgroundPattern(ctx);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 140px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FIFA WORLD CUP 2026', CANVAS_WIDTH / 2, 180);

    // Username
    ctx.font = 'bold 100px Arial';
    ctx.fillStyle = '#fbbf24'; // Gold
    ctx.fillText(`${username}'s Prediction`, CANVAS_WIDTH / 2, 310);

    // Draw bracket visualization
    await drawBracketTree(ctx, prediction);

    // Champion section
    drawChampionSection(ctx, prediction.champion, CANVAS_HEIGHT - 600);

    // Prediction ID
    ctx.fillStyle = '#94a3b8';
    ctx.font = '60px Arial';
    ctx.fillText(`ID: ${predictionId}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 120);

    // Footer
    ctx.font = '50px Arial';
    ctx.fillText('WC2026Predictor.com', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50);

    // Generate full image
    const imageBuffer = canvas.toBuffer('image/png', { compressionLevel: 6 });

    // Generate thumbnail
    const thumbnailCanvas = createCanvas(600, 800);
    const thumbCtx = thumbnailCanvas.getContext('2d');
    thumbCtx.drawImage(canvas, 0, 0, 600, 800);
    const thumbnailBuffer = thumbnailCanvas.toBuffer('image/png', { compressionLevel: 6 });

    logger.info(`Generated bracket image for prediction: ${predictionId}`);

    return { imageBuffer, thumbnailBuffer };
  } catch (error) {
    logger.error('Error generating bracket image:', error);
    throw new Error('Failed to generate bracket image');
  }
}

function drawBackgroundPattern(ctx: CanvasRenderingContext2D) {
  // Draw subtle soccer ball pattern in background
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;

  for (let i = 0; i < 20; i++) {
    const x = Math.random() * CANVAS_WIDTH;
    const y = Math.random() * CANVAS_HEIGHT;
    const radius = 50 + Math.random() * 100;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

async function drawBracketTree(ctx: CanvasRenderingContext2D, prediction: any) {
  const startY = 500;
  const columnSpacing = 350;
  const matchHeight = 100;

  // Convert round data to arrays if needed
  const r32Matches = Array.isArray(prediction.roundOf32) ? prediction.roundOf32 : Object.values(prediction.roundOf32 || {});
  const r16Matches = Array.isArray(prediction.roundOf16) ? prediction.roundOf16 : Object.values(prediction.roundOf16 || {});
  const qfMatches = Array.isArray(prediction.quarterFinals) ? prediction.quarterFinals : Object.values(prediction.quarterFinals || {});
  const sfMatches = Array.isArray(prediction.semiFinals) ? prediction.semiFinals : Object.values(prediction.semiFinals || {});

  // Left side of bracket
  // Round of 32 - Left
  drawRoundVertical(ctx, 'ROUND OF 32', 150, startY, r32Matches.slice(0, 8), matchHeight * 0.8, 8);

  // Round of 16 - Left
  drawRoundVertical(ctx, 'ROUND OF 16', 150 + columnSpacing, startY + matchHeight * 0.4, r16Matches.slice(0, 4), matchHeight * 1.6, 4);

  // Quarter Finals - Left
  drawRoundVertical(ctx, 'QF', 150 + columnSpacing * 2, startY + matchHeight * 1.6, qfMatches.slice(0, 2), matchHeight * 3.2, 2);

  // Semi Finals - Left
  drawRoundVertical(ctx, 'SEMI-FINAL 1', 150 + columnSpacing * 3, startY + matchHeight * 3.2, [sfMatches[0]], matchHeight * 6.4, 1);

  // Center - Final and 3rd Place
  const centerX = CANVAS_WIDTH / 2 - 150;
  const centerY = startY + matchHeight * 3.2;

  // Final
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 70px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('FINAL', centerX + 150, centerY - 80);
  if (prediction.final) {
    drawMatch(ctx, centerX, centerY, prediction.final, true);
  }

  // 3rd Place
  ctx.fillStyle = '#fb923c';
  ctx.font = 'bold 60px Arial';
  ctx.fillText('3RD PLACE', centerX + 150, centerY + 200);
  if (prediction.thirdPlace) {
    drawMatch(ctx, centerX, centerY + 240, prediction.thirdPlace);
  }

  // Right side of bracket
  // Semi Finals - Right
  drawRoundVertical(ctx, 'SEMI-FINAL 2', CANVAS_WIDTH - 500, startY + matchHeight * 3.2, [sfMatches[1]], matchHeight * 6.4, 1);

  // Quarter Finals - Right
  drawRoundVertical(ctx, 'QF', CANVAS_WIDTH - 500 - columnSpacing, startY + matchHeight * 1.6, qfMatches.slice(2, 4), matchHeight * 3.2, 2);

  // Round of 16 - Right
  drawRoundVertical(ctx, 'ROUND OF 16', CANVAS_WIDTH - 500 - columnSpacing * 2, startY + matchHeight * 0.4, r16Matches.slice(4, 8), matchHeight * 1.6, 4);

  // Round of 32 - Right
  drawRoundVertical(ctx, 'ROUND OF 32', CANVAS_WIDTH - 500 - columnSpacing * 3, startY, r32Matches.slice(8, 16), matchHeight * 0.8, 8);
}

function drawRoundVertical(
  ctx: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
  matches: any[],
  spacing: number,
  count: number
) {
  // Round label
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 50px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + 150, y - 50);

  // Draw matches
  const matchArray = (matches || []).slice(0, count);

  matchArray.forEach((match: any, idx: number) => {
    const matchY = y + idx * spacing;
    if (match) {
      drawMatch(ctx, x, matchY, match);
    }
  });
}

function drawMatch(ctx: CanvasRenderingContext2D, x: number, y: number, match: any, isFinal: boolean = false) {
  const width = 300;
  const height = 100;

  // Match box
  if (isFinal) {
    ctx.fillStyle = 'rgba(251, 191, 36, 0.2)'; // Gold background for final
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#fbbf24'; // Gold border
    ctx.lineWidth = 5;
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
  }

  ctx.strokeRect(x, y, width, height);

  // Team names
  ctx.fillStyle = '#ffffff';
  ctx.font = isFinal ? 'bold 36px Arial' : '32px Arial';
  ctx.textAlign = 'left';

  if (match?.team1) {
    const isWinner = match.winner === match.team1;
    ctx.fillStyle = isWinner ? '#fbbf24' : '#ffffff';
    ctx.fillText(truncateText(match.team1, 12), x + 20, y + 35);
  }

  if (match?.team2) {
    const isWinner = match.winner === match.team2;
    ctx.fillStyle = isWinner ? '#fbbf24' : '#ffffff';
    ctx.fillText(truncateText(match.team2, 12), x + 20, y + 70);
  }

  // Winner checkmark
  if (match?.winner) {
    ctx.fillStyle = '#10b981'; // Green
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('✓', x + width - 20, y + (match.winner === match.team1 ? 35 : 70));
  }
}

function drawChampionSection(ctx: CanvasRenderingContext2D, champion: string, y: number) {
  // Trophy/crown decoration
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 140px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🏆', CANVAS_WIDTH / 2, y);

  // Champion label
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 100px Arial';
  ctx.fillText('CHAMPION', CANVAS_WIDTH / 2, y + 120);

  // Champion name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 130px Arial';
  ctx.fillText(champion || 'TBD', CANVAS_WIDTH / 2, y + 260);

  // Decorative box
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 5;
  ctx.strokeRect(
    CANVAS_WIDTH / 2 - 500,
    y - 80,
    1000,
    400
  );
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export async function saveImage(buffer: Buffer, filename: string): Promise<string> {
  const filepath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filepath, buffer);
  return `/uploads/${filename}`;
}

export async function deleteImage(filepath: string): Promise<void> {
  try {
    const fullPath = path.join(__dirname, '../../', filepath);
    await fs.unlink(fullPath);
    logger.info(`Deleted image: ${filepath}`);
  } catch (error) {
    logger.error('Error deleting image:', error);
  }
}