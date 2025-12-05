import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TournamentBracket, GroupStanding } from '@/data/worldcup2026';

interface PredictionState {
  // Group stage
  groupStandings: GroupStanding;
  thirdPlaceTeams: string[];

  // Tournament bracket
  bracket: TournamentBracket;

  // Prediction metadata
  predictionId: string | null;
  isPaid: boolean;
  createdAt: Date | null;

  // Actions
  setGroupStandings: (group: string, teams: string[]) => void;
  setThirdPlaceTeams: (teams: string[]) => void;
  setBracket: (bracket: TournamentBracket) => void;
  setPredictionId: (id: string) => void;
  setIsPaid: (isPaid: boolean) => void;

  // Complete prediction submission
  submitPrediction: () => Promise<void>;

  // Utility
  reset: () => void;
  loadPrediction: (data: any) => void;
}

const initialBracket: TournamentBracket = {
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

export const usePredictionStore = create<PredictionState>()(
  persist(
    (set, get) => ({
      // Initial state
      groupStandings: {},
      thirdPlaceTeams: [],
      bracket: initialBracket,
      predictionId: null,
      isPaid: false,
      createdAt: null,

      // Actions
      setGroupStandings: (group, teams) =>
        set((state) => ({
          groupStandings: { ...state.groupStandings, [group]: teams },
        })),

      setThirdPlaceTeams: (teams) => set({ thirdPlaceTeams: teams }),

      setBracket: (bracket) => set({ bracket }),

      setPredictionId: (id) => set({ predictionId: id }),

      setIsPaid: (isPaid) => set({ isPaid }),

      submitPrediction: async () => {
        const state = get();

        // TODO: Implement API call to submit prediction
        console.log('Submitting prediction:', {
          groupStandings: state.groupStandings,
          thirdPlaceTeams: state.thirdPlaceTeams,
          bracket: state.bracket,
        });

        // Simulated API call
        // const response = await api.post('/predictions', {
        //   groupStandings: state.groupStandings,
        //   thirdPlaceTeams: state.thirdPlaceTeams,
        //   knockoutPredictions: convertBracketToKnockoutPredictions(state.bracket),
        // });

        // Set prediction ID after submission
        // set({
        //   predictionId: response.data.data.id,
        //   createdAt: new Date(),
        // });
      },

      loadPrediction: (data) => {
        set({
          groupStandings: data.groupStandings || {},
          thirdPlaceTeams: data.thirdPlaceTeams || [],
          bracket: data.bracket || initialBracket,
          predictionId: data.id || null,
          isPaid: data.isPaid || false,
          createdAt: data.createdAt ? new Date(data.createdAt) : null,
        });
      },

      reset: () =>
        set({
          groupStandings: {},
          thirdPlaceTeams: [],
          bracket: initialBracket,
          predictionId: null,
          isPaid: false,
          createdAt: null,
        }),
    }),
    {
      name: 'prediction-storage',
      partialize: (state) => ({
        groupStandings: state.groupStandings,
        thirdPlaceTeams: state.thirdPlaceTeams,
        bracket: state.bracket,
        predictionId: state.predictionId,
        isPaid: state.isPaid,
        createdAt: state.createdAt,
      }),
    }
  )
);