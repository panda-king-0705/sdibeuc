/**
 * Shuffling and dealing.
 *
 * The shuffle is seedable so deals are reproducible in tests and so a server can
 * recreate a board from a stored seed without storing all 52 cards.
 */

import { Card, Seat, SEATS, Suit, SUITS, Rank, makeDeck } from './cards';

export type Hand = Card[];

export interface Deal {
  readonly N: Hand;
  readonly E: Hand;
  readonly S: Hand;
  readonly W: Hand;
}

/** Deterministic PRNG (mulberry32) so a numeric seed reproduces a deal exactly. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** In-place Fisher-Yates using the supplied random source. */
export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** Sort a hand for display: suits S,H,D,C, high rank first within a suit. */
const DISPLAY_SUIT_ORDER: Suit[] = ['S', 'H', 'D', 'C'];
export function sortHand(hand: Hand): Hand {
  return [...hand].sort((a, b) => {
    const s = DISPLAY_SUIT_ORDER.indexOf(a.suit) - DISPLAY_SUIT_ORDER.indexOf(b.suit);
    return s !== 0 ? s : b.rank - a.rank;
  });
}

/**
 * Deal a full board. With a seed the result is deterministic; without one it
 * uses Math.random. Each seat receives 13 sorted cards.
 */
export function deal(seed?: number): Deal {
  const rng = seed === undefined ? Math.random : mulberry32(seed);
  const deck = shuffle(makeDeck(), rng);
  const hands: Record<Seat, Hand> = { N: [], E: [], S: [], W: [] };
  deck.forEach((card, i) => {
    hands[SEATS[i % 4]].push(card);
  });
  return {
    N: sortHand(hands.N),
    E: sortHand(hands.E),
    S: sortHand(hands.S),
    W: sortHand(hands.W),
  };
}

/** Sanity check that a deal is a legal partition of the 52-card deck. */
export function isValidDeal(d: Deal): boolean {
  const seen = new Set<string>();
  for (const seat of SEATS) {
    if (d[seat].length !== 13) return false;
    for (const c of d[seat]) {
      const key = `${c.suit}${c.rank}`;
      if (seen.has(key)) return false;
      seen.add(key);
    }
  }
  return seen.size === 52;
}

export { SUITS, SEATS };
export type { Rank };
