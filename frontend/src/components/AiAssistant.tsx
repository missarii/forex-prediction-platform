import React, { useEffect, useState } from "react";
import { BrainCircuit, Sparkles, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

interface AiAssistantProps {
  symbol: string;
  currentPrice: number;
}

interface Signal {
  direction: "UP" | "DOWN";
  confidence: number;
  reason: string;
  sentiment: number; // 0 to 100 (bullish score)
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ symbol, currentPrice }) => {
  const [signal, setSignal] = useState<Signal>({
    direction: "UP",
    confidence: 76,
    reason: "Relative Strength Index (RSI) indicating oversold conditions. Upward support holds.",
    sentiment: 78,
  });
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Generate a mock AI suggestion whenever symbol or price changes
  useEffect(() => {
    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      const isUp = (currentPrice * 1000) % 2 === 0;
      const conf = Math.floor(65 + Math.random() * 25);
      const sent = isUp ? conf : 100 - conf;
      
      const reasons = isUp
        ? [
            "Moving Average Convergence Divergence (MACD) crossed bullishly on 5m candles.",
            "Strong double-bottom consolidation at key dynamic support zones.",
            "Order book imbalance shows major buying volume accumulating at bid sizes.",
          ]
        : [
            "Overbought threshold surpassed on the Stochastic Oscillator (14, 3, 3).",
            "Resistance ceiling rejected with declining relative purchase volumes.",
            "Momentum velocity slowing down. Standard micro-correction anticipated.",
          ];

      setSignal({
        direction: isUp ? "UP" : "DOWN",
        confidence: conf,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        sentiment: sent,
      });
      setIsAnalyzing(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [symbol, currentPrice]);

  return (
    <div className="glass-panel glow-cyan" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
          <BrainCircuit size={18} style={{ color: "var(--color-primary)" }} /> AI Trading Co-Pilot
        </h3>
        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "9px", backgroundColor: "rgba(0, 242, 254, 0.1)", color: "var(--color-primary)", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
          <Sparkles size={10} /> QUANT V1
        </span>
      </div>

      {isAnalyzing ? (
        <div style={{ padding: "30px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", color: "var(--text-secondary)" }}>
          <RefreshCw size={24} className="pulse" style={{ animation: "spin 2s linear infinite" }} />
          <span style={{ fontSize: "12px" }}>Crunching technical oscillators...</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Signal Indicator Banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: signal.direction === "UP" ? "rgba(0, 230, 118, 0.05)" : "rgba(255, 61, 0, 0.05)",
              border: signal.direction === "UP" ? "1px solid rgba(0, 230, 118, 0.2)" : "1px solid rgba(255, 61, 0, 0.2)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {signal.direction === "UP" ? (
                <div style={{ padding: "6px", borderRadius: "6px", backgroundColor: "var(--color-bullish)", color: "#000" }}>
                  <TrendingUp size={16} />
                </div>
              ) : (
                <div style={{ padding: "6px", borderRadius: "6px", backgroundColor: "var(--color-bearish)", color: "#fff" }}>
                  <TrendingDown size={16} />
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Active AI Recommendation</span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: signal.direction === "UP" ? "var(--color-bullish)" : "var(--color-bearish)"
                  }}
                >
                  PREDICT {signal.direction}
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "20px", fontWeight: "800", color: "#f8fafc" }}>
                {signal.confidence}%
              </span>
              <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>Confidence Score</div>
            </div>
          </div>

          {/* Sentiment Meter (Visual Gauge) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
              <span style={{ color: "var(--color-bullish)" }}>Bullish ({signal.sentiment}%)</span>
              <span style={{ color: "var(--color-bearish)" }}>Bearish ({100 - signal.sentiment}%)</span>
            </div>
            {/* The bar track */}
            <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "3px", overflow: "hidden", display: "flex" }}>
              <div style={{ width: `${signal.sentiment}%`, height: "100%", backgroundColor: "var(--color-bullish)", transition: "width 0.4s ease" }} />
              <div style={{ width: `${100 - signal.sentiment}%`, height: "100%", backgroundColor: "var(--color-bearish)", transition: "width 0.4s ease" }} />
            </div>
          </div>

          {/* Logic Explanation */}
          <div style={{ padding: "10px", borderRadius: "6px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.03)" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px", fontWeight: "600" }}>Technical Breakdown</span>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              {signal.reason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
