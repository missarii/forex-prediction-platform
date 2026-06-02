import React from "react";
import { BarChart3, Database, TrendingUp, Percent, Coins, Users } from "lucide-react";

export interface AnalyticsData {
  totalPredictions: number;
  totalVolume: number;
  averageWinRate: number;
  activeUsers24h: number;
  mostTradedSymbol: string;
  volumeBySymbol: { [key: string]: number };
}

interface ClickHouseAnalyticsProps {
  data: AnalyticsData;
}

export const ClickHouseAnalytics: React.FC<ClickHouseAnalyticsProps> = ({ data }) => {
  return (
    <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
          <BarChart3 size={18} style={{ color: "var(--color-primary)" }} /> ClickHouse Deep Analytics
        </h3>
        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "9px", backgroundColor: "rgba(127, 0, 255, 0.15)", color: "var(--color-secondary)", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
          <Database size={10} /> CLICKHOUSE ENGINE
        </span>
      </div>

      {/* Metric Grid */}
      <div className="metric-grid">
        {/* Total Predictions */}
        <div className="metric-card">
          <span className="metric-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Coins size={12} style={{ color: "var(--color-primary)" }} /> Total Bets Placed
          </span>
          <span className="metric-value crypto-font" style={{ fontSize: "16px" }}>
            {data.totalPredictions.toLocaleString()}
          </span>
        </div>

        {/* Total Staked */}
        <div className="metric-card">
          <span className="metric-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <TrendingUp size={12} style={{ color: "var(--color-bullish)" }} /> Platform Volume
          </span>
          <span className="metric-value crypto-font" style={{ fontSize: "16px" }}>
            ${data.totalVolume.toLocaleString()}
          </span>
        </div>

        {/* Avg Win Rate */}
        <div className="metric-card">
          <span className="metric-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Percent size={12} style={{ color: "var(--color-accent)" }} /> Avg Win Rate
          </span>
          <span className="metric-value crypto-font" style={{ fontSize: "16px" }}>
            {data.averageWinRate.toFixed(1)}%
          </span>
        </div>

        {/* Active Traders */}
        <div className="metric-card">
          <span className="metric-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Users size={12} style={{ color: "var(--color-primary)" }} /> Active Traders
          </span>
          <span className="metric-value crypto-font" style={{ fontSize: "16px" }}>
            {data.activeUsers24h.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Asset Volume Distribution */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>Market Volume (ClickHouse logs)</span>
          <span style={{ fontSize: "11px", color: "var(--color-primary)" }}>Most Active: {data.mostTradedSymbol}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {Object.entries(data.volumeBySymbol).map(([symbol, volume]) => {
            // Find max volume to scale bars
            const maxVol = Math.max(...Object.values(data.volumeBySymbol), 1);
            const percentage = (volume / maxVol) * 100;

            return (
              <div key={symbol} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                  <span className="crypto-font" style={{ color: "#f8fafc" }}>{symbol}</span>
                  <span className="crypto-font" style={{ color: "var(--text-secondary)" }}>${volume.toLocaleString()}</span>
                </div>
                {/* Visual Bar */}
                <div style={{ width: "100%", height: "4px", backgroundColor: "rgba(255, 255, 255, 0.03)", borderRadius: "2px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                      borderRadius: "2px",
                      transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
