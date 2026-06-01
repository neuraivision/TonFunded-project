# TonFunded — Technical Specification

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.0 | UI framework |
| react-dom | ^18.3.0 | DOM renderer |
| react-router-dom | ^6.26.0 | Tab-based SPA routing |
| @twa-dev/sdk | ^7.0.0 | Telegram Mini App SDK |
| @tonconnect/ui-react | ^2.0.0 | TON wallet connection |
| tailwindcss | ^3.4.19 | Utility-first CSS |
| @radix-ui/react-tabs | ^1.1.0 | Accessible tab primitive (bottom nav) |
| @radix-ui/react-progress | ^1.1.0 | Progress bars (drawdown monitor) |
| @radix-ui/react-dialog | ^1.1.0 | Bottom sheets, modals |
| @radix-ui/react-select | ^2.1.0 | Dropdown selects |
| @radix-ui/react-toast | ^1.2.0 | Toast notifications |
| lucide-react | ^0.400.0 | Icon library (200+ icons) |
| recharts | ^2.12.0 | Equity curve mini chart |
| zustand | ^4.5.0 | Lightweight state management |

All Radix primitives used for accessible, unstyled headless components that handle keyboard navigation, focus trapping, ARIA attributes, and screen readers out of the box. Zustand chosen for state management over Context API because it avoids unnecessary re-renders on state changes and has a simpler API for non-React-natives.

## Component Inventory

### Layout (shared)

| Component | Source | Reuse |
|-----------|--------|-------|
| AppLayout | Custom | Once — root layout with Telegram viewport handling, safe area padding, scroll container |
| BottomNav | Custom | Once — fixed bottom tab bar with 4 route tabs, active indicator |
| HeaderBar | Custom | Once — sticky top header, shows back button contextually |

### Sections (page-level)

| Component | Source | Notes |
|-----------|--------|-------|
| HomePage | Custom | Hero section + Quick Actions + Performance Summary + Drawdown Monitor + Recent Activity |
| ChallengesPage | Custom | Challenge tier cards list with selection |
| TradingPage | Custom | Positions list with empty state + FAB |
| ProfilePage | Custom | Account status card + menu list |

### Reusable Components

| Component | Source | Used By |
|-----------|--------|---------|
| WalletCard | Custom | HomePage hero — connected/disconnected states |
| StatCard | Custom | HomePage status row, Profile stats grid |
| QuickActionButton | Custom | HomePage — circular icon + label |
| ChallengeCard | Custom | ChallengesPage — 4 tier variants |
| PositionCard | Custom | TradingPage — open position with P&L and action buttons |
| ProgressBar | Radix Progress + styled | DrawdownMonitor, Profile — contextual color fills |
| DrawdownMonitor | Custom | HomePage — daily/overall/profit target bars |
| RecentActivityItem | Custom | HomePage — activity list row |
| MenuItem | Custom | ProfilePage — icon + label + chevron row |
| PrimaryButton | Custom | Everywhere — gradient cyan pill button |
| SecondaryButton | Custom | Everywhere — gray pill button |
| Card | Custom | Everywhere — white bordered card wrapper |
| Badge | Custom | ChallengeCard, PositionCard — pill status badges |
| EmptyState | Custom | TradingPage, RecentActivity — icon + text placeholder |
| Toast | Radix Toast + styled | Global — success/error/info notifications |
| BottomSheet | Radix Dialog + styled | Profile payout modal — slide-up sheet |
| SkeletonLoader | Custom | Global — shimmer loading placeholder |

### Hooks

| Hook | Purpose |
|------|---------|
| useTelegram | Wraps @twa-dev-sdk — viewport, haptic feedback, theme params, ready/expand |
| useTonConnect | Wraps @tonconnect/ui-react — wallet state, connect/disconnect, address |
| useTradingData | Zustand store — positions, balance, P&L, drawdown, trading history |
| useChallengeData | Zustand store — active challenge, selected tier, progress, rules |

