'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Download, Share2, CreditCard } from 'lucide-react';
import { COUNTRY_FLAGS, TournamentBracket } from '@/data/worldcup2026';
import { useRouter } from 'next/navigation';

interface Props {
  bracket: TournamentBracket;
  predictionId: string;
  username: string;
  isPaid: boolean;
}

export default function FinalResultStep({ bracket, predictionId, username, isPaid }: Props) {
  const router = useRouter();
  const bracketRef = useRef<HTMLDivElement>(null);

  // Prevent screenshots and context menu
  useEffect(() => {
    if (!isPaid) {
      const preventScreenshot = (e: KeyboardEvent) => {
        // Prevent Print Screen
        if (e.key === 'PrintScreen') {
          e.preventDefault();
          alert('Screenshots are disabled for unpaid predictions');
        }
        // Prevent Ctrl+P (print)
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
          e.preventDefault();
          alert('Printing is disabled for unpaid predictions');
        }
      };

      const preventContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };

      document.addEventListener('keydown', preventScreenshot);
      document.addEventListener('contextmenu', preventContextMenu);

      return () => {
        document.removeEventListener('keydown', preventScreenshot);
        document.removeEventListener('contextmenu', preventContextMenu);
      };
    }
  }, [isPaid]);

  const handlePayment = () => {
    router.push(`/dashboard/payment?predictionId=${predictionId}`);
  };

  const handleDownload = () => {
    if (!isPaid) {
      alert('Please complete payment to download your prediction');
      return;
    }
    // TODO: Implement download functionality
    alert('Download feature coming soon!');
  };

  const handleShare = () => {
    if (!isPaid) {
      alert('Please complete payment to share your prediction');
      return;
    }
    // TODO: Implement share functionality
    alert('Share feature coming soon!');
  };

  const champion = bracket.final?.winner;
  const runnerUp = bracket.final?.team1 === champion ? bracket.final?.team2 : bracket.final?.team1;
  const thirdPlace = bracket.thirdPlace?.winner;

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-wc-gold" />
            <div>
              <h2 className="text-3xl font-bold">Your Final Prediction</h2>
              <p className="text-muted-foreground">
                Prediction ID: <span className="font-mono text-wc-gold">{predictionId}</span>
              </p>
            </div>
          </div>
          {!isPaid && (
            <div className="flex items-center gap-2 text-orange-500">
              <Lock className="w-5 h-5" />
              <span className="text-sm font-medium">Unlock Full Access</span>
            </div>
          )}
        </div>

        {/* Top 3 Teams */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-6 rounded-xl border-2 border-wc-gold bg-gradient-to-br from-wc-gold/20 to-transparent backdrop-blur-sm">
            <div className="text-center">
              <Trophy className="w-12 h-12 text-wc-gold mx-auto mb-3" />
              <div className="text-6xl mb-3">{COUNTRY_FLAGS[champion || ''] || '🏆'}</div>
              <div className="text-2xl font-bold text-wc-gold">CHAMPION</div>
              <div className="text-xl font-semibold mt-2">{champion || 'TBD'}</div>
            </div>
          </div>

          <div className="p-6 rounded-xl border-2 border-gray-400 bg-gradient-to-br from-gray-400/20 to-transparent backdrop-blur-sm">
            <div className="text-center">
              <div className="text-6xl mb-3">{COUNTRY_FLAGS[runnerUp || ''] || '🥈'}</div>
              <div className="text-xl font-bold text-gray-300">RUNNER-UP</div>
              <div className="text-lg font-semibold mt-2">{runnerUp || 'TBD'}</div>
            </div>
          </div>

          <div className="p-6 rounded-xl border-2 border-orange-500 bg-gradient-to-br from-orange-500/20 to-transparent backdrop-blur-sm">
            <div className="text-center">
              <div className="text-6xl mb-3">{COUNTRY_FLAGS[thirdPlace || ''] || '🥉'}</div>
              <div className="text-xl font-bold text-orange-400">THIRD PLACE</div>
              <div className="text-lg font-semibold mt-2">{thirdPlace || 'TBD'}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bracket Preview with Watermark */}
      <div className="glass-card relative overflow-hidden">
        <div
          ref={bracketRef}
          className={`relative ${!isPaid ? 'select-none pointer-events-none' : ''}`}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          }}
        >
          {/* Watermark Overlay */}
          {!isPaid && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-md">
              <div className="text-center p-8">
                <Lock className="w-20 h-20 text-wc-gold mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-white mb-2">Unlock Full Prediction</h3>
                <p className="text-gray-300 mb-6">
                  Complete payment to view, download, and share your complete prediction
                </p>
                <button
                  onClick={handlePayment}
                  className="flex items-center gap-2 px-8 py-4 bg-wc-gold hover:bg-yellow-300 text-wc-blue font-bold rounded-lg transition-all mx-auto text-lg"
                >
                  <CreditCard className="w-6 h-6" />
                  Unlock for $4.99
                </button>
              </div>
            </div>
          )}

          {/* Watermark Text Pattern */}
          {!isPaid && (
            <div className="absolute inset-0 z-[5] opacity-10 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-4xl font-bold text-white transform -rotate-45"
                  style={{
                    top: `${(i % 5) * 20}%`,
                    left: `${Math.floor(i / 5) * 25}%`,
                  }}
                >
                  LOCKED
                </div>
              ))}
            </div>
          )}

          {/* Bracket Content */}
          <div className={`p-8 ${!isPaid ? 'blur-sm' : ''}`}>
            <FullBracketVisualization bracket={bracket} username={username} predictionId={predictionId} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
        {!isPaid ? (
          <button
            onClick={handlePayment}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-wc-gold hover:bg-yellow-300 text-wc-blue font-bold rounded-lg transition-all"
          >
            <CreditCard className="w-5 h-5" />
            Unlock Full Prediction - $4.99
          </button>
        ) : (
          <>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all"
            >
              <Download className="w-5 h-5" />
              Download Image
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all"
            >
              <Share2 className="w-5 h-5" />
              Share Prediction
            </button>
          </>
        )}
      </div>

      {!isPaid && (
        <div className="mt-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-center">
          <p className="text-orange-200">
            <Lock className="inline w-4 h-4 mr-2" />
            <strong>Note:</strong> Screenshots and downloads are disabled until payment is completed.
          </p>
        </div>
      )}
    </div>
  );
}

