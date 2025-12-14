export interface PredictionData {
  groupStandings: Record<string, unknown>;
  thirdPlaceTeams: string[];
  roundOf32?: unknown[];
  roundOf16?: unknown[];
  quarterFinals?: unknown[];
  semiFinals?: unknown[];
  final?: unknown;
  thirdPlace?: unknown;
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