# Forex Prediction & Trading Game Platform — Implementation Plan

This document outlines the architecture, data models, thread execution pools, integration strategies, and frontend styling for the Forex Prediction & Trading Game Platform.

The platform is designed as a **Modular Monolith** in Java 21 and Spring Boot 3. It serves a compiled **React + Vite** frontend directly from its static resources, enabling the entire stack to be launched with a single execution of the backend, while providing full Docker support for PostgreSQL, Redis, Kafka, and ClickHouse in high-scale environments.

---

## Architecture Overview

To achieve senior-level credentials and ensure seamless local testing, the platform features a **Dual-Profile Architecture**:

1. **`local` (Default Profile)**:
   - **Database**: PostgreSQL (or SQLite/H2 fallback if local PG is not running)
   - **Cache**: In-memory `ConcurrentHashMap` with simulated TTLs (instead of Redis)
   - **Messaging**: Local Spring `ApplicationEventPublisher` (instead of Kafka)
   - **Analytics**: PostgreSQL analytics logs (instead of ClickHouse)
   - *This allows the entire system to boot up instantly with zero external dependencies.*

2. **`docker` (Enterprise Profile)**:
   - **Database**: PostgreSQL
   - **Cache**: Redis (using Redisson for distributed locking and Leaderboards)
   - **Messaging**: Apache Kafka (using real event streaming)
   - **Analytics**: ClickHouse (for high-volume historical prediction reporting)

```
                       [ User Browser (WebSocket & REST) ]
                                       │
                                       ▼
                     [ Spring Boot Backend (Single Port 8080) ]
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
       [ REST API Endpoints ]                       [ WebSockets Server ]
   (Auth, Wallet, Bets, Analytics)              (Live Prices, Bet Settlements)
                │                                             │
                ├─────────────────────────────────────────────┤
                ▼                                             ▼
   [ Price Processing Pool ]                         [ Settlement Workers ]
 (20 Thread Generator: Forex & Crypto)             (50 Worker Thread Engine)
                │                                             │
                └──────────────┬──────────────────────────────┘
                               ▼
                    [ Event Dispatcher Bus ]
                     (Spring Events / Kafka)
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
     [ PostgreSQL ]         [ Redis ]        [ ClickHouse ]
    (Users, Wallet,       (Leaderboard,       (Analytics,
      Bets, Logs)          Live Prices)         Reports)
```

---

## User Review Required

> [!IMPORTANT]
> **Key Architectural Decisions to Confirm:**
> 1. **Dual-Profile Mode**: We are building a single modular monolithic codebase with multiple profiles. This makes it trivial to run the frontend + backend in one command, but also lets us demonstrate full Redis, Kafka, and ClickHouse configurations via Docker Compose.
> 2. **Candlestick Generation**: The system will simulate true candlestick market patterns (OHLC: Open, High, Low, Close) in real-time and broadcast them over WebSockets.
> 3. **Copy Trading & AI Assistant**: These features will be fully functional on the frontend and simulated on the backend to demonstrate premium client-wowing capabilities.

---

## Proposed Changes

We will organize the code into frontend and backend packages under a single workspace.

```text
forex-prediction-platform/
├── frontend/                     # React + TypeScript UI
│   ├── src/
│   │   ├── components/           # CandlestickChart, BettingPanel, Wallet, Leaderboard, AI-Assistant
│   │   ├── App.tsx
│   │   └── index.css             # Vanilla CSS with high-aesthetic variables (dark/glassmorphism)
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                      # Spring Boot 3 + Java 21 Application
│   ├── src/main/java/com/forex/platform/
│   │   ├── config/               # Security, WebFlux, WebSocket, Redis, ClickHouse, Kafka
│   │   ├── domain/               # JPA Entities (User, Wallet, Bet, Transaction)
│   │   ├── event/                # Core Event Bus & Kafka Streams
│   │   ├── user/                 # Authentication, JWT, Registration, Profiles
│   │   ├── wallet/               # Wallet management, distributed locks, deposits/withdrawals
│   │   ├── market/               # 20-thread Price Processing Pool & WebSocket Price Feeds
│   │   ├── bet/                  # Prediction engine, bet placement & validation
│   │   ├── settlement/           # 50-thread Settlement Engine (expiring and resolving bets)
│   │   └── analytics/            # ClickHouse and Postgres reporting adapters
│   └── pom.xml                   # Maven Pom with automatic frontend build plugins
│
├── docker-compose.yml            # PostgreSQL, Redis, Kafka, ClickHouse infrastructure
└── README.md
```

### Component Details

---

### 1. The Frontend (React + TypeScript)
We will build a high-aesthetic, glassmorphic trading application.

* **Design System**: Rich purple-and-teal dark mode, neon accents (`#00f2fe`, `#4facfe`, `#10b981`, `#ef4444`), smooth transitions, glass cards (`backdrop-filter: blur(12px)`), responsive desktop layout.
* **WebSocket Integration**: Subscribes to backend WebSocket `/ws/prices` for live OHLC candlestick data and `/ws/notifications` for user-specific settlement alerts.
* **Candlestick Chart**: Custom high-fidelity React component drawing realistic candlestick graphs on an HTML5 canvas or SVG in real-time.
* **AI Signal Panel**: A smart card displaying real-time predictions generated by backend mock models (e.g. *"XAU/USD: 84% Bullish sentiment in next 5m"*).
* **Copy Trading Deck**: Displays leading traders. Users can toggle "Copy Trade" to mirror their predictions in real-time.

---

### 2. The Backend (Java 21 + Spring Boot 3)

#### Core Engines

1. **Price Processing Pool (`PriceProcessingPool`)**:
   - Manages a thread pool of size 20 (`Executors.newFixedThreadPool(20)`).
   - Generates realistic market ticks every second for assets: `EURUSD`, `GBPUSD`, `USDJPY`, `BTCUSD`, `ETHUSD`, `XAUUSD`.
   - Broadcasts the generated rates over a Spring WebFlux or standard WebSocket broker.
   - Saves historical rates to Redis / Memory.

2. **Settlement Engine (`SettlementEngine`)**:
   - A scheduled manager operating every 1 second.
   - Spawns tasks to a pool of 50 thread workers (`SettlementWorkers`).
   - Fetches bets that are expired but not yet resolved.
   - Sells or rewards bet amounts by evaluating exit prices against entry prices.
   - Modifies wallet balances under thread-safe locks (using Redis Redisson distributed locks or local `ReentrantLock` map).
   - Publishes `BetWonEvent` or `BetLostEvent` to notify the user.

3. **Analytics Engine (`AnalyticsService`)**:
   - Compiles metrics using ClickHouse queries (or clean JPA criteria queries for SQLite/Postgres).
   - Computes win rates, top traded assets, hourly volumes, and house revenue.

---

## Verification Plan

### Automated Verification
- **Unit & Integration Tests**: Test bet creation, price matching, and thread concurrency.
- **Service Verification**: Check compile status using Maven (`mvn clean test`).

### Manual Verification
- **WebSocket Price Flow**: Run the backend and observe the frontend chart automatically updating in real-time using live WebSocket data.
- **Bet Execution Flow**: Place a 30-second UP prediction on EUR/USD, wait for expiration, and verify that the balance adjusts and a glassmorphic win/loss banner triggers on the UI.
- **Leaderboard updates**: Place large winning bets and verify that the Redis-backed leaderboard dynamically shifts.
