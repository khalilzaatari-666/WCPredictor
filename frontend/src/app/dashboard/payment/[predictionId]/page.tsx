'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Lock, CreditCard, Wallet, Check, Loader2, ArrowLeft, Download, Share2, QrCode, CheckCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function PreviewImage({ predictionData }: { predictionData: any }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const token = localStorage.getItem('authToken');

        // POST prediction data to generate blurred preview (PRE-PAYMENT)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predictions/preview`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(predictionData),
        });

        if (response.ok) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          setImageSrc(objectUrl);
        }
      } catch (error) {
        console.error('Failed to load preview image:', error);
      } finally {
        setLoading(false);
      }
    };

    if (predictionData) {
      fetchImage();
    }

    // Cleanup object URL on unmount
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [predictionData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-wc-gold" />
        <p className="text-muted-foreground">Loading preview...</p>
      </div>
    );
  }

  if (!imageSrc) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Failed to load preview</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <img
        src={imageSrc}
        alt="Blurred prediction preview"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
        <div className="text-center px-4 md:px-6 py-3 md:py-4 bg-wc-blue/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-glow-primary max-w-sm mx-4">
          <Lock className="w-8 h-8 md:w-10 md:h-10 text-wc-gold mx-auto mb-2" />
          <p className="text-base md:text-xl font-bold text-white mb-1">Pay to Unlock Your Prediction</p>
          <p className="text-xs md:text-sm text-gray-300">Complete payment to access your full bracket image</p>
        </div>
      </div>
    </div>
  );
}

