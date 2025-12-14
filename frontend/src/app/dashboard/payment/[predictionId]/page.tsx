'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Lock, CreditCard, Wallet, Check, Loader2, ArrowLeft } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const predictionId = params.predictionId as string;
  const isNewPrediction = predictionId === 'new';

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Prediction
        </motion.button>

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

        <div className="grid md:grid-cols-[2fr_1fr] gap-8 items-stretch">
          {/* Preview Section - Wider */}
          <PreviewSection predictionId={predictionId} isNewPrediction={isNewPrediction} />

          {/* Payment Section - Narrower, Centered Vertically */}
          <Elements stripe={stripePromise}>
            <PaymentSection predictionId={predictionId} isNewPrediction={isNewPrediction} />
          </Elements>
        </div>
      </div>
    </div>
  );
}

function PreviewSection({ predictionId, isNewPrediction }: { predictionId: string; isNewPrediction: boolean }) {
  const [predictionData, setPredictionData] = useState<any>(null);

  useEffect(() => {
    if (isNewPrediction) {
      // Load from localStorage for new predictions
      const dataStr = localStorage.getItem('wc2026_prediction_for_payment');
      if (dataStr) {
        setPredictionData(JSON.parse(dataStr));
      }
    }
  }, [isNewPrediction]);

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
      <div className="relative rounded-lg overflow-hidden border-2 border-wc-gold/30 min-h-[500px] bg-gradient-to-br from-wc-blue/30 to-wc-primary/20">
        <div className="relative h-full">
          {/* Actual Bracket Preview - Blurred */}
          {predictionData && (
            <div className="absolute inset-0 p-4 blur-md scale-95">
              <div className="space-y-4">
                {/* Champion */}
                <div className="text-center mb-6">
                  <div className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg shadow-xl">
                    <Trophy className="w-6 h-6 inline-block mr-2 text-yellow-900" />
                    <span className="text-xl font-bold text-yellow-900">
                      {predictionData.champion || 'Champion'}
                    </span>
                  </div>
                </div>

                {/* Final & 3rd Place */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-wc-gold mb-1">FINAL</div>
                    {predictionData.final && (
                      <div className="bg-white/10 rounded p-2 space-y-1">
                        <div className={`text-sm font-medium ${predictionData.final.winner === predictionData.final.team1 ? 'text-green-400' : ''}`}>
                          {predictionData.final.team1 || 'TBD'}
                        </div>
                        <div className={`text-sm font-medium ${predictionData.final.winner === predictionData.final.team2 ? 'text-green-400' : ''}`}>
                          {predictionData.final.team2 || 'TBD'}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-orange-400 mb-1">3RD PLACE</div>
                    {predictionData.thirdPlace && (
                      <div className="bg-white/10 rounded p-2 space-y-1">
                        <div className={`text-sm font-medium ${predictionData.thirdPlace.winner === predictionData.thirdPlace.team1 ? 'text-green-400' : ''}`}>
                          {predictionData.thirdPlace.team1 || 'TBD'}
                        </div>
                        <div className={`text-sm font-medium ${predictionData.thirdPlace.winner === predictionData.thirdPlace.team2 ? 'text-green-400' : ''}`}>
                          {predictionData.thirdPlace.team2 || 'TBD'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Semi Finals */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-wc-gold mb-1">SEMI FINALS</div>
                  <div className="grid grid-cols-2 gap-2">
                    {predictionData.semiFinals?.map((match: any, i: number) => (
                      <div key={i} className="bg-white/10 rounded p-2 space-y-1">
                        <div className={`text-xs ${match.winner === match.team1 ? 'text-green-400 font-bold' : ''}`}>
                          {match.team1 || 'TBD'}
                        </div>
                        <div className={`text-xs ${match.winner === match.team2 ? 'text-green-400 font-bold' : ''}`}>
                          {match.team2 || 'TBD'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quarter Finals */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-wc-gold mb-1">QUARTER FINALS</div>
                  <div className="grid grid-cols-4 gap-1">
                    {predictionData.quarterFinals?.map((match: any, i: number) => (
                      <div key={i} className="bg-white/10 rounded p-1">
                        <div className={`text-[10px] truncate ${match.winner === match.team1 ? 'text-green-400' : ''}`}>
                          {match.team1 || 'TBD'}
                        </div>
                        <div className={`text-[10px] truncate ${match.winner === match.team2 ? 'text-green-400' : ''}`}>
                          {match.team2 || 'TBD'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Round of 16 */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-wc-gold mb-1">ROUND OF 16</div>
                  <div className="grid grid-cols-4 gap-1">
                    {predictionData.roundOf16?.slice(0, 8).map((match: any, i: number) => (
                      <div key={i} className="bg-white/10 rounded p-1">
                        <div className="text-[9px] truncate">{match.team1 || 'TBD'}</div>
                        <div className="text-[9px] truncate">{match.team2 || 'TBD'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group Stage Winners */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-wc-gold mb-1">GROUP WINNERS</div>
                  <div className="grid grid-cols-6 gap-1">
                    {Object.keys(predictionData.groupStandings || {}).sort().map((group) => (
                      <div key={group} className="bg-white/10 rounded p-1 text-center">
                        <div className="text-[8px] text-wc-gold font-bold">{group}</div>
                        <div className="text-[9px] truncate">{predictionData.groupStandings[group][0]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
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

function PaymentSection({ predictionId, isNewPrediction }: { predictionId: string; isNewPrediction: boolean }) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeReady, setStripeReady] = useState(false);

  useEffect(() => {
    // Skip payment intent creation for new predictions
    // We'll create the prediction after payment succeeds
    if (isNewPrediction) {
      return;
    }

    // Create payment intent when component mounts (for existing predictions)
    const createPaymentIntent = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/intent`, {
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
  }, [predictionId, isNewPrediction]);

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);
    setCardError(null);

    try {
      const token = localStorage.getItem('authToken');
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // For new predictions, create payment method and process payment
      if (isNewPrediction) {
        const predictionDataStr = localStorage.getItem('wc2026_prediction_for_payment');
        if (!predictionDataStr) {
          throw new Error('Prediction data not found. Please start over.');
        }

        // Create payment method
        const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });

        if (pmError) {
          setError(pmError.message || 'Failed to create payment method');
          setIsProcessing(false);
          return;
        }

        // For local testing without real Stripe integration:
        // Just create the prediction directly
        // In production, you'd want to create payment intent first
        const predictionData = JSON.parse(predictionDataStr);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predictions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(predictionData),
        });

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to create prediction');
        }

        // Clear both localStorage keys
        localStorage.removeItem('wc2026_prediction_progress');
        localStorage.removeItem('wc2026_prediction_for_payment');

        // Redirect to prediction detail page
        router.push(`/dashboard/predictions/${data.data.prediction.predictionId}`);
      } else {
        // Existing flow for already-created predictions with payment intent
        if (!clientSecret) {
          setError('Payment initialization failed. Please try again.');
          setIsProcessing(false);
          return;
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
      className="glass-card flex flex-col justify-center h-full w-full"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Payment Details</h2>
        <p className="text-3xl font-bold text-wc-gold">$2.00 USD</p>
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
            <div className={`p-4 rounded-lg border ${cardError ? 'border-red-500/50' : 'border-white/20'} bg-white/5 relative min-h-[40px]`}>
              {!stripeReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-wc-gold" />
                </div>
              )}
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
                onReady={() => setStripeReady(true)}
                onChange={(e) => {
                  if (e.error) {
                    setCardError(e.error.message);
                  } else {
                    setCardError(null);
                  }
                }}
              />
            </div>
            {cardError && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <span>⚠️</span> {cardError}
              </p>
            )}
            {!stripe && (
              <p className="mt-2 text-sm text-yellow-500 flex items-center gap-1">
                <span>⚠️</span> Invalid Stripe key. Please check your .env.local file.
              </p>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!stripe || isProcessing || (!isNewPrediction && !clientSecret)}
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
                Pay $2.00
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
          {paymentMethod === 'card' ? (
            <>🔒 Secure payment powered by Stripe. Your card details are never stored on our servers.</>
          ) : (
            <>🔒 Secure cryptocurrency payment. Transactions are verified on the blockchain.</>
          )}
        </p>
      </div>
    </motion.div>
  );
}
