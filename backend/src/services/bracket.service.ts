import logger from '../utils/logger';

export interface Match {
  match: number;
  team1: string;
  team2: string;
  winner: string | null;
}

export function generateRound32Matches(
  groupStandings: Record<string, string[]>,
  thirdPlaceTeams: string[]
): Match[] {
  const matches: Match[] = [];
  const groups = Object.keys(groupStandings).sort();

  // Get all qualified teams
  const winners = groups.map(g => groupStandings[g][0]);
  const runnersUp = groups.map(g => groupStandings[g][1]);

  // Combine: 12 winners + 12 runners-up + 8 third place = 32 teams
  const qualifiedTeams = [
    ...winners,
    ...runnersUp,
    ...thirdPlaceTeams,
  ];

  // Generate 16 matches (simplified bracket structure)
  // In production, implement full FIFA bracket logic
  for (let i = 0; i < 16; i++) {
    matches.push({
      match: i + 1,
      team1: qualifiedTeams[i * 2],
      team2: qualifiedTeams[i * 2 + 1],
      winner: null,
    });
  }

  logger.debug(`Generated ${matches.length} Round of 32 matches`);

  return matches;
}

export function advanceToNextRound(currentRound: Record<string, Match>): Match[] {
  const winners = Object.values(currentRound)
    .filter(match => match.winner)
    .map(match => match.winner!);

  if (winners.length === 0) {
    return [];
  }

  const nextMatches: Match[] = [];
  for (let i = 0; i < winners.length; i += 2) {
    if (winners[i + 1]) {
      nextMatches.push({
        match: Math.floor(i / 2) + 1,
        team1: winners[i],
        team2: winners[i + 1],
        winner: null,
      });
    }
  }

  logger.debug(`Advanced ${winners.length} teams to next round`);

  return nextMatches;
}

export function validateKnockoutProgression(
  roundOf32: Record<string, Match>,
  roundOf16: Record<string, Match>,
  quarterFinals: Record<string, Match>,
  semiFinals: Record<string, Match>,
  final: Record<string, Match>,
  thirdPlaceMatch?: Record<string, Match>
): boolean {
  // Validate Round of 32 to Round of 16 progression
  const r32Winners = Object.values(roundOf32)
    .filter(m => m.winner)
    .map(m => m.winner);

  const r16Teams = Object.values(roundOf16)
    .flatMap(m => [m.team1, m.team2]);

  const validR16 = r16Teams.every(team => r32Winners.includes(team));
  
  if (!validR16) {
    logger.warn('Invalid R16 progression from R32');
    return false;
  }

  // Validate Round of 16 to Quarter Finals progression
  const r16Winners = Object.values(roundOf16)
    .filter(m => m.winner)
    .map(m => m.winner);

  const quarterFinalTeams = Object.values(quarterFinals)
    .flatMap(m => [m.team1, m.team2]);

  const validQuarterFinals = quarterFinalTeams.every(team => r16Winners.includes(team));
  
  if (!validQuarterFinals) {
    logger.warn('Invalid Quarter Finals progression from R16');
    return false;
  }

  // Validate Quarter Finals to Semi Finals progression
  const quarterFinalWinners = Object.values(quarterFinals)
    .filter(m => m.winner)
    .map(m => m.winner);

  const semiFinalTeams = Object.values(semiFinals)
    .flatMap(m => [m.team1, m.team2]);

  const validSemiFinals = semiFinalTeams.every(team => quarterFinalWinners.includes(team));
  
  if (!validSemiFinals) {
    logger.warn('Invalid Semi Finals progression from Quarter Finals');
    return false;
  }

  // Validate Semi Finals to Final progression
  const semiFinalWinners = Object.values(semiFinals)
    .filter(m => m.winner)
    .map(m => m.winner);

  const finalTeams = Object.values(final)
    .flatMap(m => [m.team1, m.team2]);

  const validFinal = finalTeams.every(team => semiFinalWinners.includes(team));
  
  if (!validFinal) {
    logger.warn('Invalid Final progression from Semi Finals');
    return false;
  }

  // Validate Semi Finals to 3rd Place Match progression
  if (thirdPlaceMatch) {
    const semiFinalLosers = Object.values(semiFinals)
      .filter(m => m.winner && m.team1 && m.team2)
      .map(m => m.winner === m.team1 ? m.team2 : m.team1);

    const thirdPlaceTeams = Object.values(thirdPlaceMatch)
      .flatMap(m => [m.team1, m.team2]);

    const validThirdPlace = thirdPlaceTeams.every(team => semiFinalLosers.includes(team));
    
    if (!validThirdPlace) {
      logger.warn('Invalid 3rd Place Match progression from Semi Finals');
      return false;
    }
  }

  // Additional validation: Check for duplicate matches and ensure all matches have required data
  const allRounds = [roundOf32, roundOf16, quarterFinals, semiFinals, final];
  if (thirdPlaceMatch) allRounds.push(thirdPlaceMatch);

  for (const round of allRounds) {
    const matches = Object.values(round);
    
    // Check if all matches have teams defined
    const hasValidTeams = matches.every(m => m.team1 && m.team2);
    if (!hasValidTeams) {
      logger.warn('Some matches are missing teams');
      return false;
    }

    // Check for duplicate teams in the same match
    const hasDuplicateTeams = matches.some(m => m.team1 === m.team2);
    if (hasDuplicateTeams) {
      logger.warn('Found matches with duplicate teams');
      return false;
    }

    // Check for duplicate matches in the same round
    const matchPairs = matches.map(m => [m.team1, m.team2].sort().join(' vs '));
    const uniqueMatches = new Set(matchPairs);
    if (uniqueMatches.size !== matchPairs.length) {
      logger.warn('Found duplicate matches in the same round');
      return false;
    }
  }

  logger.info('All knockout progression validations passed');
  return true;
}

// Additional utility function to validate match completeness
export function validateMatchesComplete(round: Record<string, Match>): boolean {
  const matches = Object.values(round);
  return matches.every(m => 
    m.team1 && 
    m.team2 && 
    m.winner && 
    (m.winner === m.team1 || m.winner === m.team2)
  );
}
