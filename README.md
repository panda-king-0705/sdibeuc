# sdibeuc

A free, open **contract bridge** app — built from scratch. Bridge is a
public-domain game; this is an original implementation of its rules, with no
code, assets, or content taken from any existing app.

## Status

Built as a sprint plan (see `docs/SDLC.md`):

| Sprint | Scope | State |
| ------ | ----- | ----- |
| 0 | Monorepo scaffold & tooling | ✅ |
| 1 | Core engine: cards, deal, hand evaluation | ✅ |
| 2 | Auction engine: bidding & legality | ✅ |
| 3 | Scoring engine: contract-bridge scoring | ✅ |
| 4 | Web app (React + Vite) | ✅ |
| 5 | Mobile shell (Expo, iOS + Android) | ⏳ next |

## Layout

```
packages/engine   Pure-TypeScript game engine (no UI, no I/O). Fully unit-tested.
apps/web          React + Vite client (sprint 4)
apps/mobile       Expo WebView shell for iOS/Android (sprint 5)
docs/SDLC.md      The full plan
```

## The engine

`@sdibeuc/engine` is framework-free and deterministic — the piece worth reusing.

```ts
import { deal, createAuction, applyCall, parseCall, getContract, scoreContract }
  from '@sdibeuc/engine';

const board = deal(12345);              // reproducible from a seed
let auction = createAuction('N');
for (const c of ['1H', 'P', '4H', 'P', 'P', 'P'])
  auction = applyCall(auction, parseCall(c));

const contract = getContract(auction);  // { level:4, strain:'H', declarer:'N', doubled:'none' }
const result = scoreContract({ contract, tricksWon: 10, vulnerable: false });
// result.declarerScore === 420
```

What it covers:

- **Deal** — seedable Fisher-Yates shuffle, 13 cards per seat, validity checks.
- **Evaluate** — Milton Work high-card points, suit lengths, shape, balanced test.
- **Auction** — full call legality (bids/pass/double/redouble), termination,
  contract and declarer determination.
- **Scoring** — trick points, part-score/game/slam bonuses, overtricks,
  undertricks (undoubled/doubled/redoubled × vulnerability), insult bonus.

## Develop

```bash
pnpm install
pnpm -r test        # run all package tests
pnpm -r typecheck
```

### Run the web app

The web client (`apps/web`) is React + Vite and reads the engine's TypeScript
source directly via a Vite alias — no build step for the engine.

```bash
cd apps/web
npm install         # or pnpm install from the repo root
npm run dev         # http://localhost:5173
```

Deal a board, run the auction with the bidding box (illegal calls are disabled
by the engine), and the score panel computes the result as you slide the trick
count. "Show all hands" toggles review vs. single-hand practice.

## License

MIT — free for everyone to use and build on.
