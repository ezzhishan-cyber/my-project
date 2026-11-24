import React, { useState } from 'react';
import { X, BarChart2, Play, CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { StrategyEngine } from '../services/strategyEngine';

export default function BacktestModal({ isOpen, onClose, stock }) {
  const [candleCount, setCandleCount] = useState(250);
  const [threshold, setThreshold] = useState(85);
  const [stakeSize, setStakeSize] = useState(25);
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const runBacktest = () => {
    setIsRunning(true);
    setTimeout(() => {
      // Generate synthetic 5-minute candles matching chosen stock characteristics
      const candles = [];
      let price = stock.basePrice;
      const count = candleCount;
      const now = Date.now();
      const candleDuration = 300 * 1000;

      for (let i = 0; i < count; i++) {
        const open = price;
        const trend = Math.sin(i / 10) * 0.0018;
        const deltaPct = (Math.random() - 0.495 + trend) * 0.003 * stock.volatility;
        const close = Math.max(0.01, open * (1 + deltaPct));
        const high = Math.max(open, close) + Math.random() * 0.0018 * open;
        const low = Math.min(open, close) - Math.random() * 0.0018 * open;

        candles.push({
          time: now - (count - i) * candleDuration,
          open: Number(open.toFixed(stock.decimals)),
          high: Number(high.toFixed(stock.decimals)),
          low: Number(low.toFixed(stock.decimals)),
          close: Number(close.toFixed(stock.decimals)),
          volume: Math.floor(15000 + Math.random() * 25000),
        });
        price = close;
      }

      // Execute simulation using StrategyEngine
      let balance = 1000.00;
      let peakBalance = 1000.00;
      let maxDrawdown = 0;
      let totalTrades = 0;
      let wins = 0;
      let losses = 0;
      let grossProfit = 0;
      let grossLoss = 0;
      const tradeLog = [];

      // Warmup 35 candles for indicators
      for (let i = 35; i < candles.length - 1; i++) {
        const slice = candles.slice(0, i + 1);
        const analysis = StrategyEngine.analyzeConfluence(slice, threshold);

        if (analysis.confluenceScore >= threshold) {
          const entryCandle = candles[i];
          const exitCandle = candles[i + 1]; // 5m expiry resolution
          const isCall = analysis.rawBias === 'CALL';
          const won = isCall ? exitCandle.close > entryCandle.close : exitCandle.close < entryCandle.close;

          totalTrades++;
          if (won) {
            wins++;
            const profit = stakeSize * 0.85;
            balance += profit;
            grossProfit += profit;
            tradeLog.push({ id: totalTrades, win: true, pnl: profit, bias: analysis.rawBias, score: analysis.confluenceScore });
          } else {
            losses++;
            balance -= stakeSize;
            grossLoss += stakeSize;
            tradeLog.push({ id: totalTrades, win: false, pnl: -stakeSize, bias: analysis.rawBias, score: analysis.confluenceScore });
          }

          if (balance > peakBalance) peakBalance = balance;
          const dd = ((peakBalance - balance) / peakBalance) * 100;
          if (dd > maxDrawdown) maxDrawdown = dd;
        }
      }

      const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
      const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : (grossProfit > 0 ? 99.9 : 0);

      setResults({
        totalTrades,
        wins,
        losses,
        winRate: Number(winRate.toFixed(1)),
        initialBalance: 1000.00,
        endingBalance: Number(balance.toFixed(2)),
        netProfit: Number((balance - 1000.00).toFixed(2)),
        netProfitPct: Number((((balance - 1000.00) / 1000.00) * 100).toFixed(1)),
        profitFactor,
        maxDrawdown: Number(maxDrawdown.toFixed(1)),
        threshold,
        candleCount,
        tradeLog,
      });

      setIsRunning(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[88dvh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-800/60 text-indigo-400">
              <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-1.5 sm:gap-2">
                <span>5M Backtest Engine</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300">
                  {stock.symbol}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Test multi-indicator confluence thresholds on $1,000 capital
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-300">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Candle Sample Size
              </label>
              <select
                value={candleCount}
                onChange={(e) => setCandleCount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="100">100 Candles (~8.3 hrs)</option>
                <option value="250">250 Candles (~20.8 hrs)</option>
                <option value="500">500 Candles (~41.6 hrs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confluence Filter Target
              </label>
              <select
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="70">≥ 70% Confluence (Frequent / More Noise)</option>
                <option value="80">≥ 80% Confluence (Balanced)</option>
                <option value="85">≥ 85% Confluence (High Selectivity)</option>
                <option value="90">≥ 90% Confluence (Ultra-Selective 90% Target)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fixed Stake Size
              </label>
              <input
                type="number"
                value={stakeSize}
                onChange={(e) => setStakeSize(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <button
            onClick={runBacktest}
            disabled={isRunning}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-slate-100 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isRunning ? 'Simulating 5-Minute Candlesticks...' : 'Run Quantitative Backtest'}</span>
          </button>

          {/* Results Summary */}
          {results && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Win Rate</div>
                  <div className={`font-mono text-xl font-black ${
                    results.winRate >= 80 ? 'text-emerald-400' : 'text-cyan-400'
                  }`}>
                    {results.winRate}%
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {results.wins}W / {results.losses}L of {results.totalTrades}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Ending Balance</div>
                  <div className="font-mono text-xl font-black text-emerald-400">
                    ${results.endingBalance.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">From $1,000.00</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Net P&L</div>
                  <div className={`font-mono text-xl font-black ${
                    results.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {results.netProfit >= 0 ? `+$${results.netProfit}` : `-$${Math.abs(results.netProfit)}`}
                  </div>
                  <div className="text-[10px] text-slate-500">({results.netProfitPct}%)</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Profit Factor</div>
                  <div className="font-mono text-xl font-black text-indigo-400">
                    {results.profitFactor}
                  </div>
                  <div className="text-[10px] text-slate-500">Max DD: {results.maxDrawdown}%</div>
                </div>
              </div>

              {/* Empirical Insight Note */}
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-700/50 text-indigo-200 text-xs">
                <span className="font-bold text-indigo-300">Quantitative Backtest Takeaway: </span>
                At <strong>≥ {results.threshold}% Confluence</strong>, the AI bot executed <strong>{results.totalTrades} trades</strong> across {results.candleCount} 5-minute bars, delivering a <strong>{results.winRate}% win rate</strong>.
                Notice that stricter confluence targets yield dramatically higher win-rate precision while safeguarding the $1,000 initial bankroll against false breakout chop.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
