import { describe, it, expect } from 'vitest';
import {
  createAuction, applyCall, parseCall, getContract, isAuctionOver, legalCalls,
} from '../src/auction';

function play(dealer: Parameters<typeof createAuction>[0], calls: string[]) {
  let a = createAuction(dealer);
  for (const c of calls) a = applyCall(a, parseCall(c));
  return a;
}

describe('auction termination & contract', () => {
  it('ends after three passes following a bid', () => {
    const a = play('N', ['1NT', 'P', '3NT', 'P', 'P', 'P']);
    expect(isAuctionOver(a)).toBe(true);
    expect(getContract(a)).toMatchObject({ level: 3, strain: 'NT', declarer: 'N', doubled: 'none' });
  });

  it('returns null contract when passed out', () => {
    const a = play('E', ['P', 'P', 'P', 'P']);
    expect(isAuctionOver(a)).toBe(true);
    expect(getContract(a)).toBeNull();
  });

  it('assigns declarer to the first of the side to name the strain', () => {
    const a = play('N', ['1H', 'P', '4H', 'P', 'P', 'P']);
    expect(getContract(a)!.declarer).toBe('N');
  });

  it('is not over before three trailing passes', () => {
    const a = play('N', ['1S', 'P', 'P']);
    expect(isAuctionOver(a)).toBe(false);
  });
});

describe('call legality', () => {
  it('rejects a bid that is not higher than the last', () => {
    const a = play('N', ['2S']);
    expect(() => applyCall(a, parseCall('2H'))).toThrow();
  });

  it('allows a higher bid', () => {
    const a = play('N', ['2S']);
    expect(() => applyCall(a, parseCall('3C'))).not.toThrow();
  });

  it('allows doubling an opponent but not partner', () => {
    const afterN = play('N', ['1S']);             // E to call, N is an opponent
    expect(() => applyCall(afterN, parseCall('X'))).not.toThrow();
    const afterNP = play('N', ['1S', 'P']);        // S to call, N is partner
    expect(() => applyCall(afterNP, parseCall('X'))).toThrow();
  });

  it('allows redouble only over a standing double of own side', () => {
    const a = play('N', ['1S', 'X']);              // S to call; partner N was doubled
    expect(() => applyCall(a, parseCall('XX'))).not.toThrow();
  });

  it('forbids a redouble with no standing double', () => {
    const a = play('N', ['1S']);
    expect(() => applyCall(a, parseCall('XX'))).toThrow();
  });

  it('lists legal calls including pass and valid higher bids', () => {
    const a = play('N', ['1C']);
    const labels = legalCalls(a).map((c) =>
      c.type === 'bid' ? `${c.level}${c.strain}` : c.type);
    expect(labels).toContain('pass');
    expect(labels).toContain('1D');
    expect(labels).not.toContain('1C');
  });
});
