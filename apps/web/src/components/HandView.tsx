import type { Hand, Seat, Suit } from '@sdibeuc/engine';
import { suitLengths, highCardPoints } from '@sdibeuc/engine';
import { SUIT_SYMBOL, suitColor } from '../ui';

const RANK_LABEL: Record<number, string> = {
  14: 'A', 13: 'K', 12: 'Q', 11: 'J', 10: '10',
  9: '9', 8: '8', 7: '7', 6: '6', 5: '5', 4: '4', 3: '3', 2: '2',
};

const DISPLAY_SUITS: Suit[] = ['S', 'H', 'D', 'C'];

export function HandView({
  seat, hand, active, hidden,
}: {
  seat: Seat;
  hand: Hand;
  active?: boolean;
  hidden?: boolean;
}) {
  const lengths = suitLengths(hand);
  return (
    <div className={`hand ${active ? 'hand--active' : ''}`}>
      <div className="hand__head">
        <span className="hand__seat">{seat}</span>
        {!hidden && <span className="hand__hcp">{highCardPoints(hand)} HCP</span>}
      </div>
      {hidden ? (
        <div className="hand__hidden">13 cards</div>
      ) : (
        <div className="hand__suits">
          {DISPLAY_SUITS.map((suit) => {
            const cards = hand
              .filter((c) => c.suit === suit)
              .sort((a, b) => b.rank - a.rank);
            return (
              <div className="hand__row" key={suit}>
                <span className="hand__suitsym" style={{ color: suitColor(suit) }}>
                  {SUIT_SYMBOL[suit]}
                </span>
                <span className="hand__ranks">
                  {lengths[suit] === 0
                    ? <span className="hand__void">—</span>
                    : cards.map((c) => RANK_LABEL[c.rank]).join(' ')}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
