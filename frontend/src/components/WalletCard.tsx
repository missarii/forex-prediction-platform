import React, { useState } from "react";
import { Wallet, ArrowDownRight, ArrowUpRight, Plus, Minus } from "lucide-react";

export interface Transaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAW" | "BET_STAKE" | "BET_PAYOUT";
  amount: number;
  description: string;
  timestamp: string;
}

interface WalletCardProps {
  balance: number;
  transactions: Transaction[];
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  isSubmitting: boolean;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  balance,
  transactions,
  onDeposit,
  onWithdraw,
  isSubmitting,
}) => {
  const [showInput, setShowInput] = useState<boolean>(false);
  const [amountStr, setAmountStr] = useState<string>("500");
  const [mode, setMode] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT");

  const handleSubmit = () => {
    const amt = parseFloat(amountStr);
    if (isNaN(amt) || amt <= 0) return;
    if (mode === "DEPOSIT") {
      onDeposit(amt);
    } else {
      if (amt > balance) {
        alert("Insufficient balance!");
        return;
      }
      onWithdraw(amt);
    }
    setShowInput(false);
  };

  const openInput = (m: "DEPOSIT" | "WITHDRAW") => {
    setMode(m);
    setShowInput(true);
  };

  return (
    <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
          <Wallet size={18} style={{ color: "var(--color-primary)" }} /> Mock Wallet Hub
        </h3>
        <span style={{ fontSize: "11px", backgroundColor: "rgba(0, 230, 118, 0.1)", color: "var(--color-bullish)", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
          SECURE
        </span>
      </div>

      {/* Balance Indicator */}
      <div style={{ padding: "16px", background: "linear-gradient(135deg, rgba(13, 17, 39, 0.8) 0%, rgba(7, 9, 19, 0.9) 100%)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.04)" }}>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Total Net Equity</span>
        <div className="crypto-font" style={{ fontSize: "32px", fontWeight: "800", color: "#f8fafc", marginTop: "4px", letterSpacing: "-0.5px" }}>
          ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Buttons */}
      {!showInput ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <button
            className="btn-neon"
            onClick={() => openInput("DEPOSIT")}
            disabled={isSubmitting}
            style={{ padding: "10px", fontSize: "13px" }}
          >
            <Plus size={16} /> Add Funds
          </button>
          <button
            onClick={() => openInput("WITHDRAW")}
            disabled={isSubmitting}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backgroundColor: "rgba(255,255,255,0.02)",
              color: "#f8fafc",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "var(--transition-fast)"
            }}
          >
            <Minus size={16} /> Cash Out
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-glass)", backgroundColor: "rgba(7,9,19,0.3)" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            Enter {mode === "DEPOSIT" ? "deposit" : "withdrawal"} amount ($)
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="number"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: "#070913",
                color: "#f8fafc",
                fontFamily: "var(--font-mono)",
                fontSize: "14px",
                outline: "none"
              }}
            />
            <button
              onClick={handleSubmit}
              className="btn-neon"
              style={{ padding: "0 16px", fontSize: "13px" }}
            >
              Confirm
            </button>
            <button
              onClick={() => setShowInput(false)}
              style={{
                padding: "0 12px",
                border: "none",
                background: "transparent",
                color: "var(--text-secondary)",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Transaction History Logs */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>Transaction Records</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "160px", overflowY: "auto", paddingRight: "4px" }}>
          {transactions.length === 0 ? (
            <div style={{ padding: "20px 0", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
              No transactions recorded yet.
            </div>
          ) : (
            transactions.map((tx) => {
              const isGain = tx.type === "DEPOSIT" || tx.type === "BET_PAYOUT";
              return (
                <div
                  key={tx.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(255,255,255,0.01)",
                    border: "1px solid rgba(255,255,255,0.03)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {isGain ? (
                      <div style={{ padding: "4px", borderRadius: "50%", backgroundColor: "rgba(0, 230, 118, 0.1)", color: "var(--color-bullish)" }}>
                        <ArrowDownRight size={14} />
                      </div>
                    ) : (
                      <div style={{ padding: "4px", borderRadius: "50%", backgroundColor: "rgba(255, 61, 0, 0.1)", color: "var(--color-bearish)" }}>
                        <ArrowUpRight size={14} />
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#f8fafc" }}>{tx.description}</span>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>{tx.timestamp}</span>
                    </div>
                  </div>
                  <span
                    className="crypto-font"
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: isGain ? "var(--color-bullish)" : "var(--color-bearish)"
                    }}
                  >
                    {isGain ? "+" : "-"}${tx.amount.toLocaleString()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
