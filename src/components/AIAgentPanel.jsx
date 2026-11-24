import React from 'react';
import { Cpu, CheckCircle2, XCircle, AlertTriangle, ArrowUpRight, ArrowDownRight, Sliders, Shield, Info } from 'lucide-react';

export default function AIAgentPanel({
  analysis,
  confluenceThreshold,
  onChangeThreshold,
  autoBotActive,
}) {
  const score = analysis?.confluenceScore || 0;
  const signal = analysis?.signal || 'SCANNING';
  const bias = analysis?.rawBias || 'NEUTRAL';
  const pillars = analysis?.pillars || [];
  const metrics = analysis?.metrics || {};

  const isTriggered = score >= confluenceThreshold;

  // Color schemes based on score and bias
  let scoreColor = 'text-slate-400';
  let barGradient = 'from-slate-600 to-slate-400';
  let badgeBorder = 'border-slate-800 bg-slate-900/60';

  if (isTriggered) {
    if (bias === 'CALL') {
      scoreColor = 'text-emerald-400';
      barGradient = 'from-emerald-500 to-teal-400';
      badgeBorder = 'border-emerald-500/50 bg-emerald-950/40 shadow-lg shadow-emerald-500/10';
    } else {
      scoreColor = 'text-rose-400';
      barGradient = 'from-rose-500 to-orange-400';
      badgeBorder = 'border-rose-500/50 bg-rose-950/40 shadow-lg shadow-rose-500/10';
    }
  } else if (score >= 60) {
    scoreColor = 'text-amber-400';
    barGradient = 'from-amber-500 to-yellow-400';
    badgeBorder = 'border-amber-500/30 bg-amber-950/20';
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col gap-3.5 sm:gap-4">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-800/60 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>AI Confluence Engine</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300">
                90% Target
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Aggregated quant skills from GitHub, Reddit, Claude, Grok & GPT
            </p>
          </div>
        </div>

        {/* Confluence Threshold Slider */}
        <div className="flex items-center justify-between sm:justify-start gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <div className="text-[10px] text-slate-400">Trigger:</div>
            <div className="font-mono text-xs font-bold text-cyan-300">
              ≥ {confluenceThreshold}%
            </div>
          </div>
          <input
            type="range"
            min="70"
            max="95"
            step="5"
            value={confluenceThreshold}
            onChange={(e) => onChangeThreshold(Number(e.target.value))}
            className="w-20 accent-cyan-400 cursor-pointer"
            title="Adjust Selective Confluence Filter (70% - 95%)"
          />
        </div>
      </div>

      {/* Main Signal & Confluence Gauge */}
      <div className={`p-4 rounded-xl border transition-all ${badgeBorder} flex flex-col sm:flex-row items-center justify-between gap-4`}>
        {/* Left: Signal Status */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl ${
            bias === 'CALL' && isTriggered
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : bias === 'PUT' && isTriggered
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>
            {bias === 'CALL' && isTriggered ? (
              <ArrowUpRight className="w-7 h-7" />
            ) : bias === 'PUT' && isTriggered ? (
              <ArrowDownRight className="w-7 h-7" />
            ) : (
              <Cpu className="w-6 h-6 animate-pulse" />
            )}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Algorithmic Decision
            </div>
            <div className={`text-base font-extrabold tracking-tight ${scoreColor}`}>
              {signal}
            </div>
            <p className="text-xs text-slate-400 max-w-sm mt-0.5 line-clamp-2">
              {analysis?.summary || 'Evaluating technical indicators...'}
            </p>
          </div>
        </div>

        {/* Right: Big Confluence Percentage */}
        <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
          <div className="text-[11px] text-slate-400 font-medium">Confluence Score</div>
          <div className={`font-mono text-3xl font-black ${scoreColor}`}>
            {score}%
          </div>
          <div className="w-full sm:w-32 bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full bg-gradient-to-r ${barGradient} transition-all duration-500`}
              style={{ width: `${Math.min(100, score)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 7-Pillar Confluence Checklist Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
          <span>7-Pillar Quantitative Confluence Matrix</span>
          <span>Alignment Weight</span>
        </div>

        <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className={`flex items-start justify-between p-2 rounded-lg text-xs border transition ${
                pillar.passed
                  ? 'bg-slate-850/80 border-emerald-900/40 hover:border-emerald-700/60'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-start gap-2">
                {pillar.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={`font-semibold ${pillar.passed ? 'text-slate-200' : 'text-slate-400'}`}>
                    {pillar.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {pillar.reason}
                  </div>
                </div>
              </div>

              <div className="font-mono text-[11px] font-bold text-cyan-400 shrink-0 ml-2">
                +{pillar.weight} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Snapshot Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
          <div className="text-slate-400">RSI (14 / 7)</div>
          <div className="font-mono font-bold text-slate-200">
            {metrics.rsi14 ? `${metrics.rsi14.toFixed(1)} / ${metrics.rsi7 ? metrics.rsi7.toFixed(1) : '-'}` : '--'}
          </div>
        </div>

        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
          <div className="text-slate-400">Stoch %K / %D</div>
          <div className="font-mono font-bold text-slate-200">
            {metrics.stochK ? `${metrics.stochK.toFixed(0)} / ${metrics.stochD.toFixed(0)}` : '--'}
          </div>
        </div>

        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
          <div className="text-slate-400">MACD Histogram</div>
          <div className={`font-mono font-bold ${metrics.macdHist >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {metrics.macdHist !== undefined ? (metrics.macdHist >= 0 ? '+' : '') + metrics.macdHist.toFixed(3) : '--'}
          </div>
        </div>

        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
          <div className="text-slate-400">Price Action</div>
          <div className="font-mono font-bold text-cyan-400 truncate">
            {metrics.priceActionPattern || 'None'}
          </div>
        </div>
      </div>
    </div>
  );
}
