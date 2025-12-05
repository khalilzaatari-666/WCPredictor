'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Wallet } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { api } from '@/lib/api';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentModalProps {
  predictionId: string;
  onSuccess: (imageUrl: string) => void;
  onClose: () => void;
}

export default function PaymentModal({ predictionId, onSuccess, onClose }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const handleCardPayment = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payments/intent', { predictionId });
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');
      const { error } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: { token: 'tok_visa' } },
      });
      if (error) throw error;
      const confirmData = await api.post('/payments/confirm', { paymentIntentId: data.paymentIntentId, predictionId });
      onSuccess(confirmData.data.imageUrl);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoPayment = () => {
    alert('Crypto payment coming soon!');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-md w-full p-8 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Purchase</h2>
          <div className="flex gap-4 mb-6">
            <button onClick={() => setPaymentMethod('card')} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-600'}`}>
              <CreditCard className="w-5 h-5" />
              Card
            </button>
            <button onClick={() => setPaymentMethod('crypto')} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition ${paymentMethod === 'crypto' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-600'}`}>
              <Wallet className="w-5 h-5" />
              Crypto
            </button>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between"><span>Prediction Unlock</span><span>$1.99</span></div>
            <div className="flex justify-between"><span>NFT Minting</span><span>Included</span></div>
            <div className="border-t pt-3 flex justify-between font-bold"><span>Total</span><span>$1.99</span></div>
          </div>
          {paymentMethod === 'card' && (
            <div className="space-y-4 mb-6">
              <div><label className="block text-gray-700 mb-2">Card Number</label><input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="1234 5678 9012 3456" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-gray-700 mb-2">Expiry</label><input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="MM/YY" /></div>
                <div><label className="block text-gray-700 mb-2">CVC</label><input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="123" /></div>
              </div>
            </div>
          )}
          <button onClick={paymentMethod === 'card' ? handleCardPayment : handleCryptoPayment} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition disabled:opacity-50">
            {loading ? 'Processing...' : `Pay $1.99`}
          </button>
          <p className="text-gray-500 text-sm text-center mt-4">Secure payment powered by Stripe. Your prediction will be minted as an NFT.</p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}