import React, { useState } from 'react';
import { ArrowUp, ArrowDown, DollarSign, Clock, ShieldAlert, Award, TrendingUp, RefreshCw, Zap } from 'lucide-react';

export default function TradeExecutionPanel({
  tradingState,
  currentPrice,
  stock,
  onPlaceManualTrade,
  onSetStake,
  onResetDemo,
}) {
  const { balance, stake, activeTrades, history, metrics } = tradingState;
  const [customStake, setCustomStake] = useState(stake.toString());

  const handleStakeChange = (value) => {
    setCustomStake(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      onSetStake(num);
    }
  };

  const selectQuickStake = (val) => {
    setCustomStake(val.toString());
    onSetStake(val);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4">
      {/* Account Performance Overview */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Olymp Trade Demo Desk</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400">
                Demo Account
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              $1,000 Starting Bankroll • 85% Fixed Payout
            </p>
          </div>
        </div>

        {/* Win Rate Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-medium">Session Win Rate</div>
            <div className={`font-mono text-base font-extrabold ${
              metrics.winRate >= 80 ? 'text-emerald-400' : metrics.winRate >= 60 ? 'text-cyan-400' : 'text-slate-300'
            }`}>
              {metrics.totalTrades > 0 ? `${metrics.winRate}%` : '0.0%'}
            </div>
          </div>
          <div className="text-right pl-3 border-l border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium">Net P&L</div>
            <div className={`font-mono text-base font-extrabold ${
              metrics.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {metrics.netPnL >= 0 ? `+$${metrics.netPnL}` : `-$${Math.abs(metrics.netPnL)}`}
            </div>
          </div>
        </div>
      </div>

      {/* Trade Configuration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        {/* Stake Amount */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Trade Stake (USD)</span>
            <span className="text-[11px] text-slate-400">2.5% safe bankroll rule</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2 text-slate-500 font-mono">$</span>
              <input
                type="number"
                min="1"
                max={balance}
                value={customStake}
                onChange={(e) => handleStakeChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-3 py-1.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
            {/* Quick Stake presets */}
            <div className="flex items-center gap-1">
              {[10, 25, 50, 100].map(val => (
                <button
                  key={val}
                  onClick={() => selectQuickStake(val)}
                  className={`text-[11px] px-2 py-1.5 rounded-lg border font-mono transition ${
                    stake === val
                      ? 'bg-cyan-950 border-cyan-600 text-cyan-300 font-bold'
                      : 'bg-slate-850 border-slate-700/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Expiration Timeframe Lock */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Execution Expiry</span>
            <span className="text-[11px] text-cyan-400 font-mono">OlympTrade FTT</span>
          </div>
          <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-sm font-bold text-slate-200">
                00h05min00sec
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              Locked
            </span>
          </div>
        </div>
      </div>

      {/* Manual Execution Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* CALL Button */}
        <button
          onClick={() => onPlaceManualTrade('CALL')}
          className="group relative flex flex-col items-center justify-center p-3.5 rounded-xl bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.98] transition shadow-lg shadow-emerald-900/30 border border-emerald-500/40 text-slate-950 font-black cursor-pointer"
        >
          <div className="flex items-center gap-2 text-white">
            <ArrowUp className="w-5 h-5 stroke-[3]" />
            <span className="text-base tracking-wide font-black">CALL (HIGHER)</span>
          </div>
          <div className="text-[11px] text-emerald-100 font-medium mt-0.5">
            Payout +${(stake * 0.85).toFixed(2)} (85%)
          </div>
        </button>

        {/* PUT Button */}
        <button
          onClick={() => onPlaceManualTrade('PUT')}
          className="group relative flex flex-col items-center justify-center p-3.5 rounded-xl bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-[0.98] transition shadow-lg shadow-rose-900/30 border border-rose-500/40 text-slate-950 font-black cursor-pointer"
        >
          <div className="flex items-center gap-2 text-white">
            <ArrowDown className="w-5 h-5 stroke-[3]" />
            <span className="text-base tracking-wide font-black">PUT (LOWER)</span>
          </div>
          <div className="text-[11px] text-rose-100 font-medium mt-0.5">
            Payout +${(stake * 0.85).toFixed(2)} (85%)
          </div>
        </button>
      </div>

      {/* Active Trades (Live Countdown Table) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
          <div className="flex items-center gap-1.5">
            <span>Active 5-Minute Positions</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
              {activeTrades.length}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Auto-settles at 00:00</span>
        </div>

        {activeTrades.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
            No active 5-minute trades. Awaiting AI high-confluence signal or manual entry.
          </div>
        ) : (
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {activeTrades.map((t) => (
              <div
                key={t.id}
                className={`p-3 rounded-xl border transition-all ${
                  t.isITM
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : 'bg-rose-950/30 border-rose-500/40'
                } flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    t.direction === 'CALL' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {t.direction}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <span>{t.symbol}</span>
                      <span className="text-slate-400 font-mono font-normal">
                        Strike: ${t.strikePrice.toFixed(stock.decimals)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Stake: ${t.stake}</span>
                      <span>•</span>
                      <span className={t.isITM ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                        {t.isITM ? 'IN THE MONEY (ITM)' : 'OUT OF MONEY (OTM)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Countdown Timer & PnL */}
                <div className="text-right">
                  <div className="flex items-center gap-1 font-mono text-sm font-black text-cyan-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    <span>
                      {Math.floor(t.remainingSeconds / 60).toString().padStart(2, '0')}:
                      {(t.remainingSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Return: <span className="font-mono text-emerald-400">+${t.potentialProfit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trade History Preview */}
      <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
          <span>Recent Trade Log ({history.length})</span>
          <span className="text-[10px] text-slate-400 font-mono">
            Wins: {metrics.wins} | Losses: {metrics.losses}
          </span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-2 text-xs text-slate-400">
            History will appear as 5-minute trades complete.
          </div>
        ) : (
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {history.slice(0, 5).map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    h.status === 'WIN'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : h.status === 'LOSS'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {h.status}
                  </span>
                  <span className="font-semibold text-slate-200">{h.symbol}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{h.direction}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-slate-400">
                    ${h.strikePrice.toFixed(stock.decimals)} → ${h.currentPrice.toFixed(stock.decimals)}
                  </span>
                  <span className={`font-mono font-bold ${h.pnl > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {h.pnl > 0 ? `+$${h.pnl}` : `-$${Math.abs(h.pnl)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
