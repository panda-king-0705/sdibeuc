/**
 * Hand evaluation helpers: high-card points and shape.
 *
 * Uses the standard Milton Work point count (A=4, K=3, Q=2, J=1), which is a
 * common-knowledge heuristic, not anyone's proprietary system.
 */

import { Hand } from './deal';
import { Suit, SUITS, Rank } from './cards';

const HCP_BY_RANK: Partial<Record<Rank, number>> = { 14: 4, 13: 3, 12: 2, 11: 1 };

/** Milton Work high-card points for a hand. */
export function highCardPoints(hand: Hand): number {
  return hand.reduce((sum, c) => sum + (HCP_BY_RANK[c.rank] ?? 0), 0);
}

/** Count of cards in each suit. */
export function suitLengths(hand: Hand): Record<Suit, number> {
  const lengths: Record<Suit, number> = { C: 0, D: 0, H: 0, S: 0 };
  for (const c of hand) lengths[c.suit]++;
  return lengths;
}

/** Shape as a descending-length tuple, e.g. a 5-4-3-1 hand → [5,4,3,1]. */
export function shape(hand: Hand): number[] {
  return SUITS.map((s) => suitLengths(hand)[s]).sort((a, b) => b - a);
}

/**
 * Distribution points by shortness (void=3, singleton=2, doubleton=1), the
 * usual adjustment when a suit fit is assumed.
 */
export function distributionPoints(hand: Hand): number {
  const lengths = suitLengths(hand);
  return SUITS.reduce((sum, s) => {
    const len = lengths[s];
    if (len === 0) return sum + 3;
    if (len === 1) return sum + 2;
    if (len === 2) return sum + 1;
    return sum;
  }, 0);
}

export function isBalanced(hand: Hand): boolean {
  const sh = shape(hand);
  // Balanced = 4333, 4432, or 5332.
  const asStr = sh.join('');
  return asStr === '4333' || asStr === '4432' || asStr === '5332';
}
