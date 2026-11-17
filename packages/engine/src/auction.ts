/**
 * The auction (bidding) engine.
 *
 * Encodes the standard legality and termination rules of a contract-bridge
 * auction and derives the final contract and declarer.
 */

import { Seat, Strain, strainRank, nextSeat, sideOf } from './cards';

export type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Call =
  | { type: 'bid'; level: Level; strain: Strain }
  | { type: 'pass' }
  | { type: 'double' }
  | { type: 'redouble' };

export interface AuctionState {
  readonly dealer: Seat;
  readonly calls: ReadonlyArray<{ seat: Seat; call: Call }>;
  readonly turn: Seat;
}

export interface Contract {
  readonly level: Level;
  readonly strain: Strain;
  readonly declarer: Seat;
  readonly doubled: 'none' | 'doubled' | 'redoubled';
}

export function createAuction(dealer: Seat): AuctionState {
  return { dealer, calls: [], turn: dealer };
}

/** Numeric value of a bid for ordering: higher means a higher contract. */
function bidValue(level: Level, strain: Strain): number {
  return level * 5 + strainRank(strain);
}

/** The last actual bid in the auction, with the seat that made it. */
function lastBid(state: AuctionState): { seat: Seat; level: Level; strain: Strain } | null {
  for (let i = state.calls.length - 1; i >= 0; i--) {
    const { seat, call } = state.calls[i];
    if (call.type === 'bid') return { seat, level: call.level, strain: call.strain };
  }
  return null;
}

/** Current double state of the standing bid, ignoring passes since it. */
function standingDoubleState(state: AuctionState): 'none' | 'doubled' | 'redoubled' {
  for (let i = state.calls.length - 1; i >= 0; i--) {
    const c = state.calls[i].call;
    if (c.type === 'bid') return 'none';
    if (c.type === 'double') return 'doubled';
    if (c.type === 'redouble') return 'redoubled';
  }
  return 'none';
}

export function isLegalCall(state: AuctionState, call: Call): boolean {
  if (isAuctionOver(state)) return false;

  switch (call.type) {
    case 'pass':
      return true;

    case 'bid': {
      const lb = lastBid(state);
      if (!lb) return true;
      return bidValue(call.level, call.strain) > bidValue(lb.level, lb.strain);
    }

    case 'double': {
      const lb = lastBid(state);
      if (!lb) return false; // nothing to double
      if (standingDoubleState(state) !== 'none') return false; // already X or XX
      // May only double an opponent's bid.
      return sideOf(lb.seat) !== sideOf(state.turn);
    }

    case 'redouble': {
      const lb = lastBid(state);
      if (!lb) return false;
      if (standingDoubleState(state) !== 'doubled') return false; // must be a standing double
      // The standing bid must be ours (opponents doubled us).
      return sideOf(lb.seat) === sideOf(state.turn);
    }
  }
}

export function legalCalls(state: AuctionState): Call[] {
  if (isAuctionOver(state)) return [];
  const calls: Call[] = [{ type: 'pass' }];
  if (isLegalCall(state, { type: 'double' })) calls.push({ type: 'double' });
  if (isLegalCall(state, { type: 'redouble' })) calls.push({ type: 'redouble' });
  const lb = lastBid(state);
  const levels: Level[] = [1, 2, 3, 4, 5, 6, 7];
  const strains: Strain[] = ['C', 'D', 'H', 'S', 'NT'];
  for (const level of levels) {
    for (const strain of strains) {
      if (!lb || bidValue(level, strain) > bidValue(lb.level, lb.strain)) {
        calls.push({ type: 'bid', level, strain });
      }
    }
  }
  return calls;
}

export function applyCall(state: AuctionState, call: Call): AuctionState {
  if (!isLegalCall(state, call)) {
    throw new Error(`Illegal call: ${describeCall(call)}`);
  }
  return {
    dealer: state.dealer,
    calls: [...state.calls, { seat: state.turn, call }],
    turn: nextSeat(state.turn),
  };
}

export function isAuctionOver(state: AuctionState): boolean {
  const n = state.calls.length;
  if (n < 4) return false;
  const last3 = state.calls.slice(-3);
  const allPass3 = last3.every((c) => c.call.type === 'pass');
  if (!allPass3) return false;
  // Either four passes total (passed out) or three passes after at least one bid.
  const anyBid = state.calls.some((c) => c.call.type === 'bid');
  if (anyBid) return true;
  return n === 4; // four passes, passed out
}

/**
 * The final contract, or null if the board was passed out. Only meaningful once
 * the auction is over.
 */
export function getContract(state: AuctionState): Contract | null {
  if (!isAuctionOver(state)) return null;
  const lb = lastBid(state);
  if (!lb) return null; // passed out

  const declaringSide = sideOf(lb.seat);
  // Declarer: first player of the declaring side to have named this strain.
  let declarer: Seat | null = null;
  for (const { seat, call } of state.calls) {
    if (call.type === 'bid' && call.strain === lb.strain && sideOf(seat) === declaringSide) {
      declarer = seat;
      break;
    }
  }
  if (declarer === null) declarer = lb.seat; // defensive; should never happen

  return {
    level: lb.level,
    strain: lb.strain,
    declarer,
    doubled: standingDoubleState(state),
  };
}

/** Compact notation for a call: "1S", "3NT", "P", "X", "XX". */
export function describeCall(call: Call): string {
  switch (call.type) {
    case 'pass': return 'P';
    case 'double': return 'X';
    case 'redouble': return 'XX';
    case 'bid': return `${call.level}${call.strain}`;
  }
}

/** Parse compact notation back into a Call. Throws on malformed input. */
export function parseCall(s: string): Call {
  const t = s.trim().toUpperCase();
  if (t === 'P' || t === 'PASS') return { type: 'pass' };
  if (t === 'X' || t === 'DBL') return { type: 'double' };
  if (t === 'XX' || t === 'RDBL') return { type: 'redouble' };
  const m = /^([1-7])(C|D|H|S|NT)$/.exec(t);
  if (!m) throw new Error(`Cannot parse call: ${s}`);
  return { type: 'bid', level: Number(m[1]) as Level, strain: m[2] as Strain };
}
