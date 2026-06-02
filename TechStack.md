# BINGO Forex — Technology Stack

> A full-stack, monolithic architecture designed for high-concurrency backend processing and a premium real-time trading UI. Built as a senior-level portfolio showcase.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     BINGO Forex Monolith                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              React SPA (served as static files)            │  │
│  │   TypeScript · Vite · Canvas Charts · WebSocket Client     │  │
│  └────────────────────────┬───────────────────────────────────┘  │
│                           │  HTTP / WebSocket                    │
│  ┌────────────────────────▼───────────────────────────────────┐  │
│  │              Spring Boot 3 (Tomcat embedded)               │  │
│  │                                                            │  │
│  │  REST Controllers   WebSocket Handler   Scheduled Tasks    │  │
│  │       │                    │                   │           │  │
│  │  UserService          PriceProcessingPool  SettlementEngine│  │
│  │  WalletService        (20 threads)         (50 threads)    │  │
│  │  BetService                                                │  │
│  │       │                                                    │  │
│  │  Spring Data JPA ──────────────────────────────────────▶  │  │
│  │  (Hibernate 6)              H2 (local) / PostgreSQL        │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Frontend Stack

### Core Framework

| Technology | Version | Role |
|------------|---------|------|
| **React** | 19.x | Component-based UI framework |
| **TypeScript** | 5.x | Strict type safety across all components |
| **Vite** | 8.x | Ultra-fast build tool & dev server (HMR) |

### UI & Styling

| Technology | Version | Role |
|------------|---------|------|
| **Vanilla CSS** | — | Custom dark glassmorphic design system |
| **CSS Custom Properties** | — | Design tokens (colors, spacing, shadows) |
| **Google Fonts** | — | `Outfit` (UI) + `JetBrains Mono` (financial data) |
| **Lucide React** | latest | Consistent SVG icon library |
| **HTML5 Canvas API** | — | High-performance OHLC candlestick chart rendering |

### Real-Time Communication

| Technology | Role |
|------------|------|
| **Native WebSocket API** | Connects to Spring Boot `/ws/prices` for live tick stream |
| **Brownian Motion Fallback** | Client-side price simulation when backend is unreachable |

### State Management

| Pattern | Role |
|---------|------|
| **React `useState`** | Local UI state (prices, predictions, wallet, notifications) |
| **React `useEffect`** | WebSocket lifecycle, countdown timers, settlement triggers |
| **React `useRef`** | Candlestick history buffer (avoids render thrashing) |
| **`fetch` API** | REST calls to Spring Boot backend (login, deposit, bets) |

### Build & Packaging

| Tool | Role |
|------|------|
| **Vite `build`** | Bundles SPA into `frontend/dist/` |
| **`tsc -b`** | Strict TypeScript compilation check before bundling |
| **Maven `resources` plugin** | Copies `frontend/dist/` → `target/classes/static/` at build time |

---

## Backend Stack

### Core Framework

| Technology | Version | Role |
|------------|---------|------|
| **Java** | 21 (OpenJDK) | Primary language — Virtual Threads capable |
| **Spring Boot** | 3.2.5 | Application framework (auto-config, embedded Tomcat) |
| **Maven** | 3.9.x | Dependency management & build lifecycle |

### Web Layer

| Technology | Role |
|------------|------|
| **Spring MVC** (`spring-boot-starter-web`) | REST API controllers (`/api/**`) |
| **Spring WebSocket** (`spring-boot-starter-websocket`) | Native WebSocket handler for real-time price broadcast |
| **`@CrossOrigin`** | CORS policy — allows React dev server + production |
| **`TextWebSocketHandler`** | Thread-safe session pool with `CopyOnWriteArraySet` |

### Data Layer

| Technology | Version | Role |
|------------|---------|------|
| **Spring Data JPA** | 3.2.x | Repository interfaces — zero-boilerplate CRUD |
| **Hibernate ORM** | 6.4.x | JPA provider — schema DDL generation |
| **H2 Database** | 2.x | In-memory DB for `local` profile (zero dependencies) |
| **PostgreSQL** | 16 | Production DB for `docker` profile |
| **HikariCP** | — | High-performance JDBC connection pool |
| **H2 Web Console** | — | Dev tool at `/h2-console` for SQL inspection |

### Entity & Persistence Design

