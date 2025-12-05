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
    // When moving to Round of 32, generate matches if not already generated
    if (currentStep.type === 'matchPrediction' && currentStep.round === 'roundOf32' && bracket.roundOf32.length === 0) {
      const generatedBracket = generateRoundOf32(groupStandings, thirdPlaceTeams);
      setBracket(generatedBracket);
    }
  }, [currentStepIndex, currentStep, groupStandings, thirdPlaceTeams, bracket.roundOf32.length]);

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
  // Extract qualified teams
  const winners: string[] = [];
  const runnersUp: string[] = [];

  Object.keys(groupStandings).sort().forEach(group => {
    const standings = groupStandings[group];
    if (standings && standings.length >= 2) {
      winners.push(standings[0]);
      runnersUp.push(standings[1]);
    }
  });

  // Combine all qualified teams (24 winners + 24 runners-up + 8 third place = 56 teams)
  // For a 32-team knockout, we need to determine the 32 qualified teams
  // Based on FIFA 2026 format: Top 2 from each group (24) + 8 best third-place teams = 32 teams
  const qualifiedTeams = [...winners, ...runnersUp];

  // If we have exactly 48 teams (12 groups × 4), and 24+24+8 = 56 teams qualify,
  // we need to adjust. Actually, 2026 format has 48 teams total with specific qualification rules.
  // For simplicity, let's assume top 2 from each of 12 groups (24) + 8 third place = 32 teams.

  const allQualified = [...winners, ...runnersUp.slice(0, 16), ...thirdPlaceTeams];

  // Generate Round of 32 matches
  const roundOf32: BracketMatch[] = [];
  for (let i = 0; i < 16; i++) {
    roundOf32.push({
      id: `r32-${i}`,
      team1: allQualified[i * 2] || null,
      team2: allQualified[i * 2 + 1] || null,
      winner: null,
    });
  }

  const bracket = initializeBracket();
  bracket.roundOf32 = roundOf32;
  return bracket;
}
