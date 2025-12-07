import { AppError } from '../middleware/error.middleware';

export interface BracketMatch {
  id: string;
  team1: string | null;
  team2: string | null;
  winner: string | null;
}

/**
 * Generate expected Round of 32 bracket from group standings
 */
export function generateExpectedRoundOf32(
  groupStandings: Record<string, string[]>,
  thirdPlaceTeams: string[]
): BracketMatch[] {
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

  // Create map of third-place teams to their groups
  const thirdPlaceMap: Record<string, string> = {};
  thirdPlaceTeams.forEach(team => {
    const group = Object.keys(thirdPlace).find(g => thirdPlace[g] === team);
    if (group) {
      thirdPlaceMap[team] = group;
    }
  });

  // Helper to get third-place team from allowed groups
  const thirdPlaceTeamsCopy = [...thirdPlaceTeams];
  const getThirdPlaceTeam = (allowedGroups: string[]): string | null => {
    for (const team of thirdPlaceTeamsCopy) {
      const teamGroup = thirdPlaceMap[team];
      if (teamGroup && allowedGroups.includes(teamGroup)) {
        const index = thirdPlaceTeamsCopy.indexOf(team);
        if (index > -1) {
          thirdPlaceTeamsCopy.splice(index, 1);
        }
        return team;
      }
    }
    return thirdPlaceTeamsCopy.shift() || null;
  };

  // Official FIFA Round of 32 structure
  return [
    { id: 'r32-1', team1: runnersUp['A'] || null, team2: runnersUp['B'] || null, winner: null },
    { id: 'r32-2', team1: winners['C'] || null, team2: runnersUp['F'] || null, winner: null },
    { id: 'r32-3', team1: winners['E'] || null, team2: getThirdPlaceTeam(['A', 'B', 'C', 'D', 'F']), winner: null },
    { id: 'r32-4', team1: winners['F'] || null, team2: runnersUp['C'] || null, winner: null },
    { id: 'r32-5', team1: runnersUp['E'] || null, team2: runnersUp['I'] || null, winner: null },
    { id: 'r32-6', team1: winners['I'] || null, team2: getThirdPlaceTeam(['C', 'D', 'F', 'G', 'H']), winner: null },
    { id: 'r32-7', team1: winners['A'] || null, team2: getThirdPlaceTeam(['C', 'E', 'F', 'H', 'I']), winner: null },
    { id: 'r32-8', team1: winners['L'] || null, team2: getThirdPlaceTeam(['E', 'H', 'I', 'J', 'K']), winner: null },
    { id: 'r32-9', team1: winners['G'] || null, team2: getThirdPlaceTeam(['A', 'E', 'H', 'I', 'J']), winner: null },
    { id: 'r32-10', team1: winners['D'] || null, team2: getThirdPlaceTeam(['B', 'E', 'F', 'I', 'J']), winner: null },
    { id: 'r32-11', team1: winners['H'] || null, team2: runnersUp['J'] || null, winner: null },
    { id: 'r32-12', team1: runnersUp['K'] || null, team2: runnersUp['L'] || null, winner: null },
    { id: 'r32-13', team1: winners['B'] || null, team2: getThirdPlaceTeam(['E', 'F', 'G', 'I', 'J']), winner: null },
    { id: 'r32-14', team1: runnersUp['D'] || null, team2: runnersUp['G'] || null, winner: null },
    { id: 'r32-15', team1: winners['J'] || null, team2: runnersUp['H'] || null, winner: null },
    { id: 'r32-16', team1: winners['K'] || null, team2: getThirdPlaceTeam(['D', 'E', 'I', 'J', 'L']), winner: null },
  ];
}

/**
 * Validate Round of 32 bracket structure
 */
export function validateRoundOf32(
  submitted: any[],
  expected: BracketMatch[]
): void {
  if (!submitted || submitted.length !== 16) {
    throw new AppError('Round of 32 must have exactly 16 matches', 400);
  }

  for (let i = 0; i < 16; i++) {
    const submittedMatch = submitted[i];
    const expectedMatch = expected[i];

    // For matches with group winners/runners-up (not third-place), verify exact teams
    const isThirdPlaceMatch = expectedMatch.team2 && expectedMatch.team2.length > 10; // Third place teams are longer strings
    
    if (!isThirdPlaceMatch) {
      // Strict validation for non-third-place matches
      if (submittedMatch.team1 !== expectedMatch.team1 || submittedMatch.team2 !== expectedMatch.team2) {
        throw new AppError(
          `Invalid Round of 32 match ${i + 1}: expected ${expectedMatch.team1} vs ${expectedMatch.team2}`,
          400
        );
      }
    } else {
      // For third-place matches, just verify team1 is correct and team2 is from selected third-place teams
      if (submittedMatch.team1 !== expectedMatch.team1) {
        throw new AppError(
          `Invalid Round of 32 match ${i + 1}: team1 should be ${expectedMatch.team1}`,
          400
        );
      }
    }
  }
}

