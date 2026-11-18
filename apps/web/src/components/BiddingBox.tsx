import type { ReactNode } from 'react';
import type { AuctionState, Call, Level, Strain } from '@sdibeuc/engine';
import { isLegalCall, describeCall } from '@sdibeuc/engine';
import { STRAIN_SYMBOL, strainColor } from '../ui';

const LEVELS: Level[] = [1, 2, 3, 4, 5, 6, 7];
const STRAINS: Strain[] = ['C', 'D', 'H', 'S', 'NT'];

export function BiddingBox({
  auction, onCall,
}: {
  auction: AuctionState;
  onCall: (call: Call) => void;
}) {
  const btn = (call: Call, label: ReactNode, cls = '') => {
    const legal = isLegalCall(auction, call);
    return (
      <button
        key={describeCall(call)}
        className={`bidbtn ${cls}`}
        disabled={!legal}
        onClick={() => onCall(call)}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="bidbox">
      <div className="bidbox__calls">
        {btn({ type: 'pass' }, 'Pass', 'bidbtn--pass')}
        {btn({ type: 'double' }, 'X', 'bidbtn--dbl')}
        {btn({ type: 'redouble' }, 'XX', 'bidbtn--rdbl')}
      </div>
      <div className="bidbox__grid">
        {LEVELS.map((level) => (
          <div className="bidbox__levelrow" key={level}>
            {STRAINS.map((strain) =>
              btn(
                { type: 'bid', level, strain },
                <>
                  <span className="bidbtn__lvl">{level}</span>
                  <span style={{ color: strainColor(strain) }}>{STRAIN_SYMBOL[strain]}</span>
                </>,
                'bidbtn--bid',
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
