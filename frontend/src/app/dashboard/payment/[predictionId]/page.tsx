'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Lock, CreditCard, Wallet, Check, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function PaymentPage() {
  const params = useParams();
  const predictionId = params.predictionId as string;

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-wc-gold" />
            <h1 className="text-4xl font-bold">Complete Your Prediction</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Your prediction is ready! Complete payment to unlock your official bracket image.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Preview Section */}
          <PreviewSection predictionId={predictionId} />

          {/* Payment Section */}
          <Elements stripe={stripePromise}>
            <PaymentSection predictionId={predictionId} />
          </Elements>
        </div>
      </div>
    </div>
  );
}

function PreviewSection({ predictionId }: { predictionId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Lock className="w-6 h-6 text-wc-gold" />
          Your Prediction Preview
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          This is a preview of your prediction. Complete payment to unlock the full image with your name and prediction ID.
        </p>
      </div>

      {/* Blurred Bracket Preview */}
      <div className="relative rounded-lg overflow-hidden border-2 border-wc-gold/30">
        <div className="relative">
          <img
            src="/api/placeholder/600/400"
            alt="Bracket Preview"
            className="w-full h-auto blur-md"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <Lock className="w-16 h-16 text-wc-gold mx-auto mb-4" />
              <p className="text-2xl font-bold text-white mb-2">Locked</p>
              <p className="text-white/80">Complete payment to unlock</p>
            </div>
          </div>
        </div>
      </div>

      {/* What You'll Get */}
      <div className="mt-6 space-y-3">
        <h3 className="font-bold text-lg">What you'll get:</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm">High-quality bracket image with your predictions</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm">Your name and unique prediction ID</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm">QR code for easy sharing</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm">NFT certificate on blockchain</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm">Participate in leaderboard competitions</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PaymentSection({ predictionId }: { predictionId: string }) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ predictionId }),
        });

        const data = await response.json();
        if (data.success) {
          setClientSecret(data.data.clientSecret);
        } else {
          setError('Failed to initialize payment');
        }
      } catch (err) {
        console.error('Payment intent error:', err);
        setError('Failed to initialize payment');
      }
    };

    createPaymentIntent();
  }, [predictionId]);

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            predictionId,
          }),
        });

        const data = await response.json();
        if (data.success) {
          // Redirect to prediction detail page
          router.push(`/dashboard/predictions/${predictionId}`);
        } else {
          setError('Payment confirmed but failed to unlock prediction');
        }
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCryptoPayment = async () => {
    // TODO: Implement crypto payment with Coinbase Commerce
    alert('Crypto payment coming soon!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Payment Details</h2>
        <p className="text-3xl font-bold text-wc-gold">$5.00 USD</p>
        <p className="text-sm text-muted-foreground mt-1">One-time payment</p>
      </div>

      {/* Payment Method Selection */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setPaymentMethod('card')}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            paymentMethod === 'card'
              ? 'border-wc-gold bg-wc-gold/10'
              : 'border-white/20 hover:border-white/40'
          }`}
        >
          <CreditCard className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'card' ? 'text-wc-gold' : ''}`} />
          <div className="text-sm font-medium">Credit Card</div>
        </button>
        <button
          onClick={() => setPaymentMethod('crypto')}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            paymentMethod === 'crypto'
              ? 'border-wc-gold bg-wc-gold/10'
              : 'border-white/20 hover:border-white/40'
          }`}
        >
          <Wallet className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'crypto' ? 'text-wc-gold' : ''}`} />
          <div className="text-sm font-medium">Crypto</div>
        </button>
      </div>

      {/* Payment Form */}
      {paymentMethod === 'card' ? (
        <form onSubmit={handleCardPayment} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Card Details</label>
            <div className="p-4 rounded-lg border border-white/20 bg-white/5">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#fff',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#ef4444',
                    },
                  },
                }}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!stripe || isProcessing || !clientSecret}
            className="w-full py-4 rounded-lg bg-wc-gold hover:bg-yellow-300 text-wc-blue font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay $5.00
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="p-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
            <Wallet className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="text-blue-200 mb-4">
              Pay with Bitcoin, Ethereum, or other cryptocurrencies
            </p>
            <button
              onClick={handleCryptoPayment}
              className="w-full py-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
            >
              Continue with Crypto Payment
            </button>
          </div>
        </div>
      )}

      {/* Security Note */}
      <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
        <p className="text-xs text-muted-foreground text-center">
          🔒 Secure payment powered by Stripe. Your card details are never stored on our servers.
        </p>
      </div>
    </motion.div>
  );
}
