export interface PaymentIntentData {
  predictionId: string;
}

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentConfirmation {
  paymentIntentId: string;
  predictionId: string;
}

export interface PaymentResponse {
  success: boolean;
  imageUrl: string;
  thumbnailUrl: string;
  qrCodeUrl: string;
  tokenId?: number;
}

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  createdAt: Date;
  completedAt?: Date;
}