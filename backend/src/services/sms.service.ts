import twilio from 'twilio';
import logger from '../utils/logger';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: twilio.Twilio | null = null;

// Initialize Twilio client if credentials are provided
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  logger.info('Twilio SMS service initialized');
} else {
  logger.warn('Twilio credentials not found. SMS service disabled.');
}

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP code via SMS
 */
export async function sendOTP(
  phoneNumber: string,
  code: string
): Promise<void> {
  if (!twilioClient) {
    logger.error('Twilio client not initialized');
    throw new Error('SMS service is not configured');
  }

  if (!TWILIO_PHONE_NUMBER) {
    logger.error('Twilio phone number not configured');
    throw new Error('SMS service is not configured properly');
  }

  // Format phone number to E.164 format if needed
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

  try {
    const message = await twilioClient.messages.create({
      body: `Your World Cup 2026 Predictor verification code is: ${code}. This code will expire in 10 minutes.`,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    logger.info(`OTP sent to ${phoneNumber}. SID: ${message.sid}`);
  } catch (error) {
    logger.error('Error sending OTP:', error);
    throw new Error('Failed to send verification code');
  }
}

/**
 * Send a custom SMS message
 */
export async function sendSMS(
  phoneNumber: string,
  message: string
): Promise<void> {
  if (!twilioClient) {
    logger.error('Twilio client not initialized');
    throw new Error('SMS service is not configured');
  }

  if (!TWILIO_PHONE_NUMBER) {
    logger.error('Twilio phone number not configured');
    throw new Error('SMS service is not configured properly');
  }

  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

  try {
    const msg = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    logger.info(`SMS sent to ${phoneNumber}. SID: ${msg.sid}`);
  } catch (error) {
    logger.error('Error sending SMS:', error);
    throw new Error('Failed to send SMS');
  }
}