## Animation Implementation

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| Page route transitions | CSS | Fade-in (opacity 0→1, 200ms ease-out) on each page mount. No cross-fade needed since tabs switch instantly. | Low |
| Bottom sheet enter/exit | Radix Dialog + CSS | Dialog overlay fade (200ms). Content uses `translateY(100%)→0` with `cubic-bezier(0.16, 1, 0.3, 1)` over 300ms. Exit reverses at 200ms. Dismiss via swipe-down (touch drag detection). | Medium |
| Button press | CSS | `transform: scale(0.97)` on `:active`, 100ms transition. Hover opacity 0.9 for desktop. | Low |
| Card tap | CSS | Background color shift to `#fafafa` on `:active`, 100ms. | Low |
| Progress bar fill | CSS | `width` transition 0.3s ease on value change. No library needed. | Low |
| Skeleton shimmer | CSS | `background-position` animation on `linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)` over 1.5s infinite. | Low |
| Toast enter/exit | Radix Toast | Built-in enter/exit animations via Radix Toast viewport. Custom translateY + opacity. | Low |
| FAB shadow pulse | CSS | Subtle box-shadow transition on press, 150ms. | Low |
| Pull-to-refresh | Custom hook + CSS | Touch drag detection via `touchstart`/`touchmove`. Spinner rotation animation via CSS `transform: rotate()` on pull distance. | Medium |
| Header border on scroll | CSS + hook | Scroll event listener at 8px threshold toggles `border-bottom` class. | Low |
| Modal overlay fade | Radix Dialog | Built-in overlay animation. | Low |

No GSAP or Framer Motion needed. All animations are simple transitions achievable with CSS or built into Radix primitives. The only slightly complex animation is the bottom sheet swipe-to-dismiss, which requires a custom touch handler layered on top of Radix Dialog.

## State & Logic

### Data Flow

```
AppLayout (Telegram viewport + theme)
  ├── useTelegram hook (SDK init, haptic, safe areas)
  ├── useTonConnect hook (wallet state, address)
  ├── Zustand Store (trading + challenge state)
  │     ├── positions[]
  │     ├── balance, pnl, drawdown
  │     ├── activeChallenge, selectedTier
  │     └── tradingHistory[]
  └── Router
        ├── / → HomePage
        ├── /challenges → ChallengesPage
        ├── /trading → TradingPage
        └── /profile → ProfilePage
```

### State Management Plan

All application state lives in two Zustand stores (plain JS objects, no persistence library needed). No React Context used anywhere — Zustand's selector pattern avoids unnecessary re-renders.

**tradingStore** — manages all trading-related state:
- `positions: Position[]` — open positions with entry price, quantity, current price, P&L
- `balance: number`, `startingBalance: number`, `pnl: number`, `pnlPercent: number`
- `dailyDrawdown: DrawdownMetric`, `overallDrawdown: DrawdownMetric`
- `profitTarget: ProfitTargetMetric`
- `tradingHistory: ActivityItem[]`
- Actions: `openPosition()`, `closePosition()`, `partialClose()`, `setTakeProfit()`, `updatePrices()`

**challengeStore** — manages challenge lifecycle:
- `tiers: ChallengeTier[]` — static tier definitions (4 tiers)
- `activeChallenge: Challenge | null`
- `selectedTierId: string | null`
- `progress: ChallengeProgress`
- Actions: `selectTier()`, `purchaseChallenge()`, `updateProgress()`

### Mock Data Strategy

All data is hardcoded mock data initialized on store creation. No API calls. The wallet connection is the only real external integration — everything else operates on local state that simulates a real trading experience. For the MVP, prices can be randomly perturbed on an interval to simulate live market data.

### Telegram Mini App Integration Points

1. **Initialization**: Call `Telegram.WebApp.ready()` and `expand()` in a `useEffect` on app mount
2. **Theming**: Read `Telegram.WebApp.themeParams` and apply as CSS custom properties (fall back to design tokens if running outside Telegram)
3. **Haptics**: Trigger `impactOccurred('light')` on all primary button presses and successful actions; `notificationOccurred('error')` on errors
4. **Safe Areas**: Apply `env(safe-area-inset-*)` values from `Telegram.WebApp.safeAreaInset` as CSS padding
5. **Viewport**: Listen to `viewportChanged` events and recalculate layout if needed

### TON Connect Integration

Wrap the app in `<TonConnectUIProvider>` from `@tonconnect/ui-react`. The wallet card on the home page shows the connected address (truncated) when a wallet is connected, or a "Connect" button that opens the TON Connect modal. Use `useTonConnectUI()` hook to access connection state and trigger the modal.
