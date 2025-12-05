// World Cup 2026 Groups Data
export const WORLD_CUP_GROUPS = {
  A: ['Canada', 'Mexico', 'Uruguay', 'Jamaica'],
  B: ['USA', 'Wales', 'Iran', 'Scotland'],
  C: ['Argentina', 'Poland', 'Saudi Arabia', 'UAE'],
  D: ['France', 'Denmark', 'Tunisia', 'Peru'],
  E: ['Spain', 'Germany', 'Japan', 'Costa Rica'],
  F: ['Brazil', 'Serbia', 'Switzerland', 'Cameroon'],
  G: ['Portugal', 'Netherlands', 'Nigeria', 'Ghana'],
  H: ['Belgium', 'Croatia', 'Morocco', 'Panama'],
  I: ['England', 'Senegal', 'Ecuador', 'Qatar'],
  J: ['Italy', 'Ukraine', 'Egypt', 'Chile'],
  K: ['Colombia', 'South Korea', 'Australia', 'New Zealand'],
  L: ['Uruguay', 'Sweden', 'Paraguay', 'Trinidad and Tobago'],
};

// Country flags (emoji)
export const COUNTRY_FLAGS: Record<string, string> = {
  'Canada': '🇨🇦',
  'Mexico': '🇲🇽',
  'Uruguay': '🇺🇾',
  'Jamaica': '🇯🇲',
  'USA': '🇺🇸',
  'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Iran': '🇮🇷',
  'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Argentina': '🇦🇷',
  'Poland': '🇵🇱',
  'Saudi Arabia': '🇸🇦',
  'UAE': '🇦🇪',
  'France': '🇫🇷',
  'Denmark': '🇩🇰',
  'Tunisia': '🇹🇳',
  'Peru': '🇵🇪',
  'Spain': '🇪🇸',
  'Germany': '🇩🇪',
  'Japan': '🇯🇵',
  'Costa Rica': '🇨🇷',
  'Brazil': '🇧🇷',
  'Serbia': '🇷🇸',
  'Switzerland': '🇨🇭',
  'Cameroon': '🇨🇲',
  'Portugal': '🇵🇹',
  'Netherlands': '🇳🇱',
  'Nigeria': '🇳🇬',
  'Ghana': '🇬🇭',
  'Belgium': '🇧🇪',
  'Croatia': '🇭🇷',
  'Morocco': '🇲🇦',
  'Panama': '🇵🇦',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Senegal': '🇸🇳',
  'Ecuador': '🇪🇨',
  'Qatar': '🇶🇦',
  'Italy': '🇮🇹',
  'Ukraine': '🇺🇦',
  'Egypt': '🇪🇬',
  'Chile': '🇨🇱',
  'Colombia': '🇨🇴',
  'South Korea': '🇰🇷',
  'Australia': '🇦🇺',
  'New Zealand': '🇳🇿',
  'Sweden': '🇸🇪',
  'Paraguay': '🇵🇾',
  'Trinidad and Tobago': '🇹🇹',
};

export type GroupName = keyof typeof WORLD_CUP_GROUPS;
export type TeamName = string;

export interface GroupStanding {
  [groupName: string]: TeamName[];
}

export interface BracketMatch {
  id: string;
  team1: TeamName | null;
  team2: TeamName | null;
  winner: TeamName | null;
}

export interface TournamentBracket {
  roundOf32: BracketMatch[];
  roundOf16: BracketMatch[];
  quarterFinals: BracketMatch[];
  semiFinals: BracketMatch[];
  thirdPlace: BracketMatch | null;
  final: BracketMatch | null;
}
