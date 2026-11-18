import { useMemo, useState } from 'react';
import {
  deal, createAuction, applyCall, getContract, isAuctionOver, sideOf,
  SEATS,
} from '@sdibeuc/engine';
import type { Deal, Seat, AuctionState, Call } from '@sdibeuc/engine';
import { HandView } from './components/HandView';
import { BiddingBox } from './components/BiddingBox';
import { AuctionTable } from './components/AuctionTable';
import { ScorePanel } from './components/ScorePanel';

type Vuln = 'none' | 'NS' | 'EW' | 'both';
const VULNS: Vuln[] = ['none', 'NS', 'EW', 'both'];

interface Board {
  seed: number;
  deal: Deal;
  dealer: Seat;
  vuln: Vuln;
}

function randomBoard(): Board {
  const seed = Math.floor(Math.random() * 2 ** 31);
  return {
    seed,
    deal: deal(seed),
    dealer: SEATS[Math.floor(Math.random() * 4)],
    vuln: VULNS[Math.floor(Math.random() * 4)],
  };
}

function declarerVulnerable(declarer: Seat, vuln: Vuln): boolean {
  if (vuln === 'both') return true;
  if (vuln === 'none') return false;
  return sideOf(declarer) === vuln;
}

export function App() {
  const [board, setBoard] = useState<Board>(randomBoard);
  const [auction, setAuction] = useState<AuctionState>(() => createAuction(board.dealer));
  const [showAll, setShowAll] = useState(true);

  const over = isAuctionOver(auction);
  const contract = useMemo(() => getContract(auction), [auction]);

  function newBoard() {
    const b = randomBoard();
    setBoard(b);
    setAuction(createAuction(b.dealer));
  }

  function onCall(call: Call) {
    setAuction((a) => applyCall(a, call));
  }

  function undo() {
    setAuction((a) => {
      const prev = createAuction(board.dealer);
      return a.calls.slice(0, -1).reduce((acc, c) => applyCall(acc, c.call), prev);
    });
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>sdibeuc <span className="app__sub">contract bridge · practice</span></h1>
        <div className="app__controls">
          <button onClick={newBoard} className="btn btn--primary">New deal</button>
          <button onClick={undo} className="btn" disabled={auction.calls.length === 0}>Undo</button>
          <label className="toggle">
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
            Show all hands
          </label>
        </div>
        <div className="app__meta">
          <span>Dealer <strong>{board.dealer}</strong></span>
          <span>Vul <strong>{board.vuln === 'none' ? '—' : board.vuln.toUpperCase()}</strong></span>
          <span className="app__seed">#{board.seed}</span>
        </div>
      </header>

      <main className="app__main">
        <section className="table">
          <div className="table__slot table__slot--n">
            <HandView seat="N" hand={board.deal.N} active={auction.turn === 'N' && !over} hidden={!showAll && board.dealer !== 'N'} />
          </div>
          <div className="table__slot table__slot--w">
            <HandView seat="W" hand={board.deal.W} active={auction.turn === 'W' && !over} hidden={!showAll && board.dealer !== 'W'} />
          </div>
          <div className="table__center">
            <AuctionTable auction={auction} />
          </div>
          <div className="table__slot table__slot--e">
            <HandView seat="E" hand={board.deal.E} active={auction.turn === 'E' && !over} hidden={!showAll && board.dealer !== 'E'} />
          </div>
          <div className="table__slot table__slot--s">
            <HandView seat="S" hand={board.deal.S} active={auction.turn === 'S' && !over} hidden={false} />
          </div>
        </section>

        <section className="panel">
          {!over ? (
            <>
              <h2>{auction.turn} to call</h2>
              <BiddingBox auction={auction} onCall={onCall} />
            </>
          ) : contract ? (
            <>
              <h2>Final contract</h2>
              <ScorePanel contract={contract} declarerVulnerable={declarerVulnerable(contract.declarer, board.vuln)} />
            </>
          ) : (
            <div className="passedout">
              <h2>Passed out</h2>
              <p>All four players passed. No contract — deal again.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="app__footer">
        Free &amp; open · <a href="https://github.com/panda-king-0705/sdibeuc">source</a>
      </footer>
    </div>
  );
}
