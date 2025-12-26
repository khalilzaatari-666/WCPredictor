/// <reference lib="dom" />
import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';
import logger from '../utils/logger';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const CANVAS_WIDTH = 3840;
const CANVAS_HEIGHT = 2160;
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const TEMPLATES_DIR = path.join(__dirname, '../../templates');

// Flag URLs - Using flagcdn.com CDN for high-quality flags
const FLAG_BASE_URL = 'https://flagcdn.com/w80';

// Country code mapping (ISO 3166-1 alpha-2) - World Cup 2026 Qualified Teams
const COUNTRY_CODES: Record<string, string> = {
  // Group A
  'Mexico': 'mx',
  'South Africa': 'za',
  'South Korea': 'kr',
  // Group B
  'Canada': 'ca',
  'Qatar': 'qa',
  'Switzerland': 'ch',
  // Group C
  'Brazil': 'br',
  'Morocco': 'ma',
  'Haiti': 'ht',
  'Scotland': 'gb-sct',
  // Group D
  'USA': 'us',
  'Paraguay': 'py',
  'Australia': 'au',
  // Group E
  'Germany': 'de',
  'Curaçao': 'cw',
  'Côte d\'Ivoire': 'ci',
  'Ecuador': 'ec',
  // Group F
  'Netherlands': 'nl',
  'Japan': 'jp',
  'Tunisia': 'tn',
  // Group G
  'Belgium': 'be',
  'Egypt': 'eg',
  'IR Iran': 'ir',
  'New Zealand': 'nz',
  // Group H
  'Spain': 'es',
  'Cabo Verde': 'cv',
  'Saudi Arabia': 'sa',
  'Uruguay': 'uy',
  // Group I
  'France': 'fr',
  'Senegal': 'sn',
  'Norway': 'no',
  // Group J
  'Argentina': 'ar',
  'Algeria': 'dz',
  'Austria': 'at',
  'Jordan': 'jo',
  // Group K
  'Portugal': 'pt',
  'Uzbekistan': 'uz',
  'Colombia': 'co',
  // Group L
  'England': 'gb-eng',
  'Croatia': 'hr',
  'Ghana': 'gh',
  'Panama': 'pa',
  // Playoff Winners (generic flags)
  'Winner UEFA PO A (ITA/WAL/NIR/BIH)': 'eu',
  'Winner UEFA PO B (SWE/UKR/POL/ALB)': 'eu',
  'Winner UEFA PO C (TUR/ROU/SVK/KOS)': 'eu',
  'Winner UEFA PO D (DEN/CZE/IRL/MKD)': 'eu',
  'Winner FIFA PO 1 (COD/JAM/NCL)': 'un',
  'Winner FIFA PO 2 (IRQ/BOL/SUR)': 'un',
  // Potential playoff teams
  'Italy': 'it',
  'Wales': 'gb-wls',
  'Northern Ireland': 'gb-nir',
  'Bosnia and Herzegovina': 'ba',
  'Sweden': 'se',
  'Ukraine': 'ua',
  'Poland': 'pl',
  'Albania': 'al',
  'Turkey': 'tr',
  'Romania': 'ro',
  'Slovakia': 'sk',
  'Kosovo': 'xk',
  'Denmark': 'dk',
  'Czech Republic': 'cz',
  'Ireland': 'ie',
  'North Macedonia': 'mk',
  'Iraq': 'iq',
  'Bolivia': 'bo',
  'Suriname': 'sr',
  'DR Congo': 'cd',
  'Jamaica': 'jm',
  'New Caledonia': 'nc',
  // Placeholder
  'TBD': 'xx',
};

// Browser instance for reuse
let browserInstance: Browser | null = null;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export async function generateBracketImage(
  prediction: any,
  username: string,
  predictionId: string,
  blockchainData?: {
    tokenId?: number | null;
    nftHash?: string | null;
    transactionHash?: string | null;
  }
): Promise<{ imageBuffer: Buffer; thumbnailBuffer: Buffer }> {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    // Load and compile template
    const templateData = await prepareTemplateData(prediction, username, predictionId, blockchainData);
    const html = await renderTemplate(templateData);

    // Generate image using Puppeteer
    const imageBuffer = await renderHtmlToImage(html);

    // Generate thumbnail
    const thumbnailBuffer = await generateThumbnail(imageBuffer);

    logger.info(`Generated bracket image for prediction: ${predictionId}`);
    return { imageBuffer, thumbnailBuffer };
  } catch (error) {
    logger.error('Error generating bracket image:', error);
    throw new Error('Failed to generate bracket image');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE DATA PREPARATION
// ═══════════════════════════════════════════════════════════════════════════════

async function prepareTemplateData(
  prediction: any,
  username: string,
  predictionId: string,
  blockchainData?: {
    tokenId?: number | null;
    nftHash?: string | null;
    transactionHash?: string | null;
  }
): Promise<Record<string, any>> {
  // Use blockchain data if available, otherwise use predictionId as fallback
  const nftHash = blockchainData?.nftHash || predictionId;
  const tokenId = blockchainData?.tokenId || null;
  const txHash = blockchainData?.transactionHash || null;

  const data: Record<string, any> = {
    username,
    date: new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    // NFT & Blockchain data
    nft_id: tokenId ? `#${tokenId}` : 'Pending',
    proof: nftHash,
    proof_short: nftHash.slice(0, 12) + '...',
    transaction_hash: txHash ? txHash.slice(0, 10) + '...' + txHash.slice(-8) : 'Pending',
    transaction_hash_full: txHash || 'Pending',
    // URLs
    year: new Date().getFullYear(),
    verify_url: `https://bracket.app/verify/${predictionId}`,
    qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://bracket.app/verify/${predictionId}`,
    trophy_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/FIFA_World_Cup_Trophy.png/180px-FIFA_World_Cup_Trophy.png',
  };

  // Parse round data
  const r32 = parseRoundData(prediction.roundOf32, 16);
  const r16 = parseRoundData(prediction.roundOf16, 8);
  const qf = parseRoundData(prediction.quarterFinals, 4);
  const sf = parseRoundData(prediction.semiFinals, 2);
  const final = prediction.final || { team1: 'TBD', team2: 'TBD', winner: null };
  const thirdPlace = prediction.thirdPlace || { team1: 'TBD', team2: 'TBD', winner: null };
  const champion = prediction.champion || 'TBD';

  // R32 Left (8 pairs = 16 teams)
  for (let i = 0; i < 8; i++) {
    const match = r32[i] || { team1: 'TBD', team2: 'TBD' };
    data[`r32_L${i + 1}_a_name`] = match.team1 || 'TBD';
    data[`r32_L${i + 1}_a_flag`] = getFlagUrl(match.team1);
    data[`r32_L${i + 1}_b_name`] = match.team2 || 'TBD';
    data[`r32_L${i + 1}_b_flag`] = getFlagUrl(match.team2);
  }

  // R32 Right (8 pairs = 16 teams)
  for (let i = 0; i < 8; i++) {
    const match = r32[i + 8] || { team1: 'TBD', team2: 'TBD' };
    data[`r32_R${i + 1}_a_name`] = match.team1 || 'TBD';
    data[`r32_R${i + 1}_a_flag`] = getFlagUrl(match.team1);
    data[`r32_R${i + 1}_b_name`] = match.team2 || 'TBD';
    data[`r32_R${i + 1}_b_flag`] = getFlagUrl(match.team2);
  }

  // R16 Left (4 pairs = 8 teams)
  for (let i = 0; i < 4; i++) {
    const match = r16[i] || { team1: 'TBD', team2: 'TBD' };
    data[`r16_L${i + 1}_a_name`] = match.team1 || 'TBD';
    data[`r16_L${i + 1}_a_flag`] = getFlagUrl(match.team1);
    data[`r16_L${i + 1}_b_name`] = match.team2 || 'TBD';
    data[`r16_L${i + 1}_b_flag`] = getFlagUrl(match.team2);
  }

  // R16 Right (4 pairs = 8 teams)
  for (let i = 0; i < 4; i++) {
    const match = r16[i + 4] || { team1: 'TBD', team2: 'TBD' };
    data[`r16_R${i + 1}_a_name`] = match.team1 || 'TBD';
    data[`r16_R${i + 1}_a_flag`] = getFlagUrl(match.team1);
    data[`r16_R${i + 1}_b_name`] = match.team2 || 'TBD';
    data[`r16_R${i + 1}_b_flag`] = getFlagUrl(match.team2);
  }

  // QF Left (2 pairs = 4 teams)
  for (let i = 0; i < 2; i++) {
    const match = qf[i] || { team1: 'TBD', team2: 'TBD' };
    data[`qf_L${i + 1}_a_name`] = match.team1 || 'TBD';
    data[`qf_L${i + 1}_a_flag`] = getFlagUrl(match.team1);
    data[`qf_L${i + 1}_b_name`] = match.team2 || 'TBD';
    data[`qf_L${i + 1}_b_flag`] = getFlagUrl(match.team2);
  }

  // QF Right (2 pairs = 4 teams)
  for (let i = 0; i < 2; i++) {
    const match = qf[i + 2] || { team1: 'TBD', team2: 'TBD' };
    data[`qf_R${i + 1}_a_name`] = match.team1 || 'TBD';
    data[`qf_R${i + 1}_a_flag`] = getFlagUrl(match.team1);
    data[`qf_R${i + 1}_b_name`] = match.team2 || 'TBD';
    data[`qf_R${i + 1}_b_flag`] = getFlagUrl(match.team2);
  }

  // SF Left (1 pair = 2 teams)
  const sfLeft = sf[0] || { team1: 'TBD', team2: 'TBD' };
  data['sf_L1_a_name'] = sfLeft.team1 || 'TBD';
  data['sf_L1_a_flag'] = getFlagUrl(sfLeft.team1);
  data['sf_L1_b_name'] = sfLeft.team2 || 'TBD';
  data['sf_L1_b_flag'] = getFlagUrl(sfLeft.team2);

  // SF Right (1 pair = 2 teams)
  const sfRight = sf[1] || { team1: 'TBD', team2: 'TBD' };
  data['sf_R1_a_name'] = sfRight.team1 || 'TBD';
  data['sf_R1_a_flag'] = getFlagUrl(sfRight.team1);
  data['sf_R1_b_name'] = sfRight.team2 || 'TBD';
  data['sf_R1_b_flag'] = getFlagUrl(sfRight.team2);

  // Final
  data['final_a_name'] = final.team1 || 'TBD';
  data['final_a_flag'] = getFlagUrl(final.team1);
  data['final_a_winner_class'] = final.winner === final.team1 ? 'winner' : '';
  data['final_b_name'] = final.team2 || 'TBD';
  data['final_b_flag'] = getFlagUrl(final.team2);
  data['final_b_winner_class'] = final.winner === final.team2 ? 'winner' : '';

  // Champion
  data['winner_name'] = champion;
  data['winner_flag'] = getFlagUrl(champion);

  // Third place
  data['third_a_name'] = thirdPlace.team1 || 'TBD';
  data['third_a_flag'] = getFlagUrl(thirdPlace.team1);
  data['third_b_name'] = thirdPlace.team2 || 'TBD';
  data['third_b_flag'] = getFlagUrl(thirdPlace.team2);

  return data;
}

function parseRoundData(data: any, expectedCount: number): any[] {
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && data !== null) return Object.values(data);
  return Array(expectedCount).fill({ team1: 'TBD', team2: 'TBD', winner: null });
}

