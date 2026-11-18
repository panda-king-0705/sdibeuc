import type { Strain, Suit } from '@sdibeuc/engine';

export const SUIT_SYMBOL: Record<Suit, string> = { S: '♠', H: '♥', D: '♦', C: '♣' };

export const STRAIN_SYMBOL: Record<Strain, string> = {
  S: '♠', H: '♥', D: '♦', C: '♣', NT: 'NT',
};

/** Red for hearts/diamonds, dark for spades/clubs — the usual four-colour-ish split. */
export function strainColor(s: Strain): string {
  return s === 'H' || s === 'D' ? 'var(--red)' : 'var(--ink)';
}

export function suitColor(s: Suit): string {
  return s === 'H' || s === 'D' ? 'var(--red)' : 'var(--ink)';
}
