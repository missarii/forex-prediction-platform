# BINGO Forex — DeFi Prediction Market Platform

<div align="center">
  <h3>A high-performance Forex & Crypto prediction trading simulation platform</h3>
  <p>Built with Java 21 · Spring Boot 3 · React 19 · TypeScript · WebSockets</p>

  ![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)
  ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-green?style=flat-square&logo=spring)
  ![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
  ![Maven](https://img.shields.io/badge/Maven-3.9-red?style=flat-square&logo=apachemaven)
</div>

---

## 📌 Overview

**BINGO Forex** is a fully functional, production-grade **Forex prediction and trading simulation platform** built as a senior-level portfolio showcase. Users predict whether an asset's price will go UP or DOWN within a chosen time window and receive a 1.85x payout for correct predictions.

> ⚠️ **Simulation Only** — No real money is ever involved. All balances are virtual mock credits.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔴 **Live Price Feed** | Real-time WebSocket price ticks with Brownian motion simulation for 6 assets |
| 📈 **Candlestick Chart** | High-fidelity HTML5 Canvas OHLC chart with 25+ candle history |
| 🎯 **Prediction Engine** | Place UP/DOWN predictions with 30s–5min durations |
| 💰 **Wallet System** | Deposit, withdraw, view transaction history — persisted in database |
| ⚡ **Auto Settlement** | 50-thread settlement engine resolves expired predictions within 1 second |
| 🤖 **AI Co-Pilot** | Simulated AI sentiment analysis and technical signal suggestions |
| 👥 **Copy Trading** | Mirror predictions from top-ranked expert traders |
| 🏆 **Leaderboard** | Live-ranked hall of fame for top performers |
| 📊 **Analytics Dashboard** | ClickHouse-inspired volume, win-rate, and symbol distribution metrics |

---

## 🗂️ Project Structure

```
forex-prediction-platform/
├── frontend/                    # React + TypeScript + Vite SPA
│   ├── src/
│   │   ├── App.tsx              # Main dashboard & state machine
│   │   ├── index.css            # Global dark glassmorphic design system
│   │   └── components/
│   │       ├── CandlestickChart.tsx   # Canvas-based OHLC chart
│   │       ├── BettingPanel.tsx       # Prediction placement UI
│   │       ├── WalletCard.tsx         # Balance & transaction history
│   │       ├── Leaderboard.tsx        # Trader rankings
│   │       ├── CopyTrading.tsx        # Mirror expert trader predictions
│   │       ├── AiAssistant.tsx        # AI signal & sentiment panel
│   │       └── ClickHouseAnalytics.tsx # Volume & analytics metrics
│   └── dist/                    # Production build (served by Spring Boot)
│
├── src/main/java/com/forex/platform/
│   ├── ForexPlatformApplication.java  # Spring Boot entry point
│   ├── config/
│   │   └── WebSocketConfig.java       # WebSocket route registry
│   ├── domain/                        # JPA Entities
│   │   ├── User.java
│   │   ├── Wallet.java                # With Optimistic Locking @Version
│   │   ├── Bet.java
│   │   └── Transaction.java
│   ├── user/                          # Auth & User management
│   ├── wallet/                        # Wallet CRUD + ledger
│   ├── bet/                           # Prediction placement
│   ├── market/
│   │   ├── PriceProcessingPool.java   # 20-thread price generator
│   │   └── PriceWebSocketHandler.java # Session broadcast manager
│   └── settlement/
│       └── SettlementEngine.java      # 50-thread bet resolver
│
├── src/main/resources/
│   ├── application.properties         # Local H2 profile
│   └── application-docker.properties  # Docker PostgreSQL profile
│
├── docker-compose.yml                 # PostgreSQL + Redis + Kafka + ClickHouse
├── pom.xml                            # Maven build descriptor
├── README.md
├── UserManual.md
└── TechStack.md
```

---

## 🚀 Quick Start

### Prerequisites
- Java 21+
- Maven 3.9+
- Node.js 18+ & npm

### Run in 3 steps

```bash
# 1. Clone the repository
git clone https://github.com/your-org/bingo-forex.git
cd bingo-forex

# 2. Build the frontend
cd frontend && npm install && npm run build && cd ..

# 3. Package and run the monolith
mvn clean package -DskipTests
java -jar target/forex-prediction-platform-0.0.1-SNAPSHOT.jar
```

Open **http://localhost:8080/** in your browser. That's it — no Docker, no external database needed.

---

## 🐳 Docker / Production Mode

```bash
# Start infrastructure (PostgreSQL, Redis, Kafka, ClickHouse)
docker-compose up -d

# Run with docker profile
java -jar target/forex-prediction-platform-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=docker
```

---

## 🔌 REST API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login or auto-register user |
| `GET` | `/api/wallet/{userId}` | Fetch wallet balance |
| `POST` | `/api/wallet/{userId}/deposit` | Add mock credits |
| `POST` | `/api/wallet/{userId}/withdraw` | Withdraw mock credits |
| `GET` | `/api/wallet/{userId}/transactions` | Full transaction ledger |
| `POST` | `/api/bets/place` | Place a new prediction |
| `GET` | `/api/bets/user/{userId}` | Get all user predictions |
| `WS` | `ws://localhost:8080/ws/prices` | Live price tick stream |

---

## 🧵 Concurrency Architecture

```
PriceProcessingPool  ──── 20 threads ────▶  WebSocket broadcast (6 symbols × 1s tick)
SettlementEngine     ──── 50 threads ────▶  Expired bet resolution (JPA + Optimistic Lock)
```

---

## 📄 License

MIT License — free to use, modify, and showcase in your portfolio.
