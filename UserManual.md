# BINGO Forex — User Manual

> **BINGO Forex** is a DeFi-style Forex and Crypto prediction simulation platform. Predict whether an asset price will go UP or DOWN, earn virtual payouts, and compete on the leaderboard. No real money is ever used.

---

## Table of Contents

1. [Getting Started — Login](#1-getting-started--login)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Reading the Live Ticker Bar](#3-reading-the-live-ticker-bar)
4. [Reading the Candlestick Chart](#4-reading-the-candlestick-chart)
5. [Placing a Prediction](#5-placing-a-prediction)
6. [Monitoring Active Positions](#6-monitoring-active-positions)
7. [Settlement — Win & Loss Resolution](#7-settlement--win--loss-resolution)
8. [Wallet Management](#8-wallet-management)
9. [Copy Trading](#9-copy-trading)
10. [AI Trading Co-Pilot](#10-ai-trading-co-pilot)
11. [Leaderboard](#11-leaderboard)
12. [ClickHouse Analytics](#12-clickhouse-analytics)
13. [Logging Out](#13-logging-out)

---

## 1. Getting Started — Login

When you first open **http://localhost:8080/**, you will see the **BINGO Forex** login screen — a glowing modal overlay on a dark background.

### Steps:
1. Click the **"Trader Identity"** input field — it auto-focuses on page load.
2. Type a username of **at least 3 characters** (e.g. `AlphaTrader99`).
3. The **Launch Platform** button will activate once 3+ characters are entered.
4. Click **Launch Platform**.

> **What happens behind the scenes:** Your username is registered in the backend database (H2 in-memory). A wallet with **$5,000 mock credits** is automatically created for you. If you log in again with the same username, your existing wallet balance is restored.

---

## 2. Dashboard Overview

After login, the full trading dashboard loads with these main zones:

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: BINGO Forex logo · Active username · Logout        │
├─────────────────────────────────────────────────────────────┤
│  TICKER BAR: EUR/USD · GBP/USD · BTC/USD · ETH/USD · ...   │
├───────────────────────────────┬─────────────────────────────┤
│                               │  Betting Panel              │
│   Candlestick Chart           │  Wallet Card                │
│   (OHLC Canvas)               │  AI Co-Pilot                │
│                               │  Copy Trading               │
│   Active Positions            │  ClickHouse Analytics       │
│   Settlement History          │  Leaderboard                │
└───────────────────────────────┴─────────────────────────────┘
```

---

## 3. Reading the Live Ticker Bar

The horizontal ticker bar directly below the header displays **6 live assets**:

| Symbol | Type |
|--------|------|
| EUR/USD | Forex |
| GBP/USD | Forex |
| USD/JPY | Forex |
| BTC/USD | Crypto |
| ETH/USD | Crypto |
| XAU/USD | Commodity (Gold) |

- Prices **update every second** via WebSocket from the backend 20-thread Price Processing Pool.
- A **green flash** means the price ticked up; a **red flash** means it ticked down.
- **Click any symbol** to switch the main candlestick chart to that asset.
- The **currently selected** symbol glows with a cyan border.

---

## 4. Reading the Candlestick Chart

The chart is rendered on an **HTML5 Canvas** and displays OHLC (Open, High, Low, Close) candlesticks.

- **Green candles** = price closed higher than it opened (bullish).
- **Red candles** = price closed lower than it opened (bearish).
- The chart builds history in real-time as new price ticks arrive.
- A **current price label** floats on the right side of the chart in cyan.
- Up to **30 candles** are shown at a time; older candles scroll off the left.

---

## 5. Placing a Prediction

The **Betting Panel** on the right sidebar is your main trading interface.

### Steps:
1. **Select a Duration** — Choose how long your prediction will run:
   - `30s` — 30 seconds
   - `1m` — 1 minute
   - `3m` — 3 minutes
   - `5m` — 5 minutes
2. **Set Stake Amount** — Use the preset buttons ($50, $100, $250, $500) or type a custom amount. Your current balance is shown — you cannot stake more than your balance.
3. **Choose Direction:**
   - Click the **green UP ↑ button** if you predict the price will be *higher* when the timer expires.
   - Click the **red DOWN ↓ button** if you predict the price will be *lower*.

### What happens after placing:
- Your stake is immediately **deducted** from your wallet balance.
- A **toast notification** appears confirming the prediction was placed.
- The prediction appears in the **"Ongoing Positions"** panel with a live countdown timer.
- If **Copy Trading** is active, mirrored predictions are placed automatically for copied traders.

> **Payout:** Correct predictions pay **1.85× your stake**. A $100 stake returns $185.

---

## 6. Monitoring Active Positions

The **"Ongoing Positions"** panel (left side, below the chart) lists all your active predictions in real-time.

Each position card shows:
- **Direction badge** — UP (green) or DOWN (red)
- **Asset symbol** — e.g. `BTC/USD`
- **Entry price** — the price at the moment you placed the prediction
- **Stake amount** — how much you wagered
- **Progress bar** — fills left-to-right as time elapses
- **Countdown timer** — seconds remaining (e.g. `28s`)

When the countdown reaches **0**, the prediction is automatically sent to the Settlement Engine.

---

## 7. Settlement — Win & Loss Resolution

The backend **Settlement Engine** (50 concurrent worker threads) scans for expired predictions every second. When your prediction expires:

1. The **exit price** (current live market price) is captured.
2. Your prediction direction is compared to the price movement:
   - **UP prediction** → WIN if exit price > entry price
   - **DOWN prediction** → WIN if exit price < entry price
3. Results are written to the database and your wallet is updated.
4. A **toast notification** pops up in the bottom-right:
   - 🎉 **Green** for WIN — shows payout amount
   - 📉 **Red** for LOSS — shows amount lost
5. The settled trade appears in the **Settlement History** panel with full entry/exit price details.

---

## 8. Wallet Management

The **Wallet Card** on the right sidebar shows your current balance and transaction history.

### Adding Funds:
1. Click **"Add Funds"**.
2. Enter an amount (e.g. `2500`).
3. Click **"Confirm"** — balance updates instantly, synced with the backend database.

### Withdrawing:
1. Click **"Withdraw"**.
2. Enter an amount up to your current balance.
3. Click **"Confirm"**.

### Transaction History:
Below the balance display is a scrollable **transaction ledger** showing all:
- `DEPOSIT` — funds added
- `WITHDRAW` — funds removed
- `BET_STAKE` — prediction stake deducted
- `BET_PAYOUT` — winning prediction payout credited

---

## 9. Copy Trading

The **Copy Trading** panel (right sidebar) shows a list of top expert traders. When you copy a trader, your predictions are automatically **mirrored** whenever you place a trade.

### How to Copy:
1. Find a trader in the list (e.g. **AlphaWolf** — 64.2% win rate).
2. Click the **"Copy"** button next to their name. It turns active (glowing).
3. Now whenever you place a prediction, a duplicate prediction is placed on your behalf to mirror theirs.
4. A notification confirms: *"Now auto-mirroring predictions from AlphaWolf!"*

### How to Stop Copying:
- Click the same button again — it de-activates and mirroring stops.

> **Shown stats per trader:** Profit ($), Win Rate (%), number of copiers, and hot streak indicator 🔥.

---

## 10. AI Trading Co-Pilot

The **AI Trading Co-Pilot** panel provides simulated market intelligence:

- **Sentiment Gauge** — Visual dial showing overall market sentiment (Bullish / Neutral / Bearish)
- **Signal Cards** — Per-asset signals with confidence percentages and reasoning (e.g. *"BTC bullish — RSI oversold at 28, MACD crossover detected"*)
- **Refresh Button** — Generates new AI signals on demand

> This is a simulated showcase feature demonstrating how AI signals would be displayed in a production trading platform.

---

## 11. Leaderboard

The **Hall of Fame Leaderboard** ranks all traders by total profit.

| Column | Description |
|--------|-------------|
| Rank | Trophy icon for top 3 (🥇🥈🥉), number for others |
| Username | Trader identifier |
| Total Profit | Cumulative winnings in $ |
| Win Rate | Percentage of predictions won |
| # Predictions | Total trades placed |

The leaderboard is updated live as settlements are processed.

---

## 12. ClickHouse Analytics

The **Deep Analytics** panel shows platform-wide statistics (simulated ClickHouse-style OLAP metrics):

| Metric | Description |
|--------|-------------|
| Total Predictions | All predictions placed across all users |
| Total Volume | Sum of all stakes in $ |
| Average Win Rate | Platform-wide win percentage |
| Active Users (24h) | Unique active users in last 24 hours |
| Most Traded Symbol | Highest-volume asset |
| Volume by Symbol | Bar chart breakdown per asset |

---

## 13. Logging Out

Click the **logout icon** (arrow-out-of-box icon) in the top-right header next to your username.

- Your session is cleared from the UI.
- Your wallet balance and trade history remain safely stored in the database.
- You will be returned to the **BINGO Forex** login screen.
- Log back in with the same username to resume where you left off.

---

*© BINGO Forex — DeFi Prediction Market Simulation. For portfolio demonstration purposes only.*