function getFlagUrl(teamName: string | null | undefined): string {
  if (!teamName || teamName === 'TBD') {
    // Return a placeholder/generic flag
    return 'https://via.placeholder.com/80x53/1e293b/64748b?text=TBD';
  }
  
  const code = COUNTRY_CODES[teamName];
  if (code && code !== 'xx') {
    return `${FLAG_BASE_URL}/${code}.png`;
  }
  
  // Fallback: try lowercase team name
  return `${FLAG_BASE_URL}/${teamName.toLowerCase().replace(/\s+/g, '-')}.png`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE RENDERING
// ═══════════════════════════════════════════════════════════════════════════════

async function renderTemplate(data: Record<string, any>): Promise<string> {
  // Read template file
  const templatePath = path.join(TEMPLATES_DIR, 'template.html');
  const cssPath = path.join(TEMPLATES_DIR, 'template.css');
  
  let templateHtml: string;
  let css: string;
  
  try {
    templateHtml = await fs.readFile(templatePath, 'utf-8');
    css = await fs.readFile(cssPath, 'utf-8');
  } catch (error) {
    // Fallback: use inline template
    logger.warn('Template files not found, using inline template');
    return generateInlineHtml(data);
  }
  
  // Inject CSS inline
  templateHtml = templateHtml.replace(
    '<link rel="stylesheet" href="bracket-tree-styles.css">',
    `<style>${css}</style>`
  );
  
  // Compile with Handlebars
  const template = Handlebars.compile(templateHtml);
  return template(data);
}

function generateInlineHtml(data: Record<string, any>): string {
  // Fallback inline template (simplified version)
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, sans-serif; 
      background: #020617; 
      color: #f8fafc;
      width: 3840px;
      height: 2160px;
      padding: 60px;
    }
    .title { font-size: 64px; font-weight: 900; margin-bottom: 40px; }
    .bracket { display: flex; justify-content: center; align-items: center; height: 80%; }
    .champion { 
      text-align: center; 
      padding: 40px; 
      background: rgba(250,204,21,0.1); 
      border: 2px solid #facc15;
      border-radius: 20px;
    }
    .champion-name { font-size: 48px; font-weight: 900; color: #facc15; }
  </style>
</head>
<body>
  <div class="title">WORLD CUP 2026 — PREDICTION BRACKET</div>
  <div class="subtitle">Prédiction de ${data.username} le ${data.date}</div>
  <div class="bracket">
    <div class="champion">
      <div>🏆 CHAMPION</div>
      <div class="champion-name">${data.winner_name}</div>
    </div>
  </div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE RENDERING WITH PUPPETEER
// ═══════════════════════════════════════════════════════════════════════════════

async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    // The Dockerfile sets PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
    // If not set (local dev), try common locations or use bundled Chromium
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_BIN;

    logger.info(`Launching browser with executable: ${executablePath || 'bundled Chromium'}`);

    browserInstance = await puppeteer.launch({
      headless: true,
      executablePath: executablePath || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
      ],
    });

    logger.info('Browser launched successfully');
  }
  return browserInstance;
}

async function renderHtmlToImage(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    // Set viewport to match our canvas size
    await page.setViewport({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      deviceScaleFactor: 1,
    });
    
    // Load HTML content
    await page.setContent(html, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000,
    });
    
    // Wait for fonts and images to load
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 1000)); // Extra time for images and JavaScript
    
    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
      },
    });
    
    return screenshot as Buffer;
  } finally {
    await page.close();
  }
}

async function generateThumbnail(imageBuffer: Buffer): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Thumbnail dimensions (16:9 ratio)
    const thumbWidth = 1280;
    const thumbHeight = 720;
    
    await page.setViewport({
      width: thumbWidth,
      height: thumbHeight,
      deviceScaleFactor: 1,
    });
    
    // Create an HTML page that displays the image scaled down
    const base64Image = imageBuffer.toString('base64');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; }
          body { 
            width: ${thumbWidth}px; 
            height: ${thumbHeight}px; 
            overflow: hidden;
          }
          img { 
            width: 100%; 
            height: 100%; 
            object-fit: cover;
          }
        </style>
      </head>
      <body>
        <img src="data:image/png;base64,${base64Image}" />
      </body>
      </html>
    `;
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const thumbnail = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: thumbWidth, height: thumbHeight },
    });
    
    return thumbnail as Buffer;
  } finally {
    await page.close();
  }
}

// Cleanup function - call on app shutdown
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export async function saveImage(buffer: Buffer, filename: string): Promise<string> {
  const filepath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filepath, buffer);
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  return `${backendUrl}/uploads/${filename}`;
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