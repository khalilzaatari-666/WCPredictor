// World Cup 2026 Groups Data - Official Draw Results (December 5, 2025)
export const WORLD_CUP_GROUPS = {
  A: ['Mexico', 'South Africa', 'South Korea', 'Winner UEFA PO D (DEN/CZE/IRL/MKD)'],
  B: ['Canada', 'Winner UEFA PO A (ITA/WAL/NIR/BIH)', 'Qatar', 'Switzerland'],
  C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  D: ['USA', 'Paraguay', 'Australia', 'Winner UEFA PO C (TUR/ROU/SVK/KOS)'],
  E: ['Germany', 'Curaçao', 'Côte d\'Ivoire', 'Ecuador'],
  F: ['Netherlands', 'Japan', 'Winner UEFA PO B (SWE/UKR/POL/ALB)', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'IR Iran', 'New Zealand'],
  H: ['Spain', 'Cabo Verde', 'Saudi Arabia', 'Uruguay'],
  I: ['France', 'Senegal', 'Winner FIFA PO 2 (IRQ/BOL/SUR)', 'Norway'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'Winner FIFA PO 1 (COD/JAM/NCL)', 'Uzbekistan', 'Colombia'],
  L: ['England', 'Croatia', 'Ghana', 'Panama'],
};

// Country flags (emoji)
export const COUNTRY_FLAGS: Record<string, string> = {
  // Group A
  'Mexico': '🇲🇽',
  'South Africa': '🇿🇦',
  'South Korea': '🇰🇷',
  'Winner UEFA PO D (DEN/CZE/IRL/MKD)': '🇪🇺',
  // Group B
  'Canada': '🇨🇦',
  'Winner UEFA PO A (ITA/WAL/NIR/BIH)': '🇪🇺',
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
  'Winner UEFA PO C (TUR/ROU/SVK/KOS)': '🇪🇺',
  // Group E
  'Germany': '🇩🇪',
  'Curaçao': '🇨🇼',
  'Côte d\'Ivoire': '🇨🇮',
  'Ecuador': '🇪🇨',
  // Group F
  'Netherlands': '🇳🇱',
  'Japan': '🇯🇵',
  'Winner UEFA PO B (SWE/UKR/POL/ALB)': '🇪🇺',
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
  'Winner FIFA PO 2 (IRQ/BOL/SUR)': '🌍',
  'Norway': '🇳🇴',
  // Group J
  'Argentina': '🇦🇷',
  'Algeria': '🇩🇿',
  'Austria': '🇦🇹',
  'Jordan': '🇯🇴',
  // Group K
  'Portugal': '🇵🇹',
  'Winner FIFA PO 1 (COD/JAM/NCL)': '🌍',
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
