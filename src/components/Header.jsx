import React from 'react';
import { Play, Pause, Zap, RotateCcw, Bot, ShieldCheck, Activity, HelpCircle, Terminal, BarChart2 } from 'lucide-react';
import { STOCKS } from '../services/marketDataService';

export default function Header({
  selectedStock,
  onSelectStock,
  isPaused,
  onTogglePause,
  onInjectVolatility,
  demoMetrics,
  onResetDemo,
  autoBotActive,
  onToggleAutoBot,
  onOpenKnowledgeBase,
  onOpenBridgeModal,
  onOpenBacktestModal,
  countdownText,
}) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 py-2.5 sm:py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Row 1 on iPhone: Brand, Stock Selector & Quick Tool Icons */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base lg:text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                  OlympTrade AI
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  5M
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                <span>Expiry:</span>
                <span className="font-mono text-cyan-300 font-semibold bg-slate-800/80 px-1 rounded border border-slate-700 text-[11px]">
                  00h05m00s
                </span>
              </div>
            </div>
          </div>

          {/* Stock Selector & Action Modals (Visible on iPhone) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <select
              value={selectedStock.symbol}
              onChange={(e) => onSelectStock(e.target.value)}
              className="bg-slate-800/95 border border-slate-700 hover:border-cyan-500/60 text-slate-100 text-xs sm:text-sm font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition cursor-pointer"
            >
              {STOCKS.map((s) => (
                <option key={s.symbol} value={s.symbol} className="bg-slate-900 text-slate-200">
                  {s.symbol}
                </option>
              ))}
            </select>

            {/* Quick Modals Icons */}
            <button
              onClick={onOpenBacktestModal}
              className="p-1.5 rounded-lg bg-indigo-950/70 text-indigo-300 border border-indigo-800/60 hover:bg-indigo-900/50 transition cursor-pointer"
              title="5-Minute Backtest"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenBridgeModal}
              className="p-1.5 rounded-lg bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 hover:bg-cyan-900/50 transition cursor-pointer"
              title="OlympTrade WebSocket Bridge"
            >
              <Terminal className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenKnowledgeBase}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition cursor-pointer"
              title="Quant Strategy Skills"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Row 2 on iPhone: Bankroll, Next Bar & Autonomous Bot */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2 sm:gap-3 py-0.5">
          {/* Demo Capital Card */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-inner">
            <div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                Demo Balance
              </div>
              <div className="font-mono text-sm sm:text-base font-extrabold text-emerald-400">
                ${demoMetrics.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <button
              onClick={onResetDemo}
              title="Reset Demo to $1,000.00"
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 p-1 rounded-lg transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5-Minute Candle Bar Countdown */}
          <div className="flex flex-col items-center bg-slate-800/60 border border-slate-700/70 px-2 sm:px-3 py-1 rounded-xl">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider">Next 5M</span>
            <span className="font-mono text-xs font-bold text-cyan-400">
              {countdownText}
            </span>
          </div>

          {/* Autonomous Bot Toggle */}
          <button
            onClick={onToggleAutoBot}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-medium text-xs border transition-all cursor-pointer ${
              autoBotActive
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-500/10'
                : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className={`w-3.5 h-3.5 ${autoBotActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-[11px] font-bold">{autoBotActive ? 'AUTO BOT ON' : 'ASSIST ONLY'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