| Entity | Key Design Decision |
|--------|---------------------|
| `User` | `@Column(unique=true)` username — idempotent `getOrCreate` on login |
| `Wallet` | `@Version` optimistic locking — safe concurrent balance updates |
| `Bet` | Status FSM: `ACTIVE → WON / LOST` — `@Column settledAt` for audit |
| `Transaction` | Immutable audit ledger — append-only, never updated |

### Concurrency Architecture

| Component | Threads | Pattern |
|-----------|---------|---------|
| **`PriceProcessingPool`** | **20 threads** | `Executors.newFixedThreadPool(20)` — 6 symbols × 1s ticks submitted as `Callable` tasks |
| **`SettlementEngine`** | **50 threads** | `Executors.newFixedThreadPool(50)` — scanned each `@Scheduled(fixedDelay=1000)`, expired bets dispatched to worker pool |
| **`@Scheduled`** | Spring `TaskScheduler` | Drives both the price generator and settlement scanner |
| **`@EnableScheduling`** | — | Activated on `ForexPlatformApplication` |
| **Optimistic Locking Retry** | 3 attempts | `ObjectOptimisticLockingFailureException` caught in `WalletService` with 100ms back-off |
| **`CopyOnWriteArraySet`** | — | Thread-safe WebSocket session registry — safe concurrent add/remove/iterate |
| **`ConcurrentHashMap`** | — | Live price cache in `PriceProcessingPool` — wait-free reads |
| **`ThreadLocalRandom`** | — | Per-thread random for Brownian motion — no contention vs `Math.random()` |

### Spring Profiles

| Profile | Database | Purpose |
|---------|----------|---------|
| `local` (default) | H2 in-memory | Zero-dependency local development |
| `docker` | PostgreSQL (container) | Full production infrastructure |

### Validation & Error Handling

| Feature | Implementation |
|---------|---------------|
| `@Valid` | Spring Validation on REST bodies |
| `ResponseEntity<?>` | Typed HTTP responses with proper status codes |
| Try-catch in services | Graceful error propagation to controllers |

---

## Infrastructure (Docker Profile)

| Service | Image | Port | Role |
|---------|-------|------|------|
| **PostgreSQL** | `postgres:16-alpine` | 5432 | Primary relational database |
| **Redis** | `redis:7-alpine` | 6379 | Session cache / pub-sub (future) |
| **Kafka** | `bitnami/kafka:3.6` | 9092 | Event streaming (future settlement events) |
| **ClickHouse** | `clickhouse/clickhouse-server:24` | 8123 | OLAP analytics queries (future) |

---

## Deployment

### Local (Default)
```bash
mvn clean package -DskipTests
java -jar target/forex-prediction-platform-0.0.1-SNAPSHOT.jar
# → http://localhost:8080/
```

### Production (Docker)
```bash
docker-compose up -d
java -jar target/forex-prediction-platform-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=docker
```

### Self-Contained Monolith
The final artifact is a single executable **Spring Boot fat JAR** containing:
- All Java classes + dependencies (in `BOOT-INF/`)
- The full React SPA bundle (in `BOOT-INF/classes/static/`)
- Embedded Tomcat server

No separate web server (Nginx/Apache) or frontend deployment needed.

---

## Performance Characteristics

| Metric | Value |
|--------|-------|
| Cold startup time | ~14 seconds (JVM warm-up + Hibernate DDL) |
| Price tick throughput | 6 assets × 1 tick/second = 6 msg/s broadcast to all WS sessions |
| Settlement latency | < 1 second from prediction expiry to DB update |
| Frontend bundle size | ~245 KB JS (gzip: ~73 KB) |
| Concurrent settlement capacity | 50 bets resolved simultaneously |
| Wallet update safety | Optimistic locking with 3-attempt retry, 100ms back-off |

---

## Developer Tools

| Tool | URL | Notes |
|------|-----|-------|
| H2 Web Console | `http://localhost:8080/h2-console` | JDBC URL: `jdbc:h2:mem:forex_platform`, user: `sa` |
| Spring Boot Actuator | (add dependency to enable) | Health, metrics, thread dumps |
| Vite Dev Server | `npm run dev` in `frontend/` | HMR on port 5173 with proxy to `:8080` |

---

*© BINGO Forex — Built with Java 21 · Spring Boot 3 · React 19 · TypeScript*