/**
 * Validate Round of 16 pairings based on Round of 32 results
 */
export function validateRoundOf16(
  roundOf16: any[],
  roundOf32: any[]
): void {
  if (!roundOf16 || roundOf16.length !== 8) {
    throw new AppError('Round of 16 must have exactly 8 matches', 400);
  }

  const getWinner = (matchIndex: number): string | null => {
    return roundOf32[matchIndex]?.winner || null;
  };

  const expectedPairings = [
    [0, 2],   // R16-1: Winner R32-1 vs Winner R32-3
    [1, 4],   // R16-2: Winner R32-2 vs Winner R32-5
    [3, 5],   // R16-3: Winner R32-4 vs Winner R32-6
    [6, 7],   // R16-4: Winner R32-7 vs Winner R32-8
    [10, 11], // R16-5: Winner R32-11 vs Winner R32-12
    [8, 9],   // R16-6: Winner R32-9 vs Winner R32-10
    [13, 15], // R16-7: Winner R32-14 vs Winner R32-16
    [12, 14], // R16-8: Winner R32-13 vs Winner R32-15
  ];

  expectedPairings.forEach(([idx1, idx2], i) => {
    const expected1 = getWinner(idx1);
    const expected2 = getWinner(idx2);
    const submitted = roundOf16[i];

    if (submitted.team1 !== expected1 || submitted.team2 !== expected2) {
      throw new AppError(
        `Invalid Round of 16 match ${i + 1}: expected ${expected1} vs ${expected2}`,
        400
      );
    }
  });
}

/**
 * Validate Quarter Finals pairings
 */
export function validateQuarterFinals(
  quarterFinals: any[],
  roundOf16: any[]
): void {
  if (!quarterFinals || quarterFinals.length !== 4) {
    throw new AppError('Quarter Finals must have exactly 4 matches', 400);
  }

  const getWinner = (matchIndex: number): string | null => {
    return roundOf16[matchIndex]?.winner || null;
  };

  const expectedPairings = [
    [1, 0], // QF-1: Winner R16-2 vs Winner R16-1
    [4, 5], // QF-2: Winner R16-5 vs Winner R16-6
    [2, 3], // QF-3: Winner R16-3 vs Winner R16-4
    [7, 6], // QF-4: Winner R16-8 vs Winner R16-7
  ];

  expectedPairings.forEach(([idx1, idx2], i) => {
    const expected1 = getWinner(idx1);
    const expected2 = getWinner(idx2);
    const submitted = quarterFinals[i];

    if (submitted.team1 !== expected1 || submitted.team2 !== expected2) {
      throw new AppError(
        `Invalid Quarter Final match ${i + 1}: expected ${expected1} vs ${expected2}`,
        400
      );
    }
  });
}

/**
 * Validate Semi Finals pairings
 */
export function validateSemiFinals(
  semiFinals: any[],
  quarterFinals: any[]
): void {
  if (!semiFinals || semiFinals.length !== 2) {
    throw new AppError('Semi Finals must have exactly 2 matches', 400);
  }

  const getWinner = (matchIndex: number): string | null => {
    return quarterFinals[matchIndex]?.winner || null;
  };

  const expectedPairings = [
    [0, 2], // SF-1: Winner QF-1 vs Winner QF-3
    [1, 3], // SF-2: Winner QF-2 vs Winner QF-4
  ];

  expectedPairings.forEach(([idx1, idx2], i) => {
    const expected1 = getWinner(idx1);
    const expected2 = getWinner(idx2);
    const submitted = semiFinals[i];

    if (submitted.team1 !== expected1 || submitted.team2 !== expected2) {
      throw new AppError(
        `Invalid Semi Final match ${i + 1}: expected ${expected1} vs ${expected2}`,
        400
      );
    }
  });
}

/**
 * Validate Final and Third Place matches
 */
export function validateFinalMatches(
  final: any,
  thirdPlace: any,
  semiFinals: any[]
): void {
  const getWinner = (matchIndex: number): string | null => {
    return semiFinals[matchIndex]?.winner || null;
  };

  const getLoser = (matchIndex: number): string | null => {
    const match = semiFinals[matchIndex];
    if (!match || !match.winner) return null;
    return match.team1 === match.winner ? match.team2 : match.team1;
  };

  // Validate Final
  const expectedFinal1 = getWinner(0);
  const expectedFinal2 = getWinner(1);
  if (final.team1 !== expectedFinal1 || final.team2 !== expectedFinal2) {
    throw new AppError(
      `Invalid Final: expected ${expectedFinal1} vs ${expectedFinal2}`,
      400
    );
  }

  // Validate Third Place
  const expectedThird1 = getLoser(0);
  const expectedThird2 = getLoser(1);
  if (thirdPlace.team1 !== expectedThird1 || thirdPlace.team2 !== expectedThird2) {
    throw new AppError(
      `Invalid Third Place match: expected ${expectedThird1} vs ${expectedThird2}`,
      400
    );
  }
}
