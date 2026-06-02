import React from "react";
import { Trophy, TrendingUp } from "lucide-react";

export interface LeaderboardUser {
  rank: number;
  username: string;
  profit: number;
  winRate: number;
  predictionsCount: number;
}

interface LeaderboardProps {
  traders: LeaderboardUser[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ traders }) => {
  return (
    <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#f8fafc", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
        <Trophy size={18} style={{ color: "#ffd700" }} /> Global Hall of Fame
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {traders.length === 0 ? (
          <div style={{ padding: "30px 0", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
            Awaiting session leaderboard synchronization...
          </div>
        ) : (
          traders.map((trader) => {
            const isTop3 = trader.rank <= 3;
            const trophyColor =
              trader.rank === 1
                ? "#ffd700" // Gold
                : trader.rank === 2
                ? "#c0c0c0" // Silver
                : "#cd7f32"; // Bronze

            return (
              <div
                key={trader.username}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  backgroundColor: isTop3 ? "rgba(255, 215, 0, 0.02)" : "rgba(255, 255, 255, 0.01)",
                  border: isTop3
                    ? `1px solid rgba(${trader.rank === 1 ? "255, 215, 0" : "150, 150, 150"}, 0.15)`
                    : "1px solid rgba(255, 255, 255, 0.03)",
                  transition: "var(--transition-fast)"
                }}
              >
                {/* User details & position */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "24px", display: "flex", justifyContent: "center" }}>
                    {isTop3 ? (
                      <Trophy size={16} style={{ color: trophyColor }} />
                    ) : (
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>
                        #{trader.rank}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc" }}>
                      {trader.username}
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      {trader.predictionsCount} predictions • WR: {trader.winRate}%
                    </span>
                  </div>
                </div>

                {/* Profit metric */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                  <span
                    className="crypto-font animate-glow"
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "var(--color-bullish)",
                      display: "flex",
                      alignItems: "center",
                      gap: "2px"
                    }}
                  >
                    <TrendingUp size={12} /> +${trader.profit.toLocaleString()}
                  </span>
                  <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>Net Profit</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
