// World Cup 2026 Groups Data - Official Draw Results (December 5, 2025)
export const WORLD_CUP_GROUPS = {
  A: ['Mexico', 'South Africa', 'South Korea', 'Winner UEFA Play-off D'],
  B: ['Canada', 'Winner UEFA Play-off A', 'Qatar', 'Switzerland'],
  C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  D: ['USA', 'Paraguay', 'Australia', 'Winner UEFA Play-off C'],
  E: ['Germany', 'Curaçao', 'Côte d\'Ivoire', 'Ecuador'],
  F: ['Netherlands', 'Japan', 'Winner UEFA Play-off B', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'IR Iran', 'New Zealand'],
  H: ['Spain', 'Cabo Verde', 'Saudi Arabia', 'Uruguay'],
  I: ['France', 'Senegal', 'Winner FIFA Play-off 2', 'Norway'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'Winner FIFA Play-off 1', 'Uzbekistan', 'Colombia'],
  L: ['England', 'Croatia', 'Ghana', 'Panama'],
};

// Country flags (emoji)
export const COUNTRY_FLAGS: Record<string, string> = {
  // Group A
  'Mexico': '🇲🇽',
  'South Africa': '🇿🇦',
  'South Korea': '🇰🇷',
  'Winner UEFA Play-off D': '🏴',
  // Group B
  'Canada': '🇨🇦',
  'Winner UEFA Play-off A': '🏴',
  'Qatar': '🇶🇦',
  'Switzerland': '🇨🇭',
  // Group C
  'Brazil': '🇧🇷',
  'Morocco': '🇲🇦',
  'Haiti': '🇭🇹',
  'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  // Group D
  'USA': '🇺🇸',
  'Paraguay': '🇵🇾',
  'Australia': '🇦🇺',
  'Winner UEFA Play-off C': '🏴',
  // Group E
  'Germany': '🇩🇪',
  'Curaçao': '🇨🇼',
  'Côte d\'Ivoire': '🇨🇮',
  'Ecuador': '🇪🇨',
  // Group F
  'Netherlands': '🇳🇱',
  'Japan': '🇯🇵',
  'Winner UEFA Play-off B': '🏴',
  'Tunisia': '🇹🇳',
  // Group G
  'Belgium': '🇧🇪',
  'Egypt': '🇪🇬',
  'IR Iran': '🇮🇷',
  'New Zealand': '🇳🇿',
  // Group H
  'Spain': '🇪🇸',
  'Cabo Verde': '🇨🇻',
  'Saudi Arabia': '🇸🇦',
  'Uruguay': '🇺🇾',
  // Group I
  'France': '🇫🇷',
  'Senegal': '🇸🇳',
  'Winner FIFA Play-off 2': '🏴',
  'Norway': '🇳🇴',
  // Group J
  'Argentina': '🇦🇷',
  'Algeria': '🇩🇿',
  'Austria': '🇦🇹',
  'Jordan': '🇯🇴',
  // Group K
  'Portugal': '🇵🇹',
  'Winner FIFA Play-off 1': '🏴',
  'Uzbekistan': '🇺🇿',
  'Colombia': '🇨🇴',
  // Group L
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Croatia': '🇭🇷',
  'Ghana': '🇬🇭',
  'Panama': '🇵🇦',
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
