import React, { useEffect, useRef } from "react";

export interface Candlestick {
  time: number; // timestamp in seconds
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

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  candles,
  currentPrice,
  symbol,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Redraw the chart when candles or currentPrice changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high-DPI resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.fillStyle = "#0d1127";
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    const gridCols = 8;
    const gridRows = 5;
    for (let i = 1; i < gridCols; i++) {
      const x = (width / gridCols) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let i = 1; i < gridRows; i++) {
      const y = (height / gridRows) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (candles.length === 0) {
      // Draw loading text
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px Outfit";
      ctx.textAlign = "center";
      ctx.fillText("Waiting for live WebSocket market stream...", width / 2, height / 2);
      return;
    }

    // Determine min/max values for scaling
    let maxVal = Math.max(...candles.map((c) => c.high), currentPrice);
    let minVal = Math.min(...candles.map((c) => c.low), currentPrice);
    
    // Add 10% padding on top and bottom
    const spread = maxVal - minVal;
    maxVal += spread * 0.1 || currentPrice * 0.001;
    minVal -= spread * 0.1 || currentPrice * 0.001;

    const scaleY = (val: number) => {
      return height - ((val - minVal) / (maxVal - minVal)) * height;
    };

    const candleWidth = Math.max(3, (width - 60) / Math.max(20, candles.length));
    const gap = 3;

    // Draw Candlesticks
    candles.forEach((candle, index) => {
      const x = index * (candleWidth + gap) + 15;
      const yOpen = scaleY(candle.open);
      const yClose = scaleY(candle.close);
      const yHigh = scaleY(candle.high);
      const yLow = scaleY(candle.low);
      const isBull = candle.close >= candle.open;

      // Candle color
      const color = isBull ? "#00e676" : "#ff3d00";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.5;

      // Draw wick
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, yHigh);
      ctx.lineTo(x + candleWidth / 2, yLow);
      ctx.stroke();

      // Draw body
      ctx.beginPath();
      const bodyHeight = Math.max(1.5, Math.abs(yClose - yOpen));
      ctx.rect(x, Math.min(yOpen, yClose), candleWidth, bodyHeight);
      ctx.fill();
    });

    // Draw Moving Average Overlay (e.g. 5-period SMA)
    if (candles.length >= 5) {
      ctx.strokeStyle = "#9d4edd";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 4; i < candles.length; i++) {
        let sum = 0;
        for (let j = 0; j < 5; j++) {
          sum += candles[i - j].close;
        }
        const avg = sum / 5;
        const x = i * (candleWidth + gap) + 15 + candleWidth / 2;
        const y = scaleY(avg);
        if (i === 4) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Draw Current Live Price line
    const currentY = scaleY(currentPrice);
    ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(width - 70, currentY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Draw Live Price Label on Y-axis
    ctx.fillStyle = "#00f2fe";
    ctx.fillRect(width - 70, currentY - 10, 65, 20);
    ctx.fillStyle = "#070913";
    ctx.font = "bold 10px JetBrains Mono";
    ctx.textAlign = "center";
    ctx.fillText(currentPrice.toFixed(symbol.includes("USD") ? 5 : 2), width - 37, currentY + 4);

    // Draw Price Scaling indicators on the far right
    ctx.fillStyle = "#64748b";
    ctx.font = "10px JetBrains Mono";
    ctx.textAlign = "right";
    ctx.fillText(maxVal.toFixed(symbol.includes("USD") ? 5 : 2), width - 75, 15);
    ctx.fillText(minVal.toFixed(symbol.includes("USD") ? 5 : 2), width - 75, height - 10);
  }, [candles, currentPrice, symbol]);

  // Handle container resizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    window.addEventListener("resize", handleResize);
    // Initial size
    setTimeout(handleResize, 100);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "360px",
        position: "relative",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            color: "#f8fafc",
            fontWeight: "700",
            fontSize: "16px",
            letterSpacing: "0.5px",
          }}
        >
          {symbol}
        </span>
        <span
          style={{
            backgroundColor: "rgba(0, 242, 254, 0.1)",
            color: "#00f2fe",
            fontSize: "11px",
            fontWeight: "600",
            padding: "2px 6px",
            borderRadius: "4px",
            border: "1px solid rgba(0, 242, 254, 0.2)",
          }}
        >
          LIVE WEBSOCKET
        </span>
      </div>
    </div>
  );
};
