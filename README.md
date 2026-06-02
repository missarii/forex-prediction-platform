# BINGO Forex — DeFi Prediction Market Platform

<div align="center">
  <img src="https://img.shields.io/badge/BINGO%20Forex-DeFi%20Prediction%20Market-00f2fe?style=for-the-badge&labelColor=070913" />
  <br/><br/>

  <!-- Backend -->
  ![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
  ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?style=flat-square&logo=springboot&logoColor=white)
  ![Spring WebSocket](https://img.shields.io/badge/WebSocket-Spring-6DB33F?style=flat-square&logo=spring&logoColor=white)
  ![Hibernate](https://img.shields.io/badge/Hibernate-6.4-59666C?style=flat-square&logo=hibernate&logoColor=white)
  ![Maven](https://img.shields.io/badge/Maven-3.9-C71A36?style=flat-square&logo=apachemaven&logoColor=white)

  <!-- Frontend -->
  ![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white)
  ![CSS3](https://img.shields.io/badge/CSS3-Glassmorphic-1572B6?style=flat-square&logo=css3&logoColor=white)

  <!-- Databases -->
  ![H2](https://img.shields.io/badge/H2-In--Memory-004088?style=flat-square&logo=h2&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)
  ![ClickHouse](https://img.shields.io/badge/ClickHouse-24-FFCC01?style=flat-square&logo=clickhouse&logoColor=black)
  ![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)

  <!-- DevOps -->
  ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
  ![Kafka](https://img.shields.io/badge/Apache%20Kafka-3.6-231F20?style=flat-square&logo=apachekafka&logoColor=white)
  ![Git](https://img.shields.io/badge/Git-GitHub-F05032?style=flat-square&logo=git&logoColor=white)

  <br/>
  <strong>A high-performance Forex & Crypto prediction trading simulation platform — built as a senior-level Java + React portfolio showcase.</strong>
</div>

---

## 📌 Overview

**BINGO Forex** is a fully functional, production-grade **DeFi-style prediction market** where users forecast whether Forex and Crypto asset prices will go UP or DOWN within a chosen time window. Correct predictions earn a **1.85× payout**.

Architecturally, it is a **modular monolith** — a single Spring Boot executable JAR that:
- Serves the React SPA as embedded static assets
- Exposes REST APIs and a native WebSocket endpoint
- Runs a 20-thread price engine and 50-thread settlement engine concurrently
- Persists all data to H2 (local) or PostgreSQL (Docker)

> ⚠️ **Simulation Only** — No real money. All balances are virtual mock credits for demonstration purposes.

---

## 🧰 Full Technology Stack

### 🔵 Backend — Java / Spring Boot

| Technology | Version | Purpose |
|---|---|---|
| **Java** | 21 (OpenJDK) | Primary language — modern records, sealed classes, virtual thread capable |
| **Spring Boot** | 3.2.5 | Application framework — auto-config, embedded Tomcat, lifecycle management |
| **Spring MVC** | 6.x | RESTful API controllers (`/api/**`) |
| **Spring WebSocket** | 6.x | Native WebSocket server (`/ws/prices`) for real-time price streaming |
| **Spring Data JPA** | 3.2.x | Repository pattern — zero-boilerplate CRUD, derived query methods |
| **Hibernate ORM** | 6.4.x | JPA provider — schema DDL auto-generation, optimistic locking |
| **HikariCP** | 5.x | High-performance JDBC connection pooling |
| **Spring Validation** | 3.x | `@Valid` annotation-driven request body validation |
| **Spring Scheduling** | 3.x | `@Scheduled` task runner for price ticks and settlement scans |
| **Maven** | 3.9.x | Dependency management, build lifecycle, JAR packaging |

### 🟢 Concurrency Architecture

| Component | Thread Pool | Pattern |
|---|---|---|
| **PriceProcessingPool** | **20 threads** — `Executors.newFixedThreadPool(20)` | Brownian motion tick generation per symbol, submitted as tasks every 1s |
| **SettlementEngine** | **50 threads** — `Executors.newFixedThreadPool(50)` | Scans expired bets every 1s, dispatches each to worker pool |
| **WebSocket Sessions** | `CopyOnWriteArraySet` | Thread-safe session registry, safe concurrent add/remove/broadcast |
| **Live Price Cache** | `ConcurrentHashMap` | Wait-free reads from all 20 price threads |
| **Random Generation** | `ThreadLocalRandom` | Per-thread RNG — zero contention vs `Math.random()` |
| **Optimistic Locking** | `@Version` on Wallet + 3-retry | Prevents lost-update on concurrent balance modifications |

### 🟡 Frontend — React / TypeScript

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | Component-based UI framework, concurrent rendering |
| **TypeScript** | 5.x | Strict type safety — all components and interfaces typed |
| **Vite** | 8.x | Build tool — HMR in dev, optimized ESM bundle for production |
| **HTML5 Canvas API** | — | High-fidelity OHLC candlestick chart rendering with DPI scaling |
| **Vanilla CSS** | — | Custom dark glassmorphic design system — no Tailwind, full control |
| **CSS Custom Properties** | — | Design tokens: colors, shadows, neon glows, transitions |
| **Google Fonts** | — | `Outfit` (UI typography) + `JetBrains Mono` (financial data) |
| **Lucide React** | Latest | Consistent SVG icon set |
| **Native WebSocket API** | — | Browser WebSocket client connecting to Spring Boot `/ws/prices` |
| **Fetch API** | — | REST calls to backend — login, wallet, bet placement |
| **React useState** | — | Local UI state — prices, predictions, wallet, notifications |
| **React useEffect** | — | WebSocket lifecycle, countdown timers, API sync on mount |
| **React useRef** | — | Candlestick history buffer — avoids re-render thrashing |

### 🗄️ Databases

| Technology | Version | Profile | Purpose |
|---|---|---|---|
| **H2 Database** | 2.x | `local` (default) | In-memory SQL DB — zero dependencies for local development |
| **PostgreSQL** | 16 | `docker` | Production-grade relational DB — full ACID, indexing |
| **ClickHouse** | 24 | `docker` | Column-oriented OLAP engine for high-throughput analytics queries — platform volume, win-rate, symbol distribution metrics |
| **H2 Web Console** | — | `local` | Dev tool at `/h2-console` — live SQL browser for inspecting entities |

### 📨 Messaging & Streaming

| Technology | Version | Purpose |
|---|---|---|
| **Apache Kafka** | 3.6 | Distributed event streaming — future settlement event bus (ACTIVE → WON/LOST events) |
| **Kafka Broker** | Bitnami image | Single-node broker for local Docker environment |
| **Kafka Topics** | — | `bet.placed`, `bet.settled` (designed, ready for consumer integration) |

### 🔴 Caching & Session

| Technology | Version | Purpose |
|---|---|---|
| **Redis** | 7 | In-memory key-value store — future: session cache, leaderboard ranking, pub-sub for real-time events |
| **Redis Alpine** | 7-alpine | Lightweight Docker image for local infrastructure |

### 🐳 DevOps & Infrastructure

| Technology | Version | Purpose |
|---|---|---|
| **Docker** | 24+ | Container runtime for all infrastructure services |
| **Docker Compose** | v2.39 | Orchestrates PostgreSQL + Redis + Kafka + ClickHouse locally |
| **PostgreSQL image** | `postgres:16-alpine` | Production database container |
| **Redis image** | `redis:7-alpine` | Cache/pub-sub container |
| **Kafka image** | `bitnami/kafka:3.6` | Message broker container |
| **ClickHouse image** | `clickhouse/clickhouse-server:24` | OLAP analytics container |
| **Git** | 2.x | Version control |
| **GitHub** | — | Source hosting, portfolio showcase |
| **Maven `resources` plugin** | 3.3.x | Copies `frontend/dist/` → `target/classes/static/` at build time |
| **Spring Boot Maven plugin** | 3.2.x | Repackages JAR into self-contained fat JAR (Boot-INF layout) |

### 🏗️ Deployment Model

| Mode | How | Result |
|---|---|---|
| **Local (default)** | `java -jar *.jar` | Single JAR — embedded Tomcat + H2 + React SPA. Zero external dependencies |
| **Docker (production)** | `docker-compose up -d` + `--spring.profiles.active=docker` | Full infrastructure: PostgreSQL, Redis, Kafka, ClickHouse |

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔴 **Live Price Feed** | WebSocket ticks every 1s for 6 assets via 20-thread engine |
| 📈 **Candlestick Chart** | HTML5 Canvas OHLC with 30-candle history, DPI-aware |
| 🎯 **Prediction Engine** | UP/DOWN predictions with 30s → 5min durations, 1.85× payout |
| 💰 **Wallet System** | Deposit, withdraw, full transaction ledger — DB-persisted |
| ⚡ **Auto Settlement** | 50-thread engine resolves expired predictions within 1 second |
| 🤖 **AI Co-Pilot** | Simulated sentiment gauge + technical signal cards |
| 👥 **Copy Trading** | Mirror top trader predictions automatically |
| 🏆 **Leaderboard** | Live-ranked hall of fame by profit |
| 📊 **ClickHouse Analytics** | Volume, win-rate, and symbol distribution metrics panel |
| 🔐 **Optimistic Locking** | `@Version` on Wallet — safe concurrent balance updates |

---

## 🗂️ Project Structure

```
forex-prediction-platform/
├── frontend/                              # React + TypeScript + Vite SPA
│   ├── src/
│   │   ├── App.tsx                        # Main dashboard & state machine
│   │   ├── index.css                      # Glassmorphic dark design system
│   │   └── components/
│   │       ├── CandlestickChart.tsx       # Canvas OHLC chart
│   │       ├── BettingPanel.tsx           # Prediction placement UI
│   │       ├── WalletCard.tsx             # Balance + ledger
│   │       ├── Leaderboard.tsx            # Trophy rankings
│   │       ├── CopyTrading.tsx            # Mirror expert predictions
│   │       ├── AiAssistant.tsx            # AI signals panel
│   │       └── ClickHouseAnalytics.tsx    # OLAP metrics dashboard
│   ├── index.html                         # Entry point — BINGO Forex title
│   ├── vite.config.ts
│   └── package.json
│
├── src/main/java/com/forex/platform/
│   ├── ForexPlatformApplication.java      # @SpringBootApplication + @EnableScheduling
│   ├── config/WebSocketConfig.java        # /ws/prices route registration
│   ├── domain/                            # JPA Entities
│   │   ├── User.java
│   │   ├── Wallet.java                    # @Version optimistic locking
│   │   ├── Bet.java                       # Status: ACTIVE → WON/LOST
│   │   └── Transaction.java              # Immutable audit ledger
│   ├── user/                              # Auth: UserController, UserService, UserRepository
│   ├── wallet/                            # WalletController, WalletService, Repositories
│   ├── bet/                               # BetController, BetService, BetRepository
│   ├── market/
│   │   ├── PriceProcessingPool.java       # 20-thread Brownian price engine
│   │   └── PriceWebSocketHandler.java     # CopyOnWriteArraySet session manager
│   └── settlement/
│       └── SettlementEngine.java          # 50-thread bet resolver
│
├── src/main/resources/
│   ├── application.properties             # Local: H2 in-memory
│   └── application-docker.properties      # Docker: PostgreSQL
│
├── docker-compose.yml                     # PostgreSQL + Redis + Kafka + ClickHouse
├── pom.xml                                # Maven build + Spring Boot 3.2.5
├── .gitignore
├── README.md
├── UserManual.md
└── TechStack.md
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Minimum Version |
|---|---|
| Java (OpenJDK) | 21 |
| Maven | 3.9 |
| Node.js | 18 |
| npm | 9 |
| Docker + Compose | 24 (optional, for full infra) |

### Local Run (zero dependencies)

```bash
# 1. Build the frontend
cd frontend && npm install && npm run build && cd ..

# 2. Package the monolith
mvn clean package -DskipTests

# 3. Run
java -jar target/forex-prediction-platform-0.0.1-SNAPSHOT.jar
```

Open **http://localhost:8080/** — login, trade, explore.

### Docker / Full Production Stack

```bash
# Start PostgreSQL, Redis, Kafka, ClickHouse
docker-compose up -d

# Run with docker profile
java -jar target/forex-prediction-platform-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=docker
```

---

## 🔌 REST API

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | `{"username":"..."}` | Login / auto-register user |
| `GET` | `/api/wallet/{userId}` | — | Get wallet balance |
| `POST` | `/api/wallet/{userId}/deposit` | `{"amount":1000}` | Add mock credits |
| `POST` | `/api/wallet/{userId}/withdraw` | `{"amount":500}` | Remove mock credits |
| `GET` | `/api/wallet/{userId}/transactions` | — | Full transaction ledger |
| `POST` | `/api/bets/place` | `{"userId":1,"symbol":"BTC/USD","direction":"UP","amount":100,"durationSeconds":30}` | Place prediction |
| `GET` | `/api/bets/user/{userId}` | — | All user predictions |
| `WS` | `ws://localhost:8080/ws/prices` | — | Live price stream (JSON ticks) |
| `GET` | `/h2-console` | — | SQL browser (local profile only) |

---

## 🧵 Concurrency Deep-Dive

```
PriceProcessingPool ─── 20 threads ──▶ 6 symbols × 1s Brownian tick → WS broadcast
SettlementEngine    ─── 50 threads ──▶ Expired bet scan → @Transactional resolution
WalletService       ─── 3-retry loop ─▶ OptimisticLockingException back-off (100ms)
WebSocket Registry  ─── CopyOnWriteArraySet ──▶ Thread-safe session broadcast
Price Cache         ─── ConcurrentHashMap  ──▶ Wait-free reads from 20 threads
```

---

## 📊 Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    BINGO Forex Monolith JAR                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React SPA  (served from /static via Spring MVC)        │   │
│  └─────────────────────────┬────────────────────────────────┘   │
│                            │ HTTP + WS                          │
│  ┌─────────────────────────▼────────────────────────────────┐   │
│  │  Spring Boot 3 (Tomcat :8080)                           │   │
│  │  ├── REST  /api/**              (UserController etc.)   │   │
│  │  ├── WS    /ws/prices           (PriceWebSocketHandler) │   │
│  │  ├── PriceProcessingPool        (20 threads)            │   │
│  │  ├── SettlementEngine           (50 threads)            │   │
│  │  └── Spring Data JPA + Hibernate                        │   │
│  └────────────────┬──────────────────────────────┬──────────┘   │
│                   │                              │               │
│         ┌─────────▼──────┐            ┌──────────▼────────┐     │
│         │ H2 (local)     │            │ PostgreSQL (docker)│     │
│         └────────────────┘            └───────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
         │               │                │              │
   ┌─────▼────┐   ┌──────▼─────┐  ┌──────▼────┐  ┌─────▼──────┐
   │  Redis 7 │   │  Kafka 3.6 │  │ClickHouse │  │ PostgreSQL │
   │ (cache)  │   │ (events)   │  │  (OLAP)   │  │    16      │
   └──────────┘   └────────────┘  └───────────┘  └────────────┘
                   docker-compose.yml services
```

---

## 📄 License

MIT — free to use, fork, and showcase in your portfolio.

---

<div align="center">
  Built with ❤️ using <strong>Java 21 · Spring Boot 3 · React 19 · TypeScript · WebSockets · PostgreSQL · Redis · Kafka · ClickHouse · Docker</strong>
</div>
