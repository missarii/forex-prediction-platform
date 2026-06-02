import { useState, useEffect, useRef } from "react";
import {
  Activity,
  History,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { CandlestickChart } from "./components/CandlestickChart";
import type { Candlestick } from "./components/CandlestickChart";
import { BettingPanel } from "./components/BettingPanel";
import { WalletCard } from "./components/WalletCard";
import type { Transaction } from "./components/WalletCard";
import { Leaderboard } from "./components/Leaderboard";
import type { LeaderboardUser } from "./components/Leaderboard";
import { CopyTrading } from "./components/CopyTrading";
import type { MasterTrader } from "./components/CopyTrading";
import { AiAssistant } from "./components/AiAssistant";
import { ClickHouseAnalytics } from "./components/ClickHouseAnalytics";
import type { AnalyticsData } from "./components/ClickHouseAnalytics";

// Core Forex and Crypto symbols
const SYMBOLS = ["EUR/USD", "GBP/USD", "USD/JPY", "BTC/USD", "ETH/USD", "XAU/USD"];

// Base starting prices for simulation
const BASE_PRICES: { [key: string]: number } = {
  "EUR/USD": 1.0854,
  "GBP/USD": 1.2642,
  "USD/JPY": 156.45,
  "BTC/USD": 68420.5,
  "ETH/USD": 3820.75,
  "XAU/USD": 2342.3,
};

interface ActivePrediction {
  id: string;
  symbol: string;
  direction: "UP" | "DOWN";
  amount: number;
  entryPrice: number;
  durationSeconds: number;
  timeLeft: number;
  timestamp: number;
}

interface SettleHistory {
  id: string;
  symbol: string;
  direction: "UP" | "DOWN";
  amount: number;
  entryPrice: number;
  exitPrice: number;
  result: "WIN" | "LOSS";
  payout: number;
  timestamp: string;
}

export default function App() {
  // User Session state
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [tempUsername, setTempUsername] = useState("");
  const [balance, setBalance] = useState<number>(5000);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // WebSocket Price Feed states
  const [prices, setPrices] = useState<{ [key: string]: number }>(BASE_PRICES);
  // Stable ref so fallback simulator always reads the latest price without causing re-mounts
  const pricesRef = useRef<{ [key: string]: number }>(BASE_PRICES);
  const [tickChanges, setTickChanges] = useState<{ [key: string]: "up" | "down" | null }>({});
  const [activeSymbol, setActiveSymbol] = useState<string>("BTC/USD");
  const activeSymbolRef = useRef<string>("BTC/USD");

  // Candlestick history for selected asset
  const [candles, setCandles] = useState<Candlestick[]>([]);
  const candleHistoryRef = useRef<{ [key: string]: Candlestick[] }>({});

  // Active predictions & history
  const [predictions, setPredictions] = useState<ActivePrediction[]>([]);
  const [history, setHistory] = useState<SettleHistory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "tx-init",
      type: "DEPOSIT",
      amount: 5000,
      description: "Welcome Mock Allocation",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Showcase elements state
  const [activeCopies, setActiveCopies] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "danger" | "info" } | null>(null);

  // Live WebSocket references
  const priceSocketRef = useRef<WebSocket | null>(null);

  // Static Mock Data for ClickHouse, Leaderboard and CopyTrading
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalPredictions: 245903,
    totalVolume: 12450325,
    averageWinRate: 53.8,
    activeUsers24h: 3120,
    mostTradedSymbol: "BTC/USD",
    volumeBySymbol: {
      "BTC/USD": 5824900,
      "ETH/USD": 3120400,
      "EUR/USD": 1845100,
      "XAU/USD": 1659925,
    },
  });

  const [leaderboard] = useState<LeaderboardUser[]>([
    { rank: 1, username: "AlphaWolf", profit: 243500, winRate: 64.2, predictionsCount: 890 },
    { rank: 2, username: "BullMaster", profit: 187420, winRate: 58.7, predictionsCount: 1420 },
    { rank: 3, username: "SatoshiPredicts", profit: 125900, winRate: 56.4, predictionsCount: 650 },
    { rank: 4, username: "ForexQueen", profit: 94100, winRate: 54.1, predictionsCount: 1100 },
    { rank: 5, username: "CopyMePlease", profit: 82500, winRate: 53.8, predictionsCount: 780 },
  ]);

  const [masterTraders] = useState<MasterTrader[]>([
    { username: "AlphaWolf", profit: 243500, winRate: 64.2, copiers: 420, hotStreak: 5 },
    { username: "ForexQueen", profit: 94100, winRate: 54.1, copiers: 185, hotStreak: 3 },
  ]);

  // Display glowing notifications
  const triggerNotification = (message: string, type: "success" | "danger" | "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Auto-login or backend database synchronization
  useEffect(() => {
    if (user && !userId) {
      fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Auth failed");
          return res.json();
        })
        .then((data) => {
          setUserId(data.id);
          triggerNotification(`Synced with backend database!`, "success");
          return fetch(`/api/wallet/${data.id}`);
        })
        .then((res) => res && res.json())
        .then((walletData) => {
          if (walletData && walletData.balance !== undefined) {
            setBalance(walletData.balance);
            return fetch(`/api/wallet/${walletData.userId}/transactions`);
          }
        })
        .then((res) => res && res.json())
        .then((txs) => {
          if (txs) {
            const mappedTxs = txs.map((t: any) => ({
              id: `tx-${t.id}`,
              type: t.type,
              amount: t.amount,
              description: t.description,
              timestamp: new Date(t.createdAt).toLocaleTimeString(),
            }));
            setTransactions(mappedTxs);
          }
        })
        .catch((_err) => {
          console.warn("Backend API not reachable. Falling back to local simulation.");
        });
    }
  }, [user, userId]);

  // 1. Establish Price feed (via backend WebSocket, with client-side fallback)
  // IMPORTANT: no state in deps array — avoids restarting the socket on every tick
  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname}:8080/ws/prices`;
    const ws = new WebSocket(wsUrl);
    priceSocketRef.current = ws;
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;

    ws.onopen = () => {
      console.log("WebSocket connected to backend Price broker");
      triggerNotification("Connected to live market data feed", "success");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.symbol && data.price) {
          updatePrice(data.symbol, data.price);
        }
      } catch (err) {
        console.error("Failed parsing live price feed payload", err);
      }
    };

    ws.onerror = () => {
      console.log("Unable to reach backend WebSocket. Launching local pricing simulator...");
    };

    ws.onclose = () => {
      // Fallback: simulate price ticks using the stable pricesRef (no stale closure)
      fallbackInterval = setInterval(() => {
        SYMBOLS.forEach((sym) => {
          const cur = pricesRef.current[sym];
          // Per-symbol realistic volatility
          let volatility: number;
          if (sym === "BTC/USD") volatility = cur * 0.0004;
          else if (sym === "ETH/USD") volatility = cur * 0.0004;
          else if (sym === "XAU/USD") volatility = cur * 0.0002;
          else if (sym === "USD/JPY") volatility = 0.06;
          else volatility = 0.0003; // EUR/USD, GBP/USD
          const drift = (Math.random() - 0.495) * volatility;
          updatePrice(sym, cur + drift);
        });
      }, 1000);
    };

    return () => {
      if (fallbackInterval) clearInterval(fallbackInterval);
      ws.close();
    };
  }, []); // run once — stable because we read from refs

  // Update a specific asset's price — reads from ref to avoid stale closures
  const updatePrice = (sym: string, val: number) => {
    const prev = pricesRef.current[sym] ?? val;
    if (Math.abs(prev - val) < 1e-10) return;

    // Keep ref in sync (instant, no re-render cost)
    pricesRef.current = { ...pricesRef.current, [sym]: val };

    // Trigger React state update for UI
    setPrices((p) => ({ ...p, [sym]: val }));

    // Tick direction flash
    const direction = val > prev ? "up" : "down";
    setTickChanges((t) => ({ ...t, [sym]: direction }));
    setTimeout(() => setTickChanges((t) => ({ ...t, [sym]: null })), 600);

    // ── Candle OHLC logic ──────────────────────────────────────────
    const now = Math.floor(Date.now() / 1000);
    const existing = candleHistoryRef.current[sym] || [];

    if (existing.length === 0) {
      // Seed with 30 back-filled candles proportional to asset price
      const seed: Candlestick[] = [];
      let base = val;
      const tickSize = val * 0.002; // 0.2% per historical candle
      for (let i = 30; i >= 0; i--) {
        const open = base + (Math.random() - 0.5) * tickSize;
        const close = base;
        const high = Math.max(open, close) + Math.random() * tickSize * 0.5;
        const low = Math.min(open, close) - Math.random() * tickSize * 0.5;
        seed.push({ time: now - i * 5, open, high, low, close });
        base = open;
      }
      candleHistoryRef.current[sym] = seed;
    } else {
      const last = existing[existing.length - 1];
      const age = now - last.time;
      if (age < 5) {
        // Still in the same 5-second candle — just update it
        last.close = val;
        last.high = Math.max(last.high, val);
        last.low = Math.min(last.low, val);
      } else {
        // New candle
        existing.push({
          time: now,
          open: last.close,
          high: Math.max(last.close, val),
          low: Math.min(last.close, val),
          close: val,
        });
        if (existing.length > 60) existing.shift();
      }
    }

    // Only push a new array ref when this is the active chart
    if (sym === activeSymbolRef.current) {
      setCandles([...(candleHistoryRef.current[sym] || [])]);
    }
  };

  // Sync active chart candles AND ref when selected symbol changes
  useEffect(() => {
    activeSymbolRef.current = activeSymbol;
    setCandles([...(candleHistoryRef.current[activeSymbol] || [])]);
  }, [activeSymbol]);

  // 2. Active Predictions ticking countdown loop (1 second intervals)
  useEffect(() => {
    const timer = setInterval(() => {
      setPredictions((prevBets) => {
        const updatedBets: ActivePrediction[] = [];

        prevBets.forEach((bet) => {
          const nextTimeLeft = bet.timeLeft - 1;

          if (nextTimeLeft <= 0) {
            // Predict expiration triggered! Resolve it.
            resolvePrediction(bet);
          } else {
            updatedBets.push({ ...bet, timeLeft: nextTimeLeft });
          }
        });

        return updatedBets;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [predictions, prices]);

  // Resolve a single prediction comparing entry and exit prices
  const resolvePrediction = (bet: ActivePrediction) => {
    const exitPrice = prices[bet.symbol];
    const entryPrice = bet.entryPrice;

    let isWin = false;
    if (bet.direction === "UP") {
      isWin = exitPrice > entryPrice;
    } else {
      isWin = exitPrice < entryPrice;
    }

    const payout = isWin ? bet.amount * 1.85 : 0;
    const result = isWin ? "WIN" : "LOSS";

    // Adjust balance and logs locally
    setBalance((prev) => prev + payout);

    // Add transaction logs
    const newTx: Transaction = {
      id: `tx-res-${bet.id}`,
      type: isWin ? "BET_PAYOUT" : "BET_STAKE",
      amount: isWin ? payout : bet.amount,
      description: `Prediction Settle: ${bet.symbol} (${result})`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Add prediction history
    const historyItem: SettleHistory = {
      id: bet.id,
      symbol: bet.symbol,
      direction: bet.direction,
      amount: bet.amount,
      entryPrice,
      exitPrice,
      result,
      payout,
      timestamp: new Date().toLocaleTimeString(),
    };
    setHistory((prev) => [historyItem, ...prev]);

    // Increment analytics
    setAnalytics((prev) => {
      const nextTotal = prev.totalPredictions + 1;
      const nextVolume = prev.totalVolume + bet.amount;
      const nextWr = ((prev.averageWinRate * prev.totalPredictions) + (isWin ? 100 : 0)) / nextTotal;
      const nextMap = { ...prev.volumeBySymbol };
      nextMap[bet.symbol] = (nextMap[bet.symbol] || 0) + bet.amount;
      return {
        ...prev,
        totalPredictions: nextTotal,
        totalVolume: nextVolume,
        averageWinRate: nextWr,
        volumeBySymbol: nextMap,
      };
    });

    // Notify user
    if (isWin) {
      triggerNotification(`🎉 Prediction Resolved: WIN! +$${payout.toFixed(0)} payout on ${bet.symbol}`, "success");
    } else {
      triggerNotification(`📉 Prediction Resolved: LOSS. -$${bet.amount} stake lost on ${bet.symbol}`, "danger");
    }

    // Database re-sync
    if (userId) {
      setTimeout(() => {
        fetch(`/api/wallet/${userId}`)
          .then((res) => res.json())
          .then((walletData) => {
            if (walletData) setBalance(walletData.balance);
          });
        fetch(`/api/wallet/${userId}/transactions`)
          .then((res) => res.json())
          .then((txs) => {
            if (txs) {
              const mappedTxs = txs.map((t: any) => ({
                id: `tx-${t.id}`,
                type: t.type,
                amount: t.amount,
                description: t.description,
                timestamp: new Date(t.createdAt).toLocaleTimeString(),
              }));
              setTransactions(mappedTxs);
            }
          });
        fetch(`/api/bets/user/${userId}`)
          .then((res) => res.json())
          .then((bets) => {
            if (bets) {
              const mappedHistory = bets
                .filter((b: any) => b.status !== "ACTIVE")
                .map((b: any) => ({
                  id: `bet-${b.id}`,
                  symbol: b.symbol,
                  direction: b.direction,
                  amount: b.amount,
                  entryPrice: b.entryPrice,
                  exitPrice: b.exitPrice || b.entryPrice,
                  result: b.status,
                  payout: b.status === "WON" ? b.amount * 1.85 : 0,
                  timestamp: new Date(b.settledAt || b.createdAt).toLocaleTimeString(),
                }));
              setHistory(mappedHistory);
            }
          });
      }, 1000);
    }
  };

  // 3. Place Prediction
  const handlePlaceBet = (direction: "UP" | "DOWN", amount: number, durationSeconds: number) => {
    setIsSubmitting(true);

    if (userId) {
      fetch("/api/bets/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, symbol: activeSymbol, direction, amount, durationSeconds }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to place prediction");
          return res.json();
        })
        .then((_betData) => {
          return fetch(`/api/wallet/${userId}`);
        })
        .then((res) => res && res.json())
        .then((walletData) => {
          if (walletData) setBalance(walletData.balance);

          const newBet: ActivePrediction = {
            id: `bet-${Date.now()}`,
            symbol: activeSymbol,
            direction,
            amount,
            entryPrice: prices[activeSymbol],
            durationSeconds,
            timeLeft: durationSeconds,
            timestamp: Date.now(),
          };

          setPredictions((prev) => [newBet, ...prev]);
          triggerNotification(`🚀 Placed $${amount} prediction on ${activeSymbol} going ${direction}`, "info");

          return fetch(`/api/wallet/${userId}/transactions`);
        })
        .then((res) => res && res.json())
        .then((txs) => {
          if (txs) {
            const mappedTxs = txs.map((t: any) => ({
              id: `tx-${t.id}`,
              type: t.type,
              amount: t.amount,
              description: t.description,
              timestamp: new Date(t.createdAt).toLocaleTimeString(),
            }));
            setTransactions(mappedTxs);
          }
        })
        .catch((_err) => {
          triggerNotification("Failed to place prediction on server", "danger");
        })
        .finally(() => setIsSubmitting(false));
    } else {
      setBalance((prev) => prev - amount);
      const stakeTx: Transaction = {
        id: `tx-stake-${Date.now()}`,
        type: "BET_STAKE",
        amount,
        description: `Opened ${direction} on ${activeSymbol}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setTransactions((prev) => [stakeTx, ...prev]);

      const newBet: ActivePrediction = {
        id: `bet-${Date.now()}`,
        symbol: activeSymbol,
        direction,
        amount,
        entryPrice: prices[activeSymbol],
        durationSeconds,
        timeLeft: durationSeconds,
        timestamp: Date.now(),
      };

      setPredictions((prev) => [newBet, ...prev]);
      setIsSubmitting(false);
      triggerNotification(`🚀 Placed ${amount} prediction on ${activeSymbol} going ${direction}`, "info");
    }

    // Mirroring Copy Trade feature
    activeCopies.forEach((copiedTrader) => {
      setTimeout(() => {
        triggerNotification(`👥 Copied ${copiedTrader}: Auto-mirrored ${direction} trade placed on ${activeSymbol}!`, "success");
        setBalance((prev) => prev - amount);
        const copiedBet: ActivePrediction = {
          id: `bet-copy-${Date.now()}`,
          symbol: activeSymbol,
          direction,
          amount,
          entryPrice: prices[activeSymbol],
          durationSeconds,
          timeLeft: durationSeconds,
          timestamp: Date.now(),
        };
        setPredictions((prev) => [copiedBet, ...prev]);
      }, 1500);
    });
  };

  // 4. Wallet actions
  const handleDeposit = (amount: number) => {
    setIsSubmitting(true);
    if (userId) {
      fetch(`/api/wallet/${userId}/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Deposit failed");
          return res.json();
        })
        .then((walletData) => {
          setBalance(walletData.balance);
          triggerNotification(`💰 Deposited $${amount.toLocaleString()} credits successfully!`, "success");
          return fetch(`/api/wallet/${userId}/transactions`);
        })
        .then((res) => res && res.json())
        .then((txs) => {
          if (txs) {
            const mappedTxs = txs.map((t: any) => ({
              id: `tx-${t.id}`,
              type: t.type,
              amount: t.amount,
              description: t.description,
              timestamp: new Date(t.createdAt).toLocaleTimeString(),
            }));
            setTransactions(mappedTxs);
          }
        })
        .catch((_err) => {
          triggerNotification("Deposit failed on server", "danger");
        })
        .finally(() => setIsSubmitting(false));
    } else {
      setTimeout(() => {
        setBalance((prev) => prev + amount);
        const newTx: Transaction = {
          id: `tx-dep-${Date.now()}`,
          type: "DEPOSIT",
          amount,
          description: "Wallet Mock Deposit",
          timestamp: new Date().toLocaleTimeString(),
        };
        setTransactions((prev) => [newTx, ...prev]);
        setIsSubmitting(false);
        triggerNotification(`💰 Deposited $${amount.toLocaleString()} mock credits successfully!`, "success");
      }, 500);
    }
  };

  const handleWithdraw = (amount: number) => {
    setIsSubmitting(true);
    if (userId) {
      fetch(`/api/wallet/${userId}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Withdrawal failed");
          return res.json();
        })
        .then((walletData) => {
          setBalance(walletData.balance);
          triggerNotification(`💳 Withdrew $${amount.toLocaleString()} credits successfully.`, "success");
          return fetch(`/api/wallet/${userId}/transactions`);
        })
        .then((res) => res && res.json())
        .then((txs) => {
          if (txs) {
            const mappedTxs = txs.map((t: any) => ({
              id: `tx-${t.id}`,
              type: t.type,
              amount: t.amount,
              description: t.description,
              timestamp: new Date(t.createdAt).toLocaleTimeString(),
            }));
            setTransactions(mappedTxs);
          }
        })
        .catch((_err) => {
          triggerNotification("Withdrawal failed on server", "danger");
        })
        .finally(() => setIsSubmitting(false));
    } else {
      setTimeout(() => {
        setBalance((prev) => prev - amount);
        const newTx: Transaction = {
          id: `tx-wth-${Date.now()}`,
          type: "WITHDRAW",
          amount,
          description: "Wallet Simulated Cashout",
          timestamp: new Date().toLocaleTimeString(),
        };
        setTransactions((prev) => [newTx, ...prev]);
        setIsSubmitting(false);
        triggerNotification(`💳 Withdrew $${amount.toLocaleString()} mock credits. Syncing...`, "success");
      }, 500);
    }
  };

  // 5. Copy Trade toggles
  const handleToggleCopy = (username: string) => {
    if (activeCopies.includes(username)) {
      setActiveCopies((prev) => prev.filter((u) => u !== username));
      triggerNotification(`Stopped mirroring predictions from ${username}`, "info");
    } else {
      setActiveCopies((prev) => [...prev, username]);
      triggerNotification(`Now auto-mirroring predictions from ${username}!`, "success");
    }
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUsername.trim().length >= 3) {
      setIsSubmitting(true);
      fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: tempUsername.trim() }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Auth failed");
          return res.json();
        })
        .then((data) => {
          setUser({ username: data.username });
          setUserId(data.id);
          triggerNotification(`Welcome back, ${data.username}!`, "success");
          setTempUsername("");
          return fetch(`/api/wallet/${data.id}`);
        })
        .then((res) => res && res.json())
        .then((walletData) => {
          if (walletData) setBalance(walletData.balance);
        })
        .catch((_err) => {
          setUser({ username: tempUsername });
          triggerNotification(`Welcome back, ${tempUsername}! (Simulation)`, "success");
          setTempUsername("");
        })
        .finally(() => setIsSubmitting(false));
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUserId(null);
    setBalance(5000);
    setTransactions([]);
  };

  return (
    <div className="app-container">
      {/* 1. Header and navigation bar */}
      <header
        className="glass-panel"
        style={{
          margin: "15px",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "12px",
          border: "1px solid var(--border-glass)",
        }}
      >
        {/* Brand Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-neon-primary)",
            }}
          >
            <Activity size={18} style={{ color: "#070913" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "16px", fontWeight: "800", letterSpacing: "1px", color: "#f8fafc" }}>
              BINGO Forex
            </span>
            <span style={{ fontSize: "10px", color: "var(--color-primary)", fontWeight: "700" }}>
              DEFI PREDICTION MARKET
            </span>
          </div>
        </div>

        {/* User login / status */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              borderRadius: "6px",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <UserIcon size={14} style={{ color: "var(--color-primary)" }} />
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#f8fafc" }}>
              {user ? user.username : "Guest Mode"}
            </span>
          </div>
          {user && (
            <button
              onClick={handleLogout}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </header>

      {/* 2. Scrolling Ticker Panel */}
      <section
        style={{
          margin: "0 15px 15px 15px",
          padding: "10px 16px",
          overflowX: "auto",
          display: "flex",
          gap: "16px",
          backgroundColor: "rgba(13, 17, 39, 0.4)",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.03)",
        }}
      >
        {SYMBOLS.map((sym) => {
          const price = prices[sym];
          const change = tickChanges[sym];
          const isActive = sym === activeSymbol;

          return (
            <div
              key={sym}
              onClick={() => setActiveSymbol(sym)}
              className={`glass-panel ${isActive ? "glow-cyan" : ""}`}
              style={{
                flex: "0 0 170px",
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: isActive ? "rgba(0, 242, 254, 0.05)" : "var(--bg-glass)",
                borderColor: isActive ? "rgba(0, 242, 254, 0.25)" : "var(--border-glass)",
                transition: "var(--transition-fast)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#f8fafc" }}>{sym}</span>
                <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>
                  {sym.includes("USD") ? "Forex Ticker" : "Volatility Engine"}
                </span>
              </div>
              <span
                className="crypto-font"
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: change === "up" ? "var(--color-bullish)" : change === "down" ? "var(--color-bearish)" : "#f8fafc",
                }}
              >
                {price.toFixed(sym.includes("USD") ? 4 : 2)}
              </span>
            </div>
          );
        })}
      </section>

      {/* Main Grid content */}
      <main className="main-content">
        {/* Left Side: Candlestick, active bets, settlement history + feature panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: 0, overflow: "hidden" }}>
          {/* Chart Wrapper */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Selected Trading Index</span>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#f8fafc" }}>
                  {activeSymbol} Live Canvas Feed
                </h2>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span className="crypto-font" style={{ fontSize: "22px", fontWeight: "800", color: "#f8fafc" }}>
                  {prices[activeSymbol].toFixed(
                    activeSymbol.includes("BTC") || activeSymbol.includes("ETH") || activeSymbol.includes("XAU") ? 2
                    : activeSymbol.includes("JPY") ? 3 : 5
                  )}
                </span>
              </div>
            </div>

            <CandlestickChart
              candles={candles}
              currentPrice={prices[activeSymbol]}
              symbol={activeSymbol}
            />
          </div>

          {/* Active prediction queue and countdown */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#f8fafc",
                marginBottom: "12px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                paddingBottom: "8px",
              }}
            >
              Ongoing Positions ({predictions.length})
            </h3>

            {predictions.length === 0 ? (
              <div style={{ padding: "30px 0", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
                No active predictions. Submit your forecast in the panel to trade!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {predictions.map((bet) => {
                  const isUp = bet.direction === "UP";
                  const percentDone = ((bet.durationSeconds - bet.timeLeft) / bet.durationSeconds) * 100;

                  return (
                    <div
                      key={bet.id}
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(255,255,255,0.01)",
                        border: "1px solid rgba(255,255,255,0.04)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "800",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor: isUp ? "rgba(0, 230, 118, 0.1)" : "rgba(255, 61, 0, 0.1)",
                              color: isUp ? "var(--color-bullish)" : "var(--color-bearish)",
                            }}
                          >
                            {bet.direction}
                          </span>
                          <span className="crypto-font" style={{ fontSize: "13px", fontWeight: "700" }}>{bet.symbol}</span>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            Entry: {bet.entryPrice.toFixed(bet.symbol.includes("USD") ? 4 : 2)}
                          </span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span className="crypto-font" style={{ fontSize: "13px", fontWeight: "700", color: "#f8fafc" }}>
                            ${bet.amount}
                          </span>
                          <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>Staked</div>
                        </div>
                      </div>

                      {/* Progress bar and time left */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ flex: 1, height: "4px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${percentDone}%`,
                              height: "100%",
                              backgroundColor: isUp ? "var(--color-bullish)" : "var(--color-bearish)",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--color-primary)", fontWeight: "700", minWidth: "24px", textAlign: "right" }}>
                          {bet.timeLeft}s
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Settle History Logs */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#f8fafc",
                marginBottom: "12px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                paddingBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <History size={16} /> Settlement History
            </h3>

            {history.length === 0 ? (
              <div style={{ padding: "30px 0", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
                Expired predictions will show results here.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto" }}>
                {history.map((h) => {
                  const win = h.result === "WIN";
                  return (
                    <div
                      key={h.id}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(255,255,255,0.01)",
                        border: "1px solid rgba(255,255,255,0.03)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              fontSize: "9px",
                              fontWeight: "800",
                              color: win ? "var(--color-bullish)" : "var(--color-bearish)",
                            }}
                          >
                            {h.result}
                          </span>
                          <span className="crypto-font" style={{ fontSize: "12px", fontWeight: "700" }}>{h.symbol}</span>
                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{h.direction}</span>
                        </div>
                        <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>
                          In: {h.entryPrice.toFixed(h.symbol.includes("USD") ? 4 : 2)} • Out: {h.exitPrice.toFixed(h.symbol.includes("USD") ? 4 : 2)}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span
                          className="crypto-font"
                          style={{
                            fontSize: "12px",
                            fontWeight: "800",
                            color: win ? "var(--color-bullish)" : "var(--text-muted)",
                          }}
                        >
                          {win ? `+$${h.payout.toFixed(0)}` : `-$${h.amount.toFixed(0)}`}
                        </span>
                        <div style={{ fontSize: "8px", color: "var(--text-muted)" }}>{h.timestamp}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Additional Features — vertical stack within left column */}
          <WalletCard
            balance={balance}
            transactions={transactions}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
            isSubmitting={isSubmitting}
          />
          <AiAssistant symbol={activeSymbol} currentPrice={prices[activeSymbol]} />
          <CopyTrading
            traders={masterTraders}
            activeCopies={activeCopies}
            onToggleCopy={handleToggleCopy}
          />
          <Leaderboard traders={leaderboard} />
          <ClickHouseAnalytics data={analytics} />
        </div>

        {/* Right Side: Betting Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Betting Action Panel */}
          <BettingPanel
            symbol={activeSymbol}
            currentPrice={prices[activeSymbol]}
            balance={balance}
            onPlaceBet={handlePlaceBet}
            isSubmitting={isSubmitting}
          />
        </div>
      </main>

      {/* Footer copyright */}
      <footer
        style={{
          textAlign: "center",
          padding: "20px 0",
          fontSize: "12px",
          color: "var(--text-muted)",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          marginTop: "40px",
        }}
      >
        © 2026 BINGO ForexDEFI PREDICTION MARKET
      </footer>

      {/* Floating alert/notification banner */}
      {notification && (
        <div
          className="glass-panel"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "16px 20px",
            borderRadius: "12px",
            borderLeft: `4px solid ${notification.type === "success" ? "var(--color-bullish)" : notification.type === "danger" ? "var(--color-bearish)" : "var(--color-primary)"}`,
            backgroundColor: "var(--bg-glass-heavy)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            maxWidth: "380px",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc" }}>
            {notification.message}
          </span>
        </div>
      )}

      {/* Registration popup modal if user is null */}
      {!user && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#0a0a0a",
            display: "flex",
            zIndex: 99999,
            pointerEvents: "all",
          }}
        >
          {/* Left Side (Image & Copy) */}
          <div style={{
            flex: 1,
            backgroundImage: "url('/bg-login.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px",
            position: "relative",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "60px" }}>
                <Activity size={32} style={{ color: "var(--color-primary)" }} />
                <span style={{ fontSize: "24px", fontWeight: "800", color: "#fff", letterSpacing: "1px" }}>BINGO FOREX</span>
              </div>

              <h1 style={{ fontSize: "56px", fontWeight: "800", color: "#fff", lineHeight: "1.1", marginBottom: "24px" }}>
                Trade Smarter, Grow Faster
              </h1>
              <p style={{ fontSize: "22px", color: "rgba(255,255,255,0.8)", maxWidth: "460px", lineHeight: "1.4" }}>
                Turn every market opportunity into a winning move.
              </p>

              <div style={{ display: "flex", gap: "16px", marginTop: "80px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>f</div>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>G</div>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>in</div>
              </div>
            </div>
          </div>

          {/* Right Side (Form) */}
          <div style={{
            flex: 1,
            backgroundColor: "#111111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <form
              onSubmit={handleLoginSubmit}
              style={{
                width: "400px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "32px", fontWeight: "700", color: "#f8fafc", marginBottom: "20px" }}>
                  Login<span style={{ color: "var(--color-primary)" }}>_</span>
                </h2>
                <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "24px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}>f</div>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}>G</div>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}>in</div>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  or use your email account
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <input
                  id="username-input"
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  autoFocus
                  autoComplete="off"
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    color: "#f8fafc",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "var(--font-sans)",
                    width: "100%",
                  }}
                  placeholder="Trader Identity (min 3 chars)"
                  required
                  minLength={3}
                />
                <input
                  type="password"
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    color: "#f8fafc",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "var(--font-sans)",
                    width: "100%",
                  }}
                  placeholder="Password"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", cursor: "pointer" }}>Forgot your password?</span>
              </div>

              <button
                id="launch-platform-btn"
                type="submit"
                disabled={isSubmitting || tempUsername.trim().length < 3}
                style={{
                  width: "200px",
                  margin: "0 auto",
                  padding: "14px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  backgroundColor: "var(--color-primary)",
                  color: "#000",
                  border: "none",
                  borderRadius: "24px",
                  marginTop: "10px",
                  transition: "var(--transition-fast)"
                }}
              >
                {isSubmitting ? "CONNECTING..." : "SIGN IN"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
