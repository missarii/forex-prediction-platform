import React from "react";
import { Users, UserCheck, Flame, Radio } from "lucide-react";

export interface MasterTrader {
  username: string;
  profit: number;
  winRate: number;
  copiers: number;
  hotStreak: number;
}

interface CopyTradingProps {
  traders: MasterTrader[];
  activeCopies: string[]; // list of usernames currently copying
  onToggleCopy: (username: string) => void;
}

export const CopyTrading: React.FC<CopyTradingProps> = ({
  traders,
  activeCopies,
  onToggleCopy,
}) => {
  return (
    <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={18} style={{ color: "var(--color-primary)" }} /> Copy Trading Pool
        </h3>
        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--color-primary)" }}>
          <Radio size={10} className="pulse" /> AUTO-COPY
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {traders.map((trader) => {
          const isCopying = activeCopies.includes(trader.username);
          return (
            <div
              key={trader.username}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.01)",
                border: isCopying ? "1px solid var(--color-primary)" : "1px solid rgba(255, 255, 255, 0.03)",
                transition: "var(--transition-normal)"
              }}
            >
              {/* Profile Details */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc" }}>
                      {trader.username}
                    </span>
                    {trader.hotStreak >= 3 && (
                      <span
                        style={{
                          fontSize: "8px",
                          backgroundColor: "rgba(255, 61, 0, 0.15)",
                          color: "var(--color-bearish)",
                          padding: "1px 4px",
                          borderRadius: "4px",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          gap: "2px"
                        }}
                      >
                        <Flame size={8} fill="var(--color-bearish)" /> {trader.hotStreak} STREAK
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>
                    WR: {trader.winRate}% • Net: +${trader.profit.toLocaleString()}
                  </span>
                  <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "2px" }}>
                    <Users size={10} /> {trader.copiers + (isCopying ? 1 : 0)} active copiers
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onToggleCopy(trader.username)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: isCopying ? "rgba(0, 230, 118, 0.15)" : "var(--color-primary)",
                  color: isCopying ? "var(--color-bullish)" : "#070913",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "var(--transition-fast)"
                }}
              >
                {isCopying ? (
                  <>
                    <UserCheck size={12} /> Copying
                  </>
                ) : (
                  "Copy Trade"
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
