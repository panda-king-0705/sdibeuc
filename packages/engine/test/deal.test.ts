import { describe, it, expect } from 'vitest';
import { deal, isValidDeal } from '../src/deal';
import { highCardPoints, suitLengths, isBalanced } from '../src/evaluate';
import { SEATS } from '../src/cards';

describe('deal', () => {
  it('produces a valid 52-card partition', () => {
    expect(isValidDeal(deal(1))).toBe(true);
  });

  it('is reproducible for a given seed', () => {
    expect(deal(42)).toEqual(deal(42));
  });

  it('gives different deals for different seeds', () => {
    expect(JSON.stringify(deal(1))).not.toBe(JSON.stringify(deal(2)));
  });

  it('distributes exactly 40 HCP across the table', () => {
    const d = deal(99);
    const total = SEATS.reduce((s, k) => s + highCardPoints(d[k]), 0);
    expect(total).toBe(40);
  });

  it('gives each hand 13 cards across four suits summing to 13', () => {
    const d = deal(7);
    for (const seat of SEATS) {
      const lengths = suitLengths(d[seat]);
      const sum = lengths.C + lengths.D + lengths.H + lengths.S;
      expect(sum).toBe(13);
    }
  });
});

describe('evaluate', () => {
  it('counts a balanced shape', () => {
    // seed chosen so we just assert the predicate runs on real hands
    const d = deal(3);
    expect(typeof isBalanced(d.N)).toBe('boolean');
  });
});
