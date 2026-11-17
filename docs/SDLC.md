# sdibeuc — SDLC plan

A free, open contract bridge app. Original work: bridge is a public-domain game,
and nothing here derives from any existing app's code, assets, or backend.

## Product

Deal bridge boards, run the auction with full rule enforcement, and score the
result — in the browser and in a thin native shell for iOS/Android. Free, no
paywall, no accounts required to play locally.

## Architecture

```
packages/engine   Pure TS rules engine (no UI/IO) — the defensible core.
apps/web          React + Vite SPA/PWA consuming the engine.
apps/mobile       Expo WebView shell loading the deployed web app.
(server)          Optional: Supabase for saved deals / multiplayer later.
```

Principle: all game rules live in `packages/engine`, framework-free and fully
tested, so the web and mobile clients are thin and the logic is reusable.

## Sprints

### Sprint 0 — Scaffold ✅
pnpm monorepo, TS strict, Vitest, CI, `.env.example`.

### Sprint 1 — Cards & deal ✅
Card/suit/rank/strain/seat model, 52-card deck, seedable Fisher-Yates shuffle,
deal to four seats, hand sorting, HCP + shape evaluation. Tested.

### Sprint 2 — Auction ✅
Call model (bid/pass/double/redouble), legality (higher-bid rule, double only
on opponents, redouble only over a standing double of own side), termination
(three passes after a bid, or passed out), contract + declarer derivation,
compact notation parse/format. Tested.

### Sprint 3 — Scoring ✅
Full duplicate contract-bridge scoring: trick points, part-score/game/slam
bonuses, overtricks, undertricks across undoubled/doubled/redoubled and
vulnerability, insult bonus. Verified against a table of known scores.

### Sprint 4 — Web app ⏳ (next)
- Deal view (four hands / single-hand practice).
- Bidding box driven by `legalCalls`.
- Auction ladder + contract display.
- Score entry → `scoreContract` result.
- Practice mode: random deal, bid, reveal par/score. PWA manifest.

### Sprint 5 — Mobile shell ⏳
- Expo app wrapping the deployed web app in a WebView (`EXPO_PUBLIC_WEB_URL`).
- Push via expo-notifications, deep links, EAS build config for iOS + Android.

### Backlog
- Double-dummy solver for par scoring and hints.
- Convention card / bidding-system practice drills.
- Optional accounts + saved boards (Supabase) and async multiplayer.

## Testing

Engine is unit-tested with Vitest; scoring is checked against a table of known
results. CI runs typecheck + tests on every push and PR.

## Definition of done (per sprint)

Typecheck clean, tests green in CI, README/plan updated, no secrets committed
(`.env` git-ignored; only `.env.example` is tracked).
