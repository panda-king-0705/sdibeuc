import type { AuctionState, Seat } from '@sdibeuc/engine';
import { SEATS, describeCall } from '@sdibeuc/engine';
import { STRAIN_SYMBOL, strainColor } from '../ui';
import type { Call } from '@sdibeuc/engine';

function CallCell({ call }: { call: Call }) {
  if (call.type === 'bid') {
    return (
      <span className="auc__bid">
        {call.level}
        <span style={{ color: strainColor(call.strain) }}>{STRAIN_SYMBOL[call.strain]}</span>
      </span>
    );
  }
  const label = describeCall(call);
  return <span className={`auc__call auc__call--${call.type}`}>{label}</span>;
}

export function AuctionTable({ auction }: { auction: AuctionState }) {
  // Build rows of four, starting under the dealer's column.
  const dealerIndex = SEATS.indexOf(auction.dealer);
  const cells: (Call | null)[] = Array(dealerIndex).fill(null);
  for (const c of auction.calls) cells.push(c.call);
  while (cells.length % 4 !== 0) cells.push(null);

  const rows: (Call | null)[][] = [];
  for (let i = 0; i < cells.length; i += 4) rows.push(cells.slice(i, i + 4));

  return (
    <table className="auc">
      <thead>
        <tr>
          {SEATS.map((s: Seat) => (
            <th key={s} className={s === auction.turn ? 'auc__turn' : ''}>{s}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={4} className="auc__empty">No calls yet</td></tr>
        ) : (
          rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((call, ci) => (
                <td key={ci}>{call ? <CallCell call={call} /> : ''}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