function SuccessView({ prediction, router }: { prediction: any; router: any }) {
  const handleDownload = () => {
    if (prediction?.imageUrl) {
      window.open(prediction.imageUrl, '_blank');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/prediction/${prediction?.predictionId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My World Cup 2026 Prediction',
          text: `Check out my World Cup 2026 prediction! Champion: ${prediction?.champion}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground text-lg">
          Your prediction has been unlocked. Here's your official bracket!
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 justify-center mb-8"
      >
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-wc-gold hover:bg-yellow-300 text-wc-blue font-bold transition-all"
        >
          <Download className="w-5 h-5" />
          Download Image
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>
        <button
          onClick={() => router.push('/dashboard/predictions')}
          className="flex items-center gap-2 px-6 py-3 rounded-lg glass hover:bg-white/10 font-bold transition-all"
        >
          View My Predictions
        </button>
      </motion.div>

      {/* Bracket Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card mb-8"
      >
        {prediction?.imageUrl ? (
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={prediction.imageUrl}
              alt="Your Prediction Bracket"
              className="w-full h-auto"
            />
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <Loader2 className="w-12 h-12 animate-spin text-wc-gold mx-auto mb-4" />
            <p>Generating your bracket image...</p>
            <p className="text-sm mt-2">This may take a few moments</p>
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Prediction Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-wc-gold" />
            Prediction Summary
          </h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Champion</div>
              <div className="text-lg font-bold text-wc-gold">{prediction?.champion || 'TBD'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Runner-up</div>
              <div className="text-lg font-bold">{prediction?.runnerUp || 'TBD'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Prediction ID</div>
              <div className="text-sm font-mono">{prediction?.predictionId}</div>
            </div>
          </div>
        </motion.div>

        {/* QR Code */}
        {prediction?.qrCodeUrl && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <QrCode className="w-6 h-6 text-wc-gold" />
              Share QR Code
            </h3>
            <div className="flex justify-center">
              <img
                src={prediction.qrCodeUrl}
                alt="QR Code"
                className="w-48 h-48 rounded-lg border-2 border-wc-gold/30"
              />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Scan to view this prediction
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const predictionId = params.predictionId as string;
  const isNewPrediction = predictionId === 'new';
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [completedPrediction, setCompletedPrediction] = useState<any>(null);

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {!paymentSuccess ? (
          <>
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => router.back()}
              className="flex items-center gap-2 mb-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Prediction
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-4"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <Trophy className="w-10 h-10 text-wc-gold" />
                <h1 className="text-3xl font-bold">Complete Your Prediction</h1>
              </div>
              <p className="text-muted-foreground">
                Your prediction is ready! Complete payment to unlock your official bracket image.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-[3fr_2fr] gap-6 items-stretch">
              {/* Preview Section */}
              <PreviewSection predictionId={predictionId} isNewPrediction={isNewPrediction} />

              {/* Payment Section */}
              <Elements stripe={stripePromise}>
                <PaymentSection
                  predictionId={predictionId}
                  isNewPrediction={isNewPrediction}
                  onPaymentSuccess={(prediction) => {
                    setPaymentSuccess(true);
                    setCompletedPrediction(prediction);
                  }}
                />
              </Elements>
            </div>
          </>
        ) : (
          <SuccessView prediction={completedPrediction} router={router} />
        )}
      </div>
    </div>
  );
}

function PreviewSection({ predictionId, isNewPrediction }: { predictionId: string; isNewPrediction: boolean }) {
  const [predictionData, setPredictionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPredictionData = async () => {
      setIsLoading(true);
      try {
        if (isNewPrediction) {
          // Load from localStorage for new predictions
          const dataStr = localStorage.getItem('wc2026_prediction_for_payment');
          if (dataStr) {
            setPredictionData(JSON.parse(dataStr));
          }
        } else {
          // Fetch existing prediction
          const token = localStorage.getItem('authToken');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predictions/${predictionId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const data = await response.json();
          if (data.success && data.data.prediction) {
            setPredictionData(data.data.prediction);
          }
        }
      } catch (error) {
        console.error('Failed to fetch prediction:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictionData();
  }, [isNewPrediction, predictionId]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card"
    >
      <div className="mb-3">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Lock className="w-5 h-5 text-wc-gold" />
          Your Prediction Preview
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          This is a preview of your prediction. Complete payment to unlock the full image with your name and prediction ID.
        </p>
      </div>

      {/* Blurred Bracket Preview */}
      <div className="relative rounded-lg overflow-hidden border border-white/20 bg-gradient-to-br from-wc-primary/20 to-wc-accent/10 shadow-glow-primary flex items-center justify-center aspect-video">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-wc-gold" />
            <p className="text-muted-foreground">Generating preview...</p>
          </div>
        ) : predictionData ? (
          <PreviewImage predictionData={predictionData} />
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Preview not available</p>
          </div>
        )}
      </div>

      {/* What You'll Get */}
      <div className="mt-4 space-y-2">
        <h3 className="font-bold">What you'll get:</h3>
        <div className="space-y-1.5">
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

function PaymentSection({ predictionId, isNewPrediction, onPaymentSuccess }: { predictionId: string; isNewPrediction: boolean; onPaymentSuccess: (prediction: any) => void }) {
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

        const predictionData = JSON.parse(predictionDataStr);

        // Step 1: Create the prediction
        const createResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predictions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(predictionData),
        });

        const createData = await createResponse.json();
        if (!createData.success) {
          throw new Error(createData.message || 'Failed to create prediction');
        }

        const newPredictionId = createData.data.prediction.id;

        // Step 2: Create payment intent
        const intentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ predictionId: newPredictionId }),
        });

        const intentData = await intentResponse.json();
        if (!intentData.success) {
          throw new Error('Failed to create payment intent');
        }

        // Step 3: Confirm payment with Stripe
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          intentData.data.clientSecret,
          {
            payment_method: paymentMethod.id,
          }
        );

        if (confirmError) {
          throw new Error(confirmError.message || 'Payment failed');
        }

        if (paymentIntent.status === 'succeeded') {
          // Step 4: Confirm payment on backend (generates images)
          const confirmResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/confirm`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              predictionId: newPredictionId,
            }),
          });

          const confirmData = await confirmResponse.json();
          if (!confirmData.success) {
            throw new Error('Payment confirmed but failed to unlock prediction');
          }

          // Clear both localStorage keys
          localStorage.removeItem('wc2026_prediction_progress');
          localStorage.removeItem('wc2026_prediction_for_payment');

          // Fetch the complete prediction data
          const predictionResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/predictions/${createData.data.prediction.predictionId}`,
            {
              headers: { 'Authorization': `Bearer ${token}` },
            }
          );
          const predictionData = await predictionResponse.json();

          // Show success view with the prediction
          onPaymentSuccess(predictionData.data.prediction);
        } else {
          throw new Error('Payment was not successful');
        }
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
            // Fetch the complete prediction data
            const predictionResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/predictions/${predictionId}`,
              {
                headers: { 'Authorization': `Bearer ${token}` },
              }
            );
            const predictionData = await predictionResponse.json();

            // Show success view with the prediction
            onPaymentSuccess(predictionData.data.prediction);
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
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1">Payment Details</h2>
        <p className="text-2xl font-bold text-wc-gold">$2.00 USD</p>
        <p className="text-sm text-muted-foreground">One-time payment</p>
      </div>

      {/* Payment Method Selection */}
      <div className="flex gap-3 mb-4">
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
        <form onSubmit={handleCardPayment} className="space-y-4">
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
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
            <Wallet className="w-10 h-10 text-blue-500 mx-auto mb-2" />
            <p className="text-blue-200 mb-3 text-sm">
              Pay with Bitcoin, Ethereum, or other cryptocurrencies
            </p>
            <button
              onClick={handleCryptoPayment}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
            >
              Continue with Crypto Payment
            </button>
          </div>
        </div>
      )}

      {/* Security Note */}
      <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
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
