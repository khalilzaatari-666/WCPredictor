'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { WORLD_CUP_GROUPS, GroupStanding, TournamentBracket, BracketMatch } from '@/data/worldcup2026';
import GroupStageStep from '@/components/prediction/GroupStageStep';
import ThirdPlaceSelectionStep from '@/components/prediction/ThirdPlaceSelectionStep';
import MatchPredictionStep from '@/components/prediction/MatchPredictionStep';

type PredictionStep =
  | { type: 'group'; group: string }
  | { type: 'thirdPlace' }
  | { type: 'matchPrediction'; round: 'roundOf32' | 'roundOf16' | 'quarterFinals' | 'semiFinals' | 'final' };

export default function PredictPage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [groupStandings, setGroupStandings] = useState<GroupStanding>({});
  const [thirdPlaceTeams, setThirdPlaceTeams] = useState<string[]>([]);
  const [bracket, setBracket] = useState<TournamentBracket>(initializeBracket());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define all steps in order
  const steps: PredictionStep[] = [
    ...Object.keys(WORLD_CUP_GROUPS).map(group => ({ type: 'group' as const, group })),
    { type: 'thirdPlace' },
    { type: 'matchPrediction', round: 'roundOf32' as const },
    { type: 'matchPrediction', round: 'roundOf16' as const },
    { type: 'matchPrediction', round: 'quarterFinals' as const },
    { type: 'matchPrediction', round: 'semiFinals' as const },
    { type: 'matchPrediction', round: 'final' as const },
  ];

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    // Auto-generate bracket rounds as user progresses
    setBracket(prevBracket => {
      const newBracket = { ...prevBracket };
      let updated = false;

      // Generate Round of 32 when entering that step
      if (currentStep.type === 'matchPrediction' && currentStep.round === 'roundOf32' && newBracket.roundOf32.length === 0) {
        const generatedBracket = generateRoundOf32(groupStandings, thirdPlaceTeams);
        newBracket.roundOf32 = generatedBracket.roundOf32;
        updated = true;
      }

      // Generate Round of 16 when all R32 matches have winners
      if (newBracket.roundOf32.length > 0 && newBracket.roundOf32.every(m => m.winner)) {
        const newR16 = generateRoundOf16(newBracket.roundOf32);
        // Only update if different (preserve user's winner selections)
        if (newBracket.roundOf16.length === 0 || newBracket.roundOf16.some((m, i) => m.team1 !== newR16[i].team1 || m.team2 !== newR16[i].team2)) {
          newBracket.roundOf16 = newR16.map((match, i) => ({
            ...match,
            winner: newBracket.roundOf16[i]?.winner || null, // Preserve existing winner
          }));
          updated = true;
        }
      }

      // Generate Quarter Finals when all R16 matches have winners
      if (newBracket.roundOf16.length > 0 && newBracket.roundOf16.every(m => m.winner)) {
        const newQF = generateQuarterFinals(newBracket.roundOf16);
        if (newBracket.quarterFinals.length === 0 || newBracket.quarterFinals.some((m, i) => m.team1 !== newQF[i].team1 || m.team2 !== newQF[i].team2)) {
          newBracket.quarterFinals = newQF.map((match, i) => ({
            ...match,
            winner: newBracket.quarterFinals[i]?.winner || null,
          }));
          updated = true;
        }
      }

      // Generate Semi Finals when all QF matches have winners
      if (newBracket.quarterFinals.length > 0 && newBracket.quarterFinals.every(m => m.winner)) {
        const newSF = generateSemiFinals(newBracket.quarterFinals);
        if (newBracket.semiFinals.length === 0 || newBracket.semiFinals.some((m, i) => m.team1 !== newSF[i].team1 || m.team2 !== newSF[i].team2)) {
          newBracket.semiFinals = newSF.map((match, i) => ({
            ...match,
            winner: newBracket.semiFinals[i]?.winner || null,
          }));
          updated = true;
        }
      }

      // Generate Final and Third Place when all SF matches have winners
      if (newBracket.semiFinals.length > 0 && newBracket.semiFinals.every(m => m.winner)) {
        const { final, thirdPlace } = generateFinalMatches(newBracket.semiFinals);
        if (!newBracket.final || newBracket.final.team1 !== final.team1 || newBracket.final.team2 !== final.team2) {
          newBracket.final = { ...final, winner: newBracket.final?.winner || null };
          newBracket.thirdPlace = { ...thirdPlace, winner: newBracket.thirdPlace?.winner || null };
          updated = true;
        }
      }

      return updated ? newBracket : prevBracket;
    });
  }, [currentStepIndex, currentStep, groupStandings, thirdPlaceTeams, bracket]);

  const handleGroupStandingsChange = (group: string, standings: string[]) => {
    setGroupStandings(prev => ({ ...prev, [group]: standings }));
  };

  const handleThirdPlaceChange = (teams: string[]) => {
    setThirdPlaceTeams(teams);
  };

  const handleBracketChange = (updatedBracket: TournamentBracket) => {
    setBracket(updatedBracket);
  };

  const canProceed = () => {
    if (currentStep.type === 'group') {
      const standings = groupStandings[currentStep.group];
      return standings && standings.length === 4;
    }
    if (currentStep.type === 'thirdPlace') {
      return thirdPlaceTeams.length === 8;
    }
    if (currentStep.type === 'matchPrediction') {
      const round = currentStep.round;
      if (round === 'final') {
        return bracket.final?.winner && bracket.thirdPlace?.winner;
      }
      const matches = bracket[round];
      return matches.every(match => match.winner);
    }
    return true; // bracketPreview can always proceed
  };

  const handleSubmitPrediction = async () => {
    setIsSubmitting(true);
    try {
      // Prepare prediction data
      const predictionData = {
        groupStandings,
        thirdPlaceTeams,
        roundOf32: bracket.roundOf32,
        roundOf16: bracket.roundOf16,
        quarterFinals: bracket.quarterFinals,
        semiFinals: bracket.semiFinals,
        final: bracket.final,
        thirdPlace: bracket.thirdPlace,
        champion: bracket.final?.winner,
        runnerUp: bracket.final?.team1 === bracket.final?.winner ? bracket.final?.team2 : bracket.final?.team1,
      };

      // Create unpaid prediction
      const token = localStorage.getItem('authToken');
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

      // Redirect to payment page
      router.push(`/dashboard/payment/${data.data.prediction.id}`);
    } catch (error: any) {
      console.error('Error submitting prediction:', error);
      alert(error.message || 'Failed to submit prediction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1 && canProceed()) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else if (currentStepIndex === steps.length - 1 && canProceed()) {
      // Last step - submit the prediction
      handleSubmitPrediction();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const getStepTitle = () => {
    if (currentStep.type === 'group') return `Group ${currentStep.group}`;
    if (currentStep.type === 'thirdPlace') return 'Select Best 8 Third Place Teams';
    if (currentStep.type === 'matchPrediction') {
      const titles = {
        roundOf32: 'Round of 32',
        roundOf16: 'Round of 16',
        quarterFinals: 'Quarter Finals',
        semiFinals: 'Semi Finals',
        final: 'Final & 3rd Place',
      };
      return titles[currentStep.round];
    }
    return 'Prediction';
  };

  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen pb-24">
      {/* Progress Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-background to-background/95 backdrop-blur-lg border-b border-white/10 mb-6">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-2xl font-bold">{getStepTitle()}</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="bg-wc-gold h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-7xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep.type === 'group' && (
              <GroupStageStep
                group={currentStep.group}
                teams={WORLD_CUP_GROUPS[currentStep.group as keyof typeof WORLD_CUP_GROUPS]}
                standings={groupStandings[currentStep.group] || []}
                onStandingsChange={(standings) => handleGroupStandingsChange(currentStep.group, standings)}
              />
            )}

            {currentStep.type === 'thirdPlace' && (
              <ThirdPlaceSelectionStep
                thirdPlaceTeams={Object.keys(groupStandings).map(group => ({
                  team: groupStandings[group]?.[2] || '',
                  group,
                })).filter(item => item.team)}
                selectedTeams={thirdPlaceTeams}
                onSelectionChange={handleThirdPlaceChange}
              />
            )}

            {currentStep.type === 'matchPrediction' && (
              <MatchPredictionStep
                round={currentStep.round}
                bracket={bracket}
                onBracketChange={handleBracketChange}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-white/10 p-4 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-wc-gold hover:bg-yellow-300 text-wc-blue font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Submitting...
                </>
              ) : (
                <>
                  {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function initializeBracket(): TournamentBracket {
  return {
    roundOf32: [],
    roundOf16: Array.from({ length: 8 }, (_, i) => ({
      id: `r16-${i}`,
      team1: null,
      team2: null,
      winner: null,
    })),
    quarterFinals: Array.from({ length: 4 }, (_, i) => ({
      id: `qf-${i}`,
      team1: null,
      team2: null,
      winner: null,
    })),
    semiFinals: Array.from({ length: 2 }, (_, i) => ({
      id: `sf-${i}`,
      team1: null,
      team2: null,
      winner: null,
    })),
    thirdPlace: {
      id: 'third-place',
      team1: null,
      team2: null,
      winner: null,
    },
    final: {
      id: 'final',
      team1: null,
      team2: null,
      winner: null,
    },
  };
}

function generateRoundOf32(groupStandings: GroupStanding, thirdPlaceTeams: string[]): TournamentBracket {
  // Extract qualified teams by position
  const winners: Record<string, string> = {};
  const runnersUp: Record<string, string> = {};
  const thirdPlace: Record<string, string> = {};

  Object.keys(groupStandings).sort().forEach(group => {
    const standings = groupStandings[group];
    if (standings && standings.length >= 3) {
      winners[group] = standings[0];
      runnersUp[group] = standings[1];
      thirdPlace[group] = standings[2];
    }
  });

  // Create a map of third-place teams to their groups for assignment
  const thirdPlaceMap: Record<string, string> = {};
  thirdPlaceTeams.forEach(team => {
    const group = Object.keys(thirdPlace).find(g => thirdPlace[g] === team);
    if (group) {
      thirdPlaceMap[team] = group;
    }
  });

  // Helper function to get a third-place team from allowed groups
  const getThirdPlaceTeam = (allowedGroups: string[]): string | null => {
    for (const team of thirdPlaceTeams) {
      const teamGroup = thirdPlaceMap[team];
      if (teamGroup && allowedGroups.includes(teamGroup)) {
        // Remove from available teams to avoid duplicates
        const index = thirdPlaceTeams.indexOf(team);
        if (index > -1) {
          thirdPlaceTeams.splice(index, 1);
        }
        return team;
      }
    }
    // Fallback: return any remaining third-place team
    return thirdPlaceTeams.shift() || null;
  };

  // Official FIFA World Cup 2026 Round of 32 bracket structure
  const roundOf32: BracketMatch[] = [
    // Match 1: Runner-up A vs Runner-up B
    {
      id: 'r32-1',
      team1: runnersUp['A'] || null,
      team2: runnersUp['B'] || null,
      winner: null,
    },
    // Match 2: Winner C vs Runner-up F
    {
      id: 'r32-2',
      team1: winners['C'] || null,
      team2: runnersUp['F'] || null,
      winner: null,
    },
    // Match 3: Winner E vs Best 3rd (A/B/C/D/F)
    {
      id: 'r32-3',
      team1: winners['E'] || null,
      team2: getThirdPlaceTeam(['A', 'B', 'C', 'D', 'F']),
      winner: null,
    },
    // Match 4: Winner F vs Runner-up C
    {
      id: 'r32-4',
      team1: winners['F'] || null,
      team2: runnersUp['C'] || null,
      winner: null,
    },
    // Match 5: Runner-up E vs Runner-up I
    {
      id: 'r32-5',
      team1: runnersUp['E'] || null,
      team2: runnersUp['I'] || null,
      winner: null,
    },
    // Match 6: Winner I vs Best 3rd (C/D/F/G/H)
    {
      id: 'r32-6',
      team1: winners['I'] || null,
      team2: getThirdPlaceTeam(['C', 'D', 'F', 'G', 'H']),
      winner: null,
    },
    // Match 7: Winner A vs Best 3rd (C/E/F/H/I)
    {
      id: 'r32-7',
      team1: winners['A'] || null,
      team2: getThirdPlaceTeam(['C', 'E', 'F', 'H', 'I']),
      winner: null,
    },
    // Match 8: Winner L vs Best 3rd (E/H/I/J/K)
    {
      id: 'r32-8',
      team1: winners['L'] || null,
      team2: getThirdPlaceTeam(['E', 'H', 'I', 'J', 'K']),
      winner: null,
    },
    // Match 9: Winner G vs Best 3rd (A/E/H/I/J)
    {
      id: 'r32-9',
      team1: winners['G'] || null,
      team2: getThirdPlaceTeam(['A', 'E', 'H', 'I', 'J']),
      winner: null,
    },
    // Match 10: Winner D vs Best 3rd (B/E/F/I/J)
    {
      id: 'r32-10',
      team1: winners['D'] || null,
      team2: getThirdPlaceTeam(['B', 'E', 'F', 'I', 'J']),
      winner: null,
    },
    // Match 11: Winner H vs Runner-up J
    {
      id: 'r32-11',
      team1: winners['H'] || null,
      team2: runnersUp['J'] || null,
      winner: null,
    },
    // Match 12: Runner-up K vs Runner-up L
    {
      id: 'r32-12',
      team1: runnersUp['K'] || null,
      team2: runnersUp['L'] || null,
      winner: null,
    },
    // Match 13: Winner B vs Best 3rd (E/F/G/I/J)
    {
      id: 'r32-13',
      team1: winners['B'] || null,
      team2: getThirdPlaceTeam(['E', 'F', 'G', 'I', 'J']),
      winner: null,
    },
    // Match 14: Runner-up D vs Runner-up G
    {
      id: 'r32-14',
      team1: runnersUp['D'] || null,
      team2: runnersUp['G'] || null,
      winner: null,
    },
    // Match 15: Winner J vs Runner-up H
    {
      id: 'r32-15',
      team1: winners['J'] || null,
      team2: runnersUp['H'] || null,
      winner: null,
    },
    // Match 16: Winner K vs Best 3rd (D/E/I/J/L)
    {
      id: 'r32-16',
      team1: winners['K'] || null,
      team2: getThirdPlaceTeam(['D', 'E', 'I', 'J', 'L']),
      winner: null,
    },
  ];

  const bracket = initializeBracket();
  bracket.roundOf32 = roundOf32;
  return bracket;
}

// Generate Round of 16 from Round of 32 results
function generateRoundOf16(roundOf32: BracketMatch[]): BracketMatch[] {
  const getWinner = (matchIndex: number): string | null => {
    return roundOf32[matchIndex]?.winner || null;
  };

  // Official FIFA Round of 16 pairings
  return [
    // R16-1: Winner R32-1 vs Winner R32-3
    { id: 'r16-1', team1: getWinner(0), team2: getWinner(2), winner: null },
    // R16-2: Winner R32-2 vs Winner R32-5
    { id: 'r16-2', team1: getWinner(1), team2: getWinner(4), winner: null },
    // R16-3: Winner R32-4 vs Winner R32-6
    { id: 'r16-3', team1: getWinner(3), team2: getWinner(5), winner: null },
    // R16-4: Winner R32-7 vs Winner R32-8
    { id: 'r16-4', team1: getWinner(6), team2: getWinner(7), winner: null },
    // R16-5: Winner R32-11 vs Winner R32-12
    { id: 'r16-5', team1: getWinner(10), team2: getWinner(11), winner: null },
    // R16-6: Winner R32-9 vs Winner R32-10
    { id: 'r16-6', team1: getWinner(8), team2: getWinner(9), winner: null },
    // R16-7: Winner R32-14 vs Winner R32-16
    { id: 'r16-7', team1: getWinner(13), team2: getWinner(15), winner: null },
    // R16-8: Winner R32-13 vs Winner R32-15
    { id: 'r16-8', team1: getWinner(12), team2: getWinner(14), winner: null },
  ];
}

// Generate Quarter Finals from Round of 16 results
function generateQuarterFinals(roundOf16: BracketMatch[]): BracketMatch[] {
  const getWinner = (matchIndex: number): string | null => {
    return roundOf16[matchIndex]?.winner || null;
  };

  // Official FIFA Quarter Finals pairings
  return [
    // QF-1: Winner R16-2 vs Winner R16-1
    { id: 'qf-1', team1: getWinner(1), team2: getWinner(0), winner: null },
    // QF-2: Winner R16-5 vs Winner R16-6
    { id: 'qf-2', team1: getWinner(4), team2: getWinner(5), winner: null },
    // QF-3: Winner R16-3 vs Winner R16-4
    { id: 'qf-3', team1: getWinner(2), team2: getWinner(3), winner: null },
    // QF-4: Winner R16-8 vs Winner R16-7
    { id: 'qf-4', team1: getWinner(7), team2: getWinner(6), winner: null },
  ];
}

// Generate Semi Finals from Quarter Finals results
function generateSemiFinals(quarterFinals: BracketMatch[]): BracketMatch[] {
  const getWinner = (matchIndex: number): string | null => {
    return quarterFinals[matchIndex]?.winner || null;
  };

  // Official FIFA Semi Finals pairings
  return [
    // SF-1: Winner QF-1 vs Winner QF-3
    { id: 'sf-1', team1: getWinner(0), team2: getWinner(2), winner: null },
    // SF-2: Winner QF-2 vs Winner QF-4
    { id: 'sf-2', team1: getWinner(1), team2: getWinner(3), winner: null },
  ];
}

// Generate Final and Third Place from Semi Finals results
function generateFinalMatches(semiFinals: BracketMatch[]): { final: BracketMatch; thirdPlace: BracketMatch } {
  const getWinner = (matchIndex: number): string | null => {
    return semiFinals[matchIndex]?.winner || null;
  };

  const getLoser = (matchIndex: number): string | null => {
    const match = semiFinals[matchIndex];
    if (!match || !match.winner) return null;
    return match.team1 === match.winner ? match.team2 : match.team1;
  };

  return {
    // Final: Winner SF-1 vs Winner SF-2
    final: {
      id: 'final',
      team1: getWinner(0),
      team2: getWinner(1),
      winner: null,
    },
    // Third Place: Loser SF-1 vs Loser SF-2
    thirdPlace: {
      id: 'third-place',
      team1: getLoser(0),
      team2: getLoser(1),
      winner: null,
    },
  };
}
