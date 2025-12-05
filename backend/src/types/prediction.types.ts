export interface PredictionData {
  groupStandings: Record<string, unknown>;
  thirdPlaceTeams: string[];
  roundOf32?: Record<string, unknown>;
  roundOf16?: Record<string, unknown>;
  quarterFinals?: Record<string, unknown>;
  semiFinals?: Record<string, unknown>;
  final?: Record<string, unknown>;
  thirdPlace?: Record<string, unknown>;
  champion?: string;
  runnerUp?: string;
}

export interface MatchData {
  match: number;
  team1: string;
  team2: string;
  winner: string | null;
}

export interface PredictionResponse {
  id: string;
  userId: string;
  predictionId: string;
  groupStandings: Record<string, unknown>;
  thirdPlaceTeams: string[];
  champion: string;
  isPaid: boolean;
  imageUrl?: string;
  qrCodeUrl?: string;
  tokenId?: number;
  createdAt: Date;
}