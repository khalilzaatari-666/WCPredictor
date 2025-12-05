import QRCode from 'qrcode';
import logger from '../utils/logger';

export async function generateQRCode(url: string): Promise<Buffer> {
  try {
    const qrBuffer = await QRCode.toBuffer(url, {
      width: 500,
      margin: 2,
      color: {
        dark: '#1e3a8a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });

    logger.debug(`Generated QR code for URL: ${url}`);
    return qrBuffer;
  } catch (error) {
    logger.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

export async function generateQRCodeDataURL(url: string): Promise<string> {
  try {
    const dataURL = await QRCode.toDataURL(url, {
      width: 500,
      margin: 2,
      errorCorrectionLevel: 'H',
    });

    return dataURL;
  } catch (error) {
    logger.error('Error generating QR code data URL:', error);
    throw new Error('Failed to generate QR code');
  }
}