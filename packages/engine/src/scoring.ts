/**
 * Duplicate contract-bridge scoring.
 *
 * Implements the standard scoring table: trick points, part-score/game/slam
 * bonuses, overtricks, undertricks (undoubled/doubled/redoubled × vulnerability)
 * and the doubled-contract insult bonus. These are the published laws of the
 * game, implemented from scratch.
 */

import { Contract } from './auction';
import { Strain } from './cards';

export interface ScoreInput {
  readonly contract: Contract;
  /** Total tricks won by the declaring side, 0..13. */
  readonly tricksWon: number;
  /** Whether the declaring side is vulnerable. */
  readonly vulnerable: boolean;
}

export interface ScoreResult {
  /** Net score from the declaring side's perspective (negative if defeated). */
  readonly declarerScore: number;
  readonly made: boolean;
  /** Overtricks (>=0) if made, or undertricks (as a positive count) if defeated. */
  readonly overtricks: number;
  readonly undertricks: number;
  readonly breakdown: Readonly<Record<string, number>>;
}

/** Points for each contracted (bid) trick, before doubling. */
function perTrickValue(strain: Strain): number {
  if (strain === 'C' || strain === 'D') return 20;
  return 30; // majors and the per-trick NT value
}

/** Base contract trick points (used to decide game) including the NT first-trick bump. */
function contractTrickPoints(contract: Contract): number {
  const { level, strain } = contract;
  let base: number;
  if (strain === 'NT') base = 40 + 30 * (level - 1);
  else base = perTrickValue(strain) * level;
  if (contract.doubled === 'doubled') base *= 2;
  else if (contract.doubled === 'redoubled') base *= 4;
  return base;
}

function undertrickPenalty(
  under: number,
  doubled: Contract['doubled'],
  vulnerable: boolean,
): number {
  if (doubled === 'none') {
    return under * (vulnerable ? 100 : 50);
  }
  let total = 0;
  for (let i = 1; i <= under; i++) {
    let v: number;
    if (vulnerable) {
      v = i === 1 ? 200 : 300;
    } else {
      if (i === 1) v = 100;
      else if (i <= 3) v = 200;
      else v = 300;
    }
    total += v;
  }
  if (doubled === 'redoubled') total *= 2;
  return total;
}

function overtrickValue(contract: Contract, vulnerable: boolean): number {
  if (contract.doubled === 'doubled') return vulnerable ? 200 : 100;
  if (contract.doubled === 'redoubled') return vulnerable ? 400 : 200;
  return perTrickValue(contract.strain);
}

export function scoreContract(input: ScoreInput): ScoreResult {
  const { contract, tricksWon, vulnerable } = input;
  const needed = contract.level + 6;
  const result = tricksWon - needed;

  if (result < 0) {
    const under = -result;
    const penalty = undertrickPenalty(under, contract.doubled, vulnerable);
    return {
      declarerScore: -penalty,
      made: false,
      overtricks: 0,
      undertricks: under,
      breakdown: { undertricks: -penalty },
    };
  }

  const trickPoints = contractTrickPoints(contract);
  const overtricks = result;
  const overtrickPoints = overtricks * overtrickValue(contract, vulnerable);

  const isGame = trickPoints >= 100;
  const gameOrPartscore = isGame ? (vulnerable ? 500 : 300) : 50;

  let slamBonus = 0;
  if (contract.level === 6) slamBonus = vulnerable ? 750 : 500;
  else if (contract.level === 7) slamBonus = vulnerable ? 1500 : 1000;

  let insult = 0;
  if (contract.doubled === 'doubled') insult = 50;
  else if (contract.doubled === 'redoubled') insult = 100;

  const total = trickPoints + overtrickPoints + gameOrPartscore + slamBonus + insult;

  return {
    declarerScore: total,
    made: true,
    overtricks,
    undertricks: 0,
    breakdown: {
      trickPoints,
      overtrickPoints,
      gameOrPartscore,
      slamBonus,
      insult,
    },
  };
}
