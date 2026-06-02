import React, { useEffect, useRef, useCallback } from "react";

export interface Candlestick {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  candles: Candlestick[];
  currentPrice: number;
  symbol: string;
}

function getPrecision(symbol: string): number {
  if (symbol.includes("BTC") || symbol.includes("ETH") || symbol.includes("XAU")) return 2;
  if (symbol.includes("JPY")) return 3;
  return 5;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  candles,
  currentPrice,
  symbol,
}) => {
  const canvasRef    = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef       = useRef<number | null>(null);
  // Store latest logical (CSS) size so the draw routine always uses real dimensions
  const sizeRef      = useRef({ w: 0, h: 0 });

  // Keep latest props in a ref so the draw callback never goes stale
  const propsRef = useRef({ candles, currentPrice, symbol });
  useEffect(() => { propsRef.current = { candles, currentPrice, symbol }; });

  /* ─── Core draw ─────────────────────────────────────────────────── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { candles, currentPrice, symbol } = propsRef.current;
    const precision = getPrecision(symbol);
    const W = sizeRef.current.w;
    const H = sizeRef.current.h;
    if (W === 0 || H === 0) return;

    // ── Background ───────────────────────────────────────────────
    ctx.fillStyle = "#080d1e";
    ctx.fillRect(0, 0, W, H);

    // ── Grid ─────────────────────────────────────────────────────
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) {
      const x = (W / 8) * i;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let i = 1; i < 6; i++) {
      const y = (H / 6) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    if (candles.length === 0) {
      ctx.fillStyle = "#64748b";
      ctx.font = "13px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Waiting for live market data…", W / 2, H / 2);
      return;
    }

    // ── Scale ─────────────────────────────────────────────────────
    const PAD_RIGHT = 80;
    const chartW = W - PAD_RIGHT;

    let maxVal = Math.max(...candles.map(c => c.high), currentPrice);
    let minVal = Math.min(...candles.map(c => c.low),  currentPrice);
    const spread = maxVal - minVal || currentPrice * 0.001;
    maxVal += spread * 0.12;
    minVal -= spread * 0.08;

    const scaleY = (v: number) => ((maxVal - v) / (maxVal - minVal)) * H;

    // ── Candles ───────────────────────────────────────────────────
    const n = Math.max(20, candles.length);
    const candleW = Math.max(4, (chartW - 20) / n - 2);
    const gap     = Math.max(1, candleW * 0.25);

    candles.forEach((c, i) => {
      const x = 10 + i * (candleW + gap);
      const yO = scaleY(c.open);
      const yC = scaleY(c.close);
      const yH = scaleY(c.high);
      const yL = scaleY(c.low);
      const bull  = c.close >= c.open;
      const color = bull ? "#00e676" : "#ff3d00";

      ctx.strokeStyle = color;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(x + candleW / 2, yH);
      ctx.lineTo(x + candleW / 2, yL);
      ctx.stroke();

      const bodyTop = Math.min(yO, yC);
      const bodyH   = Math.max(1.5, Math.abs(yC - yO));
      ctx.fillStyle = bull ? "rgba(0,230,118,0.85)" : "rgba(255,61,0,0.85)";
      ctx.fillRect(x, bodyTop, candleW, bodyH);
    });

    // ── 5-period SMA ──────────────────────────────────────────────
    if (candles.length >= 5) {
      ctx.strokeStyle = "rgba(157,78,221,0.7)";
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      for (let i = 4; i < candles.length; i++) {
        const avg = (candles[i].close + candles[i-1].close + candles[i-2].close +
                     candles[i-3].close + candles[i-4].close) / 5;
        const x = 10 + i * (candleW + gap) + candleW / 2;
        const y = scaleY(avg);
        i === 4 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // ── Y-axis labels ─────────────────────────────────────────────
    ctx.fillStyle  = "#475569";
    ctx.font       = "9px JetBrains Mono, monospace";
    ctx.textAlign  = "left";
    for (let i = 0; i <= 5; i++) {
      const val = minVal + ((maxVal - minVal) / 5) * i;
      const y   = scaleY(val);
      ctx.fillText(val.toFixed(precision), chartW + 4, y + 3);
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth   = 1;
      ctx.beginPath(); ctx.moveTo(chartW, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // ── Live price dashed line ─────────────────────────────────────
    const curY = scaleY(currentPrice);
    ctx.strokeStyle = "rgba(0,242,254,0.5)";
    ctx.lineWidth   = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(0, curY); ctx.lineTo(chartW - 2, curY); ctx.stroke();
    ctx.setLineDash([]);

    // Price badge
    const bW = 72, bX = chartW + 4, bY = curY - 10;
    ctx.fillStyle = "#00f2fe";
    ctx.beginPath(); ctx.roundRect(bX, bY, bW, 20, 4); ctx.fill();
    ctx.fillStyle  = "#060c1a";
    ctx.font       = "bold 9px JetBrains Mono, monospace";
    ctx.textAlign  = "center";
    ctx.fillText(currentPrice.toFixed(precision), bX + bW / 2, bY + 13);
  }, []);

  /* ─── Schedule a single RAF draw ─────────────────────────────────── */
  const scheduleDraw = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      draw();
    });
  }, [draw]);

  /* ─── Resize: update canvas buffer WITHOUT touching CSS width ─────── */
  const resizeCanvas = useCallback(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr  = window.devicePixelRatio || 1;
    const rect  = container.getBoundingClientRect();
    const cssW  = Math.floor(rect.width);
    const cssH  = Math.floor(rect.height);
    if (cssW === 0 || cssH === 0) return;

    // Only update the pixel buffer when size actually changed
    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
      // Lock CSS display size FIRST to prevent layout expansion
      canvas.style.width  = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      // Then set the buffer (this clears the canvas but doesn't change CSS size)
      canvas.width  = cssW * dpr;
      canvas.height = cssH * dpr;
      // Re-apply DPR scale after buffer reset
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    }

    sizeRef.current = { w: cssW, h: cssH };
    scheduleDraw();
  }, [scheduleDraw]);

  // Redraw when props change
  useEffect(() => { scheduleDraw(); }, [candles, currentPrice, symbol, scheduleDraw]);

  // ResizeObserver — never re-runs, never causes layout loops
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use a small delay on first mount to ensure layout is ready
    const initial = setTimeout(() => resizeCanvas(), 50);

    const ro = new ResizeObserver(() => resizeCanvas());
    ro.observe(container);

    return () => {
      clearTimeout(initial);
      ro.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [resizeCanvas]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "340px",
        position: "relative",
        borderRadius: "12px",
        overflow: "hidden",          // critical: clip any canvas overflow
        border: "1px solid rgba(255, 255, 255, 0.05)",
        background: "#080d1e",
        flexShrink: 0,
      }}
    >
      {/* canvas has NO width/height attributes in JSX — those are set by resizeCanvas() */}
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          // Do NOT use width/height CSS here — resizeCanvas sets them explicitly
        }}
      />

      {/* Symbol overlay */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          pointerEvents: "none",
        }}
      >
        <span style={{ color: "#f8fafc", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>
          {symbol}
        </span>
        <span
          style={{
            backgroundColor: "rgba(0, 242, 254, 0.1)",
            color: "#00f2fe",
            fontSize: "9px",
            fontWeight: "700",
            padding: "2px 6px",
            borderRadius: "4px",
            border: "1px solid rgba(0, 242, 254, 0.2)",
            letterSpacing: "0.5px",
          }}
        >
          LIVE
        </span>
      </div>
    </div>
  );
};
