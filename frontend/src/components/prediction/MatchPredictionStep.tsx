'use client';

import { motion } from 'framer-motion';
import { Trophy, Award, CheckCircle } from 'lucide-react';
import { COUNTRY_FLAGS, TournamentBracket, BracketMatch } from '@/data/worldcup2026';

interface Props {
  round: 'roundOf32' | 'roundOf16' | 'quarterFinals' | 'semiFinals' | 'final';
  bracket: TournamentBracket;
  onBracketChange: (bracket: TournamentBracket) => void;
}

const ROUND_NAMES = {
  roundOf32: 'Round of 32',
  roundOf16: 'Round of 16',
  quarterFinals: 'Quarter Finals',
  semiFinals: 'Semi Finals',
  final: 'Final & 3rd Place',
};

export default function MatchPredictionStep({ round, bracket, onBracketChange }: Props) {
  const matches = round === 'final' ? [bracket.final, bracket.thirdPlace].filter(Boolean) as BracketMatch[] : bracket[round];

  const handleSelectWinner = (matchId: string, winner: string) => {
    const updatedBracket = { ...bracket };

    if (round === 'final') {
      if (matchId.includes('final')) {
        updatedBracket.final = { ...updatedBracket.final!, winner };
      } else if (matchId.includes('third')) {
        updatedBracket.thirdPlace = { ...updatedBracket.thirdPlace!, winner };
      }
    } else {
      updatedBracket[round] = bracket[round].map((match) =>
        match.id === matchId ? { ...match, winner } : match
      );

      // Advance winner to next round
      advanceWinner(updatedBracket, round, matchId, winner);
    }

    onBracketChange(updatedBracket);
  };

  const advanceWinner = (bracket: TournamentBracket, currentRound: string, matchId: string, winner: string) => {
    const matchIndex = parseInt(matchId.split('-')[1]);
    const nextMatchIndex = Math.floor(matchIndex / 2);

    if (currentRound === 'roundOf32' && bracket.roundOf16[nextMatchIndex]) {
      const isTeam1 = matchIndex % 2 === 0;
      bracket.roundOf16[nextMatchIndex] = {
        ...bracket.roundOf16[nextMatchIndex],
        [isTeam1 ? 'team1' : 'team2']: winner,
      };
    } else if (currentRound === 'roundOf16' && bracket.quarterFinals[nextMatchIndex]) {
      const isTeam1 = matchIndex % 2 === 0;
      bracket.quarterFinals[nextMatchIndex] = {
        ...bracket.quarterFinals[nextMatchIndex],
        [isTeam1 ? 'team1' : 'team2']: winner,
      };
    } else if (currentRound === 'quarterFinals' && bracket.semiFinals[nextMatchIndex]) {
      const isTeam1 = matchIndex % 2 === 0;
      bracket.semiFinals[nextMatchIndex] = {
        ...bracket.semiFinals[nextMatchIndex],
        [isTeam1 ? 'team1' : 'team2']: winner,
      };
    } else if (currentRound === 'semiFinals') {
      if (bracket.final) {
        const isTeam1 = matchIndex === 0;
        bracket.final = {
          ...bracket.final,
          [isTeam1 ? 'team1' : 'team2']: winner,
        };
      }
      // Losers go to 3rd place match
      if (bracket.thirdPlace) {
        const currentMatch = bracket.semiFinals[matchIndex];
        const loser = currentMatch.team1 === winner ? currentMatch.team2 : currentMatch.team1;
        const isTeam1 = matchIndex === 0;
        bracket.thirdPlace = {
          ...bracket.thirdPlace,
          [isTeam1 ? 'team1' : 'team2']: loser,
        };
      }
    }
  };

  const allPredicted = matches.every((match) => match.winner);
  const predictedCount = matches.filter((match) => match.winner).length;

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-wc-gold" />
            <div>
              <h2 className="text-3xl font-bold">{ROUND_NAMES[round]}</h2>
              <p className="text-muted-foreground">Select the winner of each match</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-wc-gold">
              {predictedCount}/{matches.length}
            </div>
            <div className="text-sm text-muted-foreground">Matches Predicted</div>
          </div>
        </div>
      </motion.div>

      {/* Matches Grid */}
      <div className={`grid gap-4 ${round === 'final' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {matches.map((match, index) => (
          <PredictableMatch
            key={match.id}
            match={match}
            matchNumber={index + 1}
            isFinal={round === 'final' && match.id.includes('final')}
            isThirdPlace={round === 'final' && match.id.includes('third')}
            onSelectWinner={(winner) => handleSelectWinner(match.id, winner)}
          />
        ))}
      </div>

      {allPredicted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3"
        >
          <CheckCircle className="w-6 h-6 text-green-500" />
          <span className="text-green-500 font-medium">
            All matches predicted! Click Next to continue.
          </span>
        </motion.div>
      )}
    </div>
  );
}

function PredictableMatch({
  match,
  matchNumber,
  isFinal,
  isThirdPlace,
  onSelectWinner,
}: {
  match: BracketMatch;
  matchNumber: number;
  isFinal?: boolean;
  isThirdPlace?: boolean;
  onSelectWinner: (winner: string) => void;
}) {
  const { team1, team2, winner } = match;

  if (!team1 || !team2) {
    return (
      <div className="glass-card opacity-50">
        <div className="text-center py-8 text-muted-foreground">
          <p>Match not ready yet</p>
          <p className="text-xs mt-2">Complete previous rounds first</p>
        </div>
      </div>
    );
  }

  const getBorderColor = () => {
    if (isFinal) return 'border-wc-gold';
    if (isThirdPlace) return 'border-orange-500';
    return 'border-white/20';
  };

  const getHeaderBg = () => {
    if (isFinal) return 'bg-wc-gold/20 border-wc-gold/30';
    if (isThirdPlace) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-white/10 border-white/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: matchNumber * 0.05 }}
      className={`border-2 ${getBorderColor()} rounded-xl overflow-hidden backdrop-blur-sm ${
        winner ? 'bg-white/5' : 'bg-white/10'
      }`}
    >
      {/* Header */}
      <div className={`py-2 px-4 border-b ${getHeaderBg()} flex items-center justify-center gap-2`}>
        {isFinal && <Trophy className="w-5 h-5 text-wc-gold" />}
        {isThirdPlace && <Award className="w-5 h-5 text-orange-500" />}
        <span className={`text-sm font-bold ${isFinal ? 'text-wc-gold' : isThirdPlace ? 'text-orange-500' : 'text-foreground'}`}>
          {isFinal ? 'FINAL' : isThirdPlace ? '3RD PLACE' : `Match ${matchNumber}`}
        </span>
      </div>

      {/* Teams */}
      <div className="p-4">
        <TeamButton
          team={team1}
          isSelected={winner === team1}
          isWinner={winner === team1}
          isLoser={winner === team2}
          onClick={() => onSelectWinner(team1)}
        />

        <div className="flex items-center justify-center my-3">
          <div className="text-sm font-bold text-muted-foreground">VS</div>
        </div>

        <TeamButton
          team={team2}
          isSelected={winner === team2}
          isWinner={winner === team2}
          isLoser={winner === team1}
          onClick={() => onSelectWinner(team2)}
        />
      </div>
    </motion.div>
  );
}

function TeamButton({
  team,
  isSelected,
  isWinner,
  isLoser,
  onClick,
}: {
  team: string;
  isSelected: boolean;
  isWinner: boolean;
  isLoser: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full p-4 rounded-lg border-2 transition-all relative overflow-hidden ${
        isWinner
          ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20'
          : isLoser
          ? 'border-red-500/30 bg-red-500/5 opacity-60'
          : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-wc-primary'
      }`}
    >
      {isWinner && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2"
        >
          <CheckCircle className="w-6 h-6 text-green-500 fill-green-500/20" />
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-4xl">{COUNTRY_FLAGS[team] || '🏳️'}</span>
        <div className="flex-1 text-left">
          <div className={`font-bold text-lg ${isWinner ? 'text-green-500' : ''}`}>
            {team}
          </div>
          {isWinner && (
            <div className="text-xs text-green-500 font-medium">Winner ✓</div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
