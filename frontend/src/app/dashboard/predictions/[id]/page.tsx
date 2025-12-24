'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Download, Share2, QrCode, ArrowLeft, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface Prediction {
  id: string;
  predictionId: string;
  champion: string;
  runnerUp: string;
  isPaid: boolean;
  imageUrl: string | null;
  qrCodeUrl: string | null;
  tokenId: number | null;
  createdAt: string;
  user: {
    username: string;
    displayName: string | null;
  };
}

export default function PredictionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const predictionId = params.id as string;
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/predictions/${predictionId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to load prediction');
        }

        setPrediction(data.data.prediction);
      } catch (err: any) {
        console.error('Error fetching prediction:', err);
        setError(err.message || 'Failed to load prediction');
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [predictionId]);

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
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wc-gold mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading prediction...</p>
        </div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-muted-foreground mb-6">{error || 'Prediction not found'}</p>
          <button
            onClick={() => router.push('/dashboard/predictions')}
            className="px-6 py-3 rounded-lg bg-wc-gold hover:bg-yellow-300 text-wc-blue font-bold transition-all"
          >
            Back to Predictions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/dashboard/predictions')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Predictions
          </button>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-500 font-medium">Paid & Unlocked</span>
          </div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-wc-gold" />
            <h1 className="text-4xl font-bold">Your Official Prediction</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Prediction ID: <span className="font-mono text-wc-gold">{prediction.predictionId}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Created on {new Date(prediction.createdAt).toLocaleDateString()}
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
        </motion.div>

        {/* Bracket Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card mb-8"
        >
          {prediction.imageUrl ? (
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={prediction.imageUrl}
                alt="Your Prediction Bracket"
                className="w-full h-auto"
              />
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <p>Image is being generated...</p>
              <p className="text-sm mt-2">Please refresh the page in a few moments</p>
            </div>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
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
                <div className="text-lg font-bold text-wc-gold">{prediction.champion || 'TBD'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Runner-up</div>
                <div className="text-lg font-bold">{prediction.runnerUp || 'TBD'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Prediction ID</div>
                <div className="text-sm font-mono">{prediction.predictionId}</div>
              </div>
            </div>
          </motion.div>

          {/* QR Code */}
          {prediction.qrCodeUrl && (
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

        {/* NFT Info */}
        {prediction.tokenId !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">NFT Certificate</h3>
                <p className="text-sm text-muted-foreground">
                  Your prediction is secured on the blockchain
                </p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Token ID</div>
                  <div className="font-mono text-lg font-bold text-purple-400">
                    #{prediction.tokenId}
                  </div>
                </div>
                <a
                  href={`https://amoy.polygonscan.com/token/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}?a=${prediction.tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all"
                >
                  View on PolygonScan
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
