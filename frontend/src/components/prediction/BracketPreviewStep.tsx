'use client';

import { motion } from 'framer-motion';
import { Trophy, Award } from 'lucide-react';
import { COUNTRY_FLAGS, GroupStanding, TournamentBracket } from '@/data/worldcup2026';

interface Props {
  groupStandings: GroupStanding;
  thirdPlaceTeams: string[];
  bracket: TournamentBracket;
}

export default function BracketPreviewStep({ groupStandings, thirdPlaceTeams, bracket }: Props) {
  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card mb-6"
      >
        <div className="flex flex-col items-center text-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-wc-gold" />
          <div>
            <h2 className="text-3xl font-bold">Tournament Bracket Preview</h2>
            <p className="text-muted-foreground">
              Your qualified teams will now compete in the knockout stages
            </p>
          </div>
        </div>
      </motion.div>

      {/* Bracket Visualization - Break out to full viewport width */}
      <div className="-mx-4 md:-mx-24">
        <div className="glass-card w-full">
          <BracketVisualization
            groupStandings={groupStandings}
            thirdPlaceTeams={thirdPlaceTeams}
          />
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
        <p className="text-blue-200">
          <strong>Next:</strong> You'll predict the winner of each match, round by round, until the final!
        </p>
      </div>
    </div>
  );
}

// Team display component
function TeamDisplay({ team }: { team: string }) {
  const isTBD = team === 'TBD';

  return (
    <div className="flex items-center gap-2 p-2 hover:bg-white/5 transition-colors">
      <span className="text-base">{isTBD ? '❓' : COUNTRY_FLAGS[team] || '🏳️'}</span>
      <span className={`text-xs font-medium truncate ${isTBD ? 'text-muted-foreground' : ''}`}>
        {team}
      </span>
    </div>
  );
}

// Match card component
function MatchCard({ team1, team2, reverse = false }: { team1: string; team2: string; reverse?: boolean }) {
  return (
    <div className="relative">
      <div className="w-36 border border-white/20 rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm">
        <TeamDisplay team={team1} />
        <div className="h-px bg-white/20" />
        <TeamDisplay team={team2} />
      </div>

      {/* Connector line */}
      {!reverse ? (
        <div className="absolute right-0 top-1/2 w-4 h-px bg-white/20 translate-x-full" />
      ) : (
        <div className="absolute left-0 top-1/2 w-4 h-px bg-white/20 -translate-x-full" />
      )}
    </div>
  );
}

// Final match component
function FinalMatchCard() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1 text-wc-gold mb-2">
        <Trophy className="w-5 h-5" />
        <span className="text-sm font-bold">FINAL</span>
      </div>
      <div className="w-40 border-2 border-wc-gold rounded-lg overflow-hidden bg-wc-gold/10 backdrop-blur-sm shadow-lg shadow-wc-gold/20">
        <TeamDisplay team="TBD" />
        <div className="h-px bg-wc-gold/30" />
        <TeamDisplay team="TBD" />
      </div>
    </div>
  );
}

// Third place match component
function ThirdPlaceMatchCard() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1 text-orange-500 mb-2">
        <Award className="w-4 h-4" />
        <span className="text-xs font-bold">3RD PLACE</span>
      </div>
      <div className="w-40 border border-orange-500/50 rounded-lg overflow-hidden bg-orange-500/10 backdrop-blur-sm">
        <TeamDisplay team="TBD" />
        <div className="h-px bg-orange-500/30" />
        <TeamDisplay team="TBD" />
      </div>
    </div>
  );
}

// Round column component
function RoundColumn({
  title,
  teams,
  reverse = false,
  spacing = 1
}: {
  title: string;
  teams: Array<{ team1: string; team2: string }>;
  reverse?: boolean;
  spacing?: number;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-bold text-wc-primary mb-3">{title}</div>
      <div className="flex flex-col" style={{ gap: `${spacing}rem` }}>
        {teams.map((match, i) => (
          <MatchCard key={i} team1={match.team1} team2={match.team2} reverse={reverse} />
        ))}
      </div>
    </div>
  );
}

// Main bracket visualization
function BracketVisualization({
  groupStandings,
  thirdPlaceTeams
}: {
  groupStandings: GroupStanding;
  thirdPlaceTeams: string[]
}) {
  // Get all qualified teams
  const winners = Object.values(groupStandings).map(group => group[0]).filter(Boolean);
  const runnersUp = Object.values(groupStandings).map(group => group[1]).filter(Boolean);

  // Combine: 24 winners + 16 runners-up + 8 third place = 48 teams (we take first 32)
  const allQualified = [
    ...winners.slice(0, 12),
    ...runnersUp.slice(0, 12),
    ...thirdPlaceTeams.slice(0, 8)
  ];

  // Split into two halves
  const leftSide = allQualified.slice(0, 16);
  const rightSide = allQualified.slice(16, 32);

  // Create match pairings for each round
  const createMatches = (teams: string[]): Array<{ team1: string; team2: string }> => {
    const matches = [];
    for (let i = 0; i < teams.length; i += 2) {
      matches.push({
        team1: teams[i] || 'TBD',
        team2: teams[i + 1] || 'TBD'
      });
    }
    return matches;
  };

  // Left side rounds
  const leftR32 = createMatches(leftSide);
  const leftR16 = Array(4).fill(null).map(() => ({ team1: 'TBD', team2: 'TBD' }));
  const leftQF = Array(2).fill(null).map(() => ({ team1: 'TBD', team2: 'TBD' }));
  const leftSF = [{ team1: 'TBD', team2: 'TBD' }];

  // Right side rounds
  const rightR32 = createMatches(rightSide);
  const rightR16 = Array(4).fill(null).map(() => ({ team1: 'TBD', team2: 'TBD' }));
  const rightQF = Array(2).fill(null).map(() => ({ team1: 'TBD', team2: 'TBD' }));
  const rightSF = [{ team1: 'TBD', team2: 'TBD' }];

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-center gap-2 w-full px-2">
        {/* LEFT BRACKET */}
        <div className="flex gap-2 items-center">
          <RoundColumn title="R32" teams={leftR32} spacing={0.5} />
          <RoundColumn title="R16" teams={leftR16} spacing={3.5} />
          <RoundColumn title="QF" teams={leftQF} spacing={9} />
          <RoundColumn title="SF" teams={leftSF} spacing={20} />
        </div>

        {/* CENTER - FINALS */}
        <div className="flex flex-col items-center gap-4 mx-2">
          <FinalMatchCard />
          <ThirdPlaceMatchCard />
        </div>

        {/* RIGHT BRACKET */}
        <div className="flex gap-2 items-center">
          <RoundColumn title="SF" teams={rightSF} reverse spacing={20} />
          <RoundColumn title="QF" teams={rightQF} reverse spacing={9} />
          <RoundColumn title="R16" teams={rightR16} reverse spacing={3.5} />
          <RoundColumn title="R32" teams={rightR32} reverse spacing={0.5} />
        </div>
      </div>
    </div>
  );
}