function FullBracketVisualization({
  bracket,
  username,
  predictionId,
}: {
  bracket: TournamentBracket;
  username: string;
  predictionId: string;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b border-white/20 pb-4">
        <h1 className="text-4xl font-bold mb-2">FIFA World Cup 2026 Prediction</h1>
        <p className="text-xl text-muted-foreground">by {username}</p>
        <p className="text-sm text-muted-foreground mt-1">ID: {predictionId}</p>
      </div>

      {/* Compact Bracket View */}
      <div className="overflow-x-auto">
        <div className="min-w-max flex gap-8 justify-center">
          {/* Semi Finals */}
          <RoundMatches title="Semi Finals" matches={bracket.semiFinals} />

          {/* Final & 3rd Place */}
          <div className="flex flex-col gap-8 items-center justify-center">
            <div>
              <div className="text-sm font-bold text-wc-gold text-center mb-2">FINAL</div>
              {bracket.final && <CompactMatchCard match={bracket.final} />}
            </div>
            <div>
              <div className="text-sm font-bold text-orange-500 text-center mb-2">3RD PLACE</div>
              {bracket.thirdPlace && <CompactMatchCard match={bracket.thirdPlace} />}
            </div>
          </div>
        </div>
      </div>

      {/* Winner Circle */}
      {bracket.final?.winner && (
        <div className="text-center mt-8 p-8 rounded-2xl border-2 border-wc-gold bg-gradient-to-br from-wc-gold/20 to-transparent">
          <Trophy className="w-16 h-16 text-wc-gold mx-auto mb-4" />
          <div className="text-8xl mb-4">{COUNTRY_FLAGS[bracket.final.winner] || '🏆'}</div>
          <div className="text-4xl font-bold text-wc-gold mb-2">WORLD CHAMPION</div>
          <div className="text-3xl font-semibold">{bracket.final.winner}</div>
        </div>
      )}
    </div>
  );
}

function RoundMatches({ title, matches }: { title: string; matches: any[] }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-bold text-wc-primary mb-4">{title}</div>
      <div className="flex flex-col gap-4">
        {matches.map((match, i) => (
          <CompactMatchCard key={i} match={match} />
        ))}
      </div>
    </div>
  );
}

function CompactMatchCard({ match }: { match: any }) {
  const { team1, team2, winner } = match;

  return (
    <div className="w-48 border border-white/20 rounded-lg overflow-hidden bg-white/5">
      <TeamRow team={team1} isWinner={winner === team1} />
      <div className="h-px bg-white/20" />
      <TeamRow team={team2} isWinner={winner === team2} />
    </div>
  );
}

function TeamRow({ team, isWinner }: { team: string | null; isWinner: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 p-2 ${
        isWinner ? 'bg-green-500/20 font-bold' : ''
      }`}
    >
      <span className="text-xl">{team ? COUNTRY_FLAGS[team] || '🏳️' : '❓'}</span>
      <span className="flex-1 text-sm">{team || 'TBD'}</span>
      {isWinner && <span className="text-green-500 text-xs">✓</span>}
    </div>
  );
}
