import React, { useState } from "react";
import { TrendingUp, TrendingDown, Clock, ShieldAlert } from "lucide-react";

interface BettingPanelProps {
  symbol: string;
  currentPrice: number;
  balance: number;
  onPlaceBet: (direction: "UP" | "DOWN", amount: number, durationSeconds: number) => void;
  isSubmitting: boolean;
}

const DURATIONS = [
  { label: "30s", value: 30 },
  { label: "1m", value: 60 },
  { label: "5m", value: 300 },
  { label: "15m", value: 900 },
  { label: "1h", value: 3600 },
];

export const BettingPanel: React.FC<BettingPanelProps> = ({
  symbol,
  currentPrice,
  balance,
  onPlaceBet,
  isSubmitting,
}) => {
  const [stake, setStake] = useState<number>(100);
  const [duration, setDuration] = useState<number>(30); // default 30s for demo speed!

  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      setStake(val);
    } else {
      setStake(0);
    }
  };

  const handlePredefinedStake = (amount: number) => {
    setStake(amount);
  };

  const handlePredict = (direction: "UP" | "DOWN") => {
    if (stake <= 0) return;
    if (stake > balance) {
      alert("Insufficient wallet balance!");
      return;
    }
    onPlaceBet(direction, stake, duration);
  };

  const isInvalid = stake <= 0 || stake > balance || isSubmitting;

  return (
    <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#f8fafc", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
        Market Prediction Engine
      </h3>

      {/* Symbol and Current Price */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Target Asset</span>
        <span className="crypto-font" style={{ fontWeight: "700", color: "var(--color-primary)" }}>{symbol}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Current Entry Price</span>
        <span className="crypto-font" style={{ fontWeight: "700", color: "#f8fafc", fontSize: "18px" }}>
          {currentPrice.toFixed(symbol.includes("USD") ? 5 : 2)}
        </span>
      </div>

      {/* Duration Selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
          <Clock size={14} /> Prediction Duration
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDuration(d.value)}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: "6px",
                border: duration === d.value ? "1px solid var(--color-primary)" : "1px solid rgba(255, 255, 255, 0.05)",
                backgroundColor: duration === d.value ? "rgba(0, 242, 254, 0.1)" : "rgba(255, 255, 255, 0.02)",
                color: duration === d.value ? "var(--color-primary)" : "var(--text-secondary)",
                fontFamily: "var(--font-sans)",
                fontWeight: "600",
                fontSize: "12px",
                cursor: "pointer",
                transition: "var(--transition-fast)",
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stake Selection */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Staked Investment ($)</span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Available: ${balance.toLocaleString()}</span>
        </div>
        <input
          type="number"
          value={stake === 0 ? "" : stake}
          onChange={handleStakeChange}
          min="1"
          max={balance}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: "rgba(7, 9, 19, 0.5)",
            color: "#f8fafc",
            fontFamily: "var(--font-mono)",
            fontSize: "16px",
            outline: "none",
            boxSizing: "border-box",
          }}
          placeholder="Enter prediction stake..."
        />
        <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
          {[50, 100, 500, 1000].map((amount) => (
            <button
              key={amount}
              onClick={() => handlePredefinedStake(amount)}
              style={{
                flex: 1,
                padding: "6px 0",
                borderRadius: "4px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                backgroundColor: "rgba(255,255,255,0.02)",
                color: "var(--text-secondary)",
                fontSize: "11px",
                cursor: "pointer",
                transition: "var(--transition-fast)",
              }}
            >
              +${amount}
            </button>
          ))}
        </div>
      </div>

      {/* Leverage Warning */}
      <div style={{
        display: "flex",
        gap: "8px",
        padding: "10px",
        borderRadius: "6px",
        backgroundColor: "rgba(255, 61, 0, 0.04)",
        border: "1px solid rgba(255, 61, 0, 0.15)",
        color: "var(--text-secondary)",
        fontSize: "11px",
        lineHeight: "1.4"
      }}>
        <ShieldAlert size={28} style={{ color: "var(--color-bearish)", flexShrink: 0 }} />
        <span>
          <strong>Payout Ratio: 1.85x.</strong> Correct predictions payout 185% of stake. Incorrect predictions result in 100% loss of stake. Real-time updates occur via WebSockets.
        </span>
      </div>

      {/* Up / Down Action Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
        <button
          className="btn-bull"
          onClick={() => handlePredict("UP")}
          disabled={isInvalid}
        >
          <TrendingUp size={24} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "14px" }}>Predict UP</span>
            <span style={{ fontSize: "10px", opacity: 0.8 }}>Payout: ${(stake * 1.85).toFixed(0)}</span>
          </div>
        </button>

        <button
          className="btn-bear"
          onClick={() => handlePredict("DOWN")}
          disabled={isInvalid}
        >
          <TrendingDown size={24} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "14px" }}>Predict DOWN</span>
            <span style={{ fontSize: "10px", opacity: 0.8 }}>Payout: ${(stake * 1.85).toFixed(0)}</span>
          </div>
        </button>
      </div>
    </div>
  );
};
