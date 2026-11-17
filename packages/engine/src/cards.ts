/**
 * Core card model for contract bridge.
 *
 * Original implementation. Bridge is a public-domain game; this encodes the
 * standard 52-card deck and the ordering rules the rest of the engine relies on.
 */

export const SUITS = ['C', 'D', 'H', 'S'] as const;
export type Suit = (typeof SUITS)[number];

/** A strain is what a contract can be played in: a suit, or no-trump. */
export const STRAINS = ['C', 'D', 'H', 'S', 'NT'] as const;
export type Strain = (typeof STRAINS)[number];

/** Rank as a number so comparisons are trivial: 2..10 literal, J=11, Q=12, K=13, A=14. */
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
export const RANKS: readonly Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export const SEATS = ['N', 'E', 'S', 'W'] as const;
export type Seat = (typeof SEATS)[number];

export interface Card {
  readonly suit: Suit;
  readonly rank: Rank;
}

const RANK_LABEL: Record<Rank, string> = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
  11: 'J', 12: 'Q', 13: 'K', 14: 'A',
};

const SUIT_SYMBOL: Record<Suit, string> = { C: '♣', D: '♦', H: '♥', S: '♠' };

export function cardLabel(c: Card): string {
  return `${RANK_LABEL[c.rank]}${SUIT_SYMBOL[c.suit]}`;
}

/** Strain ordering used for auction comparisons: clubs lowest, no-trump highest. */
export function strainRank(s: Strain): number {
  return STRAINS.indexOf(s);
}

/** A fresh, ordered 52-card deck. */
export function makeDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

/** Partnership of a seat: N/S are one side, E/W the other. */
export function sideOf(seat: Seat): 'NS' | 'EW' {
  return seat === 'N' || seat === 'S' ? 'NS' : 'EW';
}

/** The seat clockwise after the given one (N→E→S→W→N). */
export function nextSeat(seat: Seat): Seat {
  return SEATS[(SEATS.indexOf(seat) + 1) % 4];
}
