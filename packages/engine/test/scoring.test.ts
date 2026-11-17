import { describe, it, expect } from 'vitest';
import { scoreContract } from '../src/scoring';
import type { Contract } from '../src/auction';

const mk = (
  level: number,
  strain: string,
  doubled: Contract['doubled'] = 'none',
): Contract => ({
  level: level as Contract['level'],
  strain: strain as Contract['strain'],
  declarer: 'S',
  doubled,
});

const score = (c: Contract, tricksWon: number, vulnerable: boolean) =>
  scoreContract({ contract: c, tricksWon, vulnerable }).declarerScore;

describe('scoring — made contracts', () => {
  it.each([
    ['4H non-vul, 10 tricks', mk(4, 'H'), 10, false, 420],
    ['4H vul, 10 tricks', mk(4, 'H'), 10, true, 620],
    ['3NT non-vul, 9 tricks', mk(3, 'NT'), 9, false, 400],
    ['1NT non-vul, 7 tricks (part-score)', mk(1, 'NT'), 7, false, 90],
    ['2C non-vul, 8 tricks (part-score)', mk(2, 'C'), 8, false, 90],
    ['5D vul, 11 tricks (game)', mk(5, 'D'), 11, true, 600],
    ['6NT non-vul, 12 tricks (small slam)', mk(6, 'NT'), 12, false, 990],
    ['7NT vul, 13 tricks (grand slam)', mk(7, 'NT'), 13, true, 2220],
    ['4H non-vul +1 overtrick', mk(4, 'H'), 11, false, 450],
    ['4Sx non-vul, 10 tricks (insult)', mk(4, 'S', 'doubled'), 10, false, 590],
    ['3NTx non-vul +1 overtrick', mk(3, 'NT', 'doubled'), 10, false, 650],
  ])('%s = %i', (_label, contract, tricks, vul, expected) => {
    expect(score(contract, tricks, vul)).toBe(expected);
  });
});

describe('scoring — defeated contracts', () => {
  it.each([
    ['1NT non-vul -1 undoubled', mk(1, 'NT'), 6, false, -50],
    ['4H vul -1 undoubled', mk(4, 'H'), 9, true, -100],
    ['4Hx non-vul -2', mk(4, 'H', 'doubled'), 8, false, -300],
    ['4Hx vul -3', mk(4, 'H', 'doubled'), 7, true, -800],
    ['4Hxx non-vul -1', mk(4, 'H', 'redoubled'), 9, false, -200],
  ])('%s = %i', (_label, contract, tricks, vul, expected) => {
    expect(score(contract, tricks, vul)).toBe(expected);
  });

  it('reports undertrick count', () => {
    const r = scoreContract({ contract: mk(4, 'H'), tricksWon: 7, vulnerable: false });
    expect(r.made).toBe(false);
    expect(r.undertricks).toBe(3);
  });
});
