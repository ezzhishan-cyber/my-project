import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Zap, Crosshair, Eye, EyeOff, Lock, Unlock, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { StrategyEngine } from '../services/strategyEngine';

export default function LiveChart({
  candles,
  currentPrice,
  stock,
  remainingSeconds,
  activeTrades,
  isPaused,
  onTogglePause,
  onInjectVolatility,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [showBB, setShowBB] = useState(true);
  const [showEMA, setShowEMA] = useState(true);
  const [hoverData, setHoverData] = useState(null);
  const [inspectedCandle, setInspectedCandle] = useState(null);
  const [chartLocked, setChartLocked] = useState(true);

  // Redraw canvas whenever candles, price, or indicators update
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI display
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    if (!candles || candles.length < 5) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Streaming 5-minute candlesticks...', width / 2, height / 2);
      return;
    }

    const paddingBottom = 28;
    const paddingRight = 65;
    const paddingTop = 20;
    const chartHeight = height - paddingBottom - paddingTop;
    const chartWidth = width - paddingRight;

    // Take the last 35-40 candles for optimal 5m visual spacing
    const visibleCount = Math.min(candles.length, 36);
    const visibleCandles = candles.slice(-visibleCount);

    // Calculate High/Low across visible candles & indicators
    const closes = candles.map(c => c.close);
    const bb = StrategyEngine.calculateBollingerBands(closes, 20, 2.0);
    const ema9 = StrategyEngine.calculateEMA(closes, 9);
    const ema21 = StrategyEngine.calculateEMA(closes, 21);
    const ema50 = StrategyEngine.calculateEMA(closes, 50);

    let minPrice = Math.min(...visibleCandles.map(c => c.low));
    let maxPrice = Math.max(...visibleCandles.map(c => c.high));

    // Factor in visible BB
    if (showBB) {
      const visibleBBUp = bb.upper.slice(-visibleCount).filter(v => v !== null);
      const visibleBBLow = bb.lower.slice(-visibleCount).filter(v => v !== null);
      if (visibleBBUp.length > 0) maxPrice = Math.max(maxPrice, ...visibleBBUp);
      if (visibleBBLow.length > 0) minPrice = Math.min(minPrice, ...visibleBBLow);
    }

    // Factor in active trade strike prices
    activeTrades.forEach(t => {
      minPrice = Math.min(minPrice, t.strikePrice);
      maxPrice = Math.max(maxPrice, t.strikePrice);
    });

    const priceRange = maxPrice - minPrice || 1;
    const priceMargin = priceRange * 0.08;
    const domainMin = minPrice - priceMargin;
    const domainMax = maxPrice + priceMargin;
    const domainRange = domainMax - domainMin;

    const priceToY = (price) => {
      return paddingTop + chartHeight - ((price - domainMin) / domainRange) * chartHeight;
    };

    const candleWidth = chartWidth / visibleCount;
    const barWidth = Math.max(4, candleWidth * 0.65);

    // Grid lines (horizontal price lines)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);

    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const p = domainMin + (domainRange / gridSteps) * i;
      const y = priceToY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Price label on right axis
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(p.toFixed(stock.decimals), chartWidth + 6, y + 3);
    }
    ctx.setLineDash([]); // Reset line dash

    // Draw Bollinger Bands Shading & Lines
    if (showBB) {
      const bbStartIndex = candles.length - visibleCount;

      // Draw Bollinger Band fill
      ctx.fillStyle = 'rgba(6, 182, 212, 0.04)';
      ctx.beginPath();
      for (let i = 0; i < visibleCount; i++) {
        const fullIdx = bbStartIndex + i;
        const up = bb.upper[fullIdx];
        if (up !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = priceToY(up);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      for (let i = visibleCount - 1; i >= 0; i--) {
        const fullIdx = bbStartIndex + i;
        const low = bb.lower[fullIdx];
        if (low !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = priceToY(low);
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();

      // Draw Upper Band
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < visibleCount; i++) {
        const fullIdx = bbStartIndex + i;
        const up = bb.upper[fullIdx];
        if (up !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = priceToY(up);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw Lower Band
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.beginPath();
      for (let i = 0; i < visibleCount; i++) {
        const fullIdx = bbStartIndex + i;
        const low = bb.lower[fullIdx];
        if (low !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = priceToY(low);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw Middle SMA
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      for (let i = 0; i < visibleCount; i++) {
        const fullIdx = bbStartIndex + i;
        const mid = bb.middle[fullIdx];
        if (mid !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = priceToY(mid);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw EMA Lines
    if (showEMA) {
      const emaStartIndex = candles.length - visibleCount;

      // EMA 9 (Cyan)
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < visibleCount; i++) {
        const val = ema9[emaStartIndex + i];
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = priceToY(val);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // EMA 21 (Amber)
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < visibleCount; i++) {
        const val = ema21[emaStartIndex + i];
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = priceToY(val);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // EMA 50 (Purple)
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i < visibleCount; i++) {
        const val = ema50[emaStartIndex + i];
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = priceToY(val);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Draw 5-Minute Candlesticks
    visibleCandles.forEach((candle, i) => {
      const isGreen = candle.close >= candle.open;
      const isLastCandle = i === visibleCandles.length - 1;
      const color = isGreen ? '#10b981' : '#ef4444';
      const xCenter = i * candleWidth + candleWidth / 2;

      const yOpen = priceToY(candle.open);
      const yClose = priceToY(candle.close);
      const yHigh = priceToY(candle.high);
      const yLow = priceToY(candle.low);

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(xCenter, yHigh);
      ctx.lineTo(xCenter, yLow);
      ctx.stroke();

      // Candle body
      const top = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

      ctx.fillStyle = color;
      ctx.fillRect(xCenter - barWidth / 2, top, barWidth, bodyHeight);

      // Outline on active candle
      if (isLastCandle) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(xCenter - barWidth / 2, top, barWidth, bodyHeight);
      }

      // Time axis labels every 5 candles
      if (i % 6 === 0 || isLastCandle) {
        const date = new Date(candle.time);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        ctx.fillStyle = '#64748b';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(timeStr, xCenter, height - 8);
      }
    });

    // Draw Active Trades Strike Price Lines & Countdown
    activeTrades.forEach(trade => {
      const yStrike = priceToY(trade.strikePrice);
      const isCall = trade.direction === 'CALL';
      const isITM = trade.isITM;

      // Strike line
      ctx.strokeStyle = isITM ? '#10b981' : '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, yStrike);
      ctx.lineTo(chartWidth, yStrike);
      ctx.stroke();
      ctx.setLineDash([]);

      // Badge on chart
      ctx.fillStyle = isITM ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)';
      const badgeText = `${trade.direction} @ $${trade.strikePrice.toFixed(stock.decimals)} (${trade.remainingSeconds}s)`;
      ctx.font = 'bold 10px monospace';
      const textWidth = ctx.measureText(badgeText).width;
      
      ctx.fillRect(chartWidth - textWidth - 14, yStrike - 18, textWidth + 10, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(badgeText, chartWidth - textWidth - 9, yStrike - 6);
    });

    // Draw Current Price Line & Axis Badge
    const curY = priceToY(currentPrice);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.moveTo(0, curY);
    ctx.lineTo(chartWidth, curY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price tag on axis
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(chartWidth, curY - 9, paddingRight, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(currentPrice.toFixed(stock.decimals), chartWidth + 5, curY + 4);

    // Crosshair hover tooltip & candle inspection
    if (hoverData) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(hoverData.x, 0);
      ctx.lineTo(hoverData.x, height - paddingBottom);
      ctx.moveTo(0, hoverData.y);
      ctx.lineTo(chartWidth, hoverData.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Calculate price at crosshair Y
      const hoverPrice = domainMax - ((hoverData.y - paddingTop) / chartHeight) * domainRange;
      if (hoverPrice >= domainMin && hoverPrice <= domainMax) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(chartWidth, hoverData.y - 8, paddingRight, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(hoverPrice.toFixed(stock.decimals), chartWidth + 4, hoverData.y + 4);
      }
    }
  }, [candles, currentPrice, stock, showBB, showEMA, activeTrades, hoverData]);

  // Handle pointer & touch coordinate inspection
  const updateInspectionFromCoords = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas || !candles || candles.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
      setHoverData(null);
      setInspectedCandle(null);
      return;
    }

    setHoverData({ x, y });

    const visibleCount = Math.min(candles.length, 36);
    const visibleCandles = candles.slice(-visibleCount);
    const paddingRight = 65;
    const chartWidth = rect.width - paddingRight;
    const candleWidth = chartWidth / visibleCount;
    const idx = Math.floor(x / candleWidth);

    if (idx >= 0 && idx < visibleCandles.length) {
      setInspectedCandle(visibleCandles[idx]);
    } else {
      setInspectedCandle(null);
    }
  };

  const handleMouseMove = (e) => {
    updateInspectionFromCoords(e.clientX, e.clientY);
  };

  const handleMouseLeave = () => {
    setHoverData(null);
    setInspectedCandle(null);
  };

  // iPhone touch event handlers
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      updateInspectionFromCoords(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches.length > 0) {
      updateInspectionFromCoords(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    // Keep HUD visible for 1.2s on mobile after touch release
    setTimeout(() => {
      setHoverData(null);
      setInspectedCandle(null);
    }, 1200);
  };

  return (
    <div ref={containerRef} className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Chart Toolbar (Responsive for iPhone 11) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3.5 py-2.5 bg-slate-950/70 border-b border-slate-800/80 gap-2">
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-slate-100 text-sm tracking-wide">{stock.symbol}</span>
            <span className="text-xs text-slate-400 hidden xs:inline">({stock.name})</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-[11px] font-mono font-medium">
            <Clock className="w-3 h-3" />
            <span>5M TF</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 text-[11px] font-mono font-medium">
            <Lock className="w-3 h-3" />
            <span className="hidden xs:inline">Locked</span>
          </div>
        </div>

        {/* Indicator Toggles & Simulation Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
          {/* Bollinger Bands Toggle */}
          <button
            onClick={() => setShowBB(!showBB)}
            className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border transition cursor-pointer select-none ${
              showBB
                ? 'bg-cyan-950/80 border-cyan-700/80 text-cyan-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-500'
            }`}
            title="Toggle Bollinger Bands (20, 2)"
          >
            {showBB ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>BB</span>
          </button>

          {/* EMA Overlay Toggle */}
          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border transition cursor-pointer select-none ${
              showEMA
                ? 'bg-amber-950/80 border-amber-700/80 text-amber-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-500'
            }`}
            title="Toggle EMA 9/21/50"
          >
            {showEMA ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>EMA</span>
          </button>

          {/* Volatility Injection Test */}
          <button
            onClick={onInjectVolatility}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:border-amber-500/50 hover:text-amber-300 transition cursor-pointer select-none active:scale-95"
            title="Inject Market Volatility Burst to test ATR filters"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="hidden xs:inline">Vol Test</span>
          </button>

          {/* Pause / Resume Live Ticks */}
          <button
            onClick={onTogglePause}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:text-cyan-300 transition cursor-pointer select-none active:scale-95"
            title={isPaused ? 'Resume live feed' : 'Pause live feed'}
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-slate-400" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Candlestick Canvas (Optimized for iPhone touch) */}
      <div className="relative w-full h-[270px] sm:h-[350px] md:h-[400px] bg-slate-950">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          style={{ touchAction: 'pan-y' }}
          className="w-full h-full cursor-crosshair block select-none"
        />

        {/* Live Candle Countdown Pill Overlay */}
        <div className="absolute top-2.5 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-lg pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] text-slate-400">Next Bar:</span>
          <span className="font-mono text-xs font-bold text-cyan-400">
            {Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:
            {(remainingSeconds % 60).toString().padStart(2, '0')}
          </span>
        </div>

        {/* iPhone Touch Inspection Pill HUD */}
        {inspectedCandle && (
          <div className="absolute top-2.5 right-3 flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/95 border border-cyan-500/50 backdrop-blur-md shadow-xl pointer-events-none text-[10px] font-mono animate-in fade-in duration-150">
            <span className="text-slate-400">
              {new Date(inspectedCandle.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-slate-300">O: ${inspectedCandle.open.toFixed(stock.decimals)}</span>
            <span className="text-slate-300">H: ${inspectedCandle.high.toFixed(stock.decimals)}</span>
            <span className="text-slate-300">L: ${inspectedCandle.low.toFixed(stock.decimals)}</span>
            <span className={inspectedCandle.close >= inspectedCandle.open ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              C: ${inspectedCandle.close.toFixed(stock.decimals)}
            </span>
          </div>
        )}

        {/* Indicator Legend Overlay */}
        <div className="absolute bottom-8 left-3 flex flex-wrap items-center gap-2 text-[9px] text-slate-400 bg-slate-900/85 px-2 py-0.5 rounded-lg border border-slate-800/80 backdrop-blur-sm pointer-events-none">
          <div className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-cyan-400 inline-block" />
            <span>EMA 9</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-amber-400 inline-block" />
            <span>EMA 21</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-purple-400 inline-block" />
            <span>EMA 50</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-cyan-500/70 border-t border-dashed inline-block" />
            <span>BB 2σ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
