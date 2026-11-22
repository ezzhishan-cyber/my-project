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
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Market Selector */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Activity className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                  OlympTrade AI Agent
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  Demo 5M
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Timeframe:</span>
                <span className="font-mono text-cyan-300 font-semibold bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700">
                  00h05min00sec
                </span>
              </div>
            </div>
          </div>

          {/* Stock Selector Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 hidden sm:inline">Stock:</label>
            <select
              value={selectedStock.symbol}
              onChange={(e) => onSelectStock(e.target.value)}
              className="bg-slate-800/90 border border-slate-700 hover:border-cyan-500/60 text-slate-200 text-sm font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition cursor-pointer"
            >
              {STOCKS.map((s) => (
                <option key={s.symbol} value={s.symbol} className="bg-slate-900 text-slate-200">
                  {s.symbol} - {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Demo Account Balance & Live Status */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-center overflow-x-auto py-1">
          {/* Demo Capital Card */}
          <div className="flex items-center gap-2.5 bg-slate-800/70 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-inner">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Demo Bankroll
              </div>
              <div className="font-mono text-base font-extrabold text-emerald-400">
                ${demoMetrics.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <button
              onClick={onResetDemo}
              title="Reset Demo to $1,000.00"
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 p-1.5 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5-Minute Candle Bar Countdown */}
          <div className="hidden lg:flex flex-col items-center bg-slate-800/50 border border-slate-700/60 px-3 py-1 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Next 5M Bar</span>
            <span className="font-mono text-xs font-bold text-cyan-400">
              {countdownText}
            </span>
          </div>

          {/* Autonomous Bot Toggle */}
          <button
            onClick={onToggleAutoBot}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium text-xs border transition-all ${
              autoBotActive
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className={`w-4 h-4 ${autoBotActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span>AI Bot: {autoBotActive ? 'AUTONOMOUS' : 'ASSIST ONLY'}</span>
          </button>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Backtest Button */}
          <button
            onClick={onOpenBacktestModal}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 hover:bg-indigo-900/50 transition"
            title="Run 5-Minute Backtest"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Backtest</span>
          </button>

          {/* Olymp Trade WebSocket Bridge Modal */}
          <button
            onClick={onOpenBridgeModal}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 hover:bg-cyan-900/50 transition"
            title="Olymp Trade WebSocket Connection"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">OlympTrade Bridge</span>
          </button>

          {/* Strategy & Skills Knowledge Base */}
          <button
            onClick={onOpenKnowledgeBase}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
            title="90% Win-Rate Strategy & Financial Skills"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Quant Skills</span>
          </button>
        </div>
      </div>
    </header>
  );
}
