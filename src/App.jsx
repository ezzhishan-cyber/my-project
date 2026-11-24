import React, { useState, useEffect } from 'react';
import { TrendingUp, Cpu, ListChecks, Layers, ShieldCheck, Zap } from 'lucide-react';
import Header from './components/Header';
import LiveChart from './components/LiveChart';
import AIAgentPanel from './components/AIAgentPanel';
import TradeExecutionPanel from './components/TradeExecutionPanel';
import TodoApp from './components/TodoApp';
import StrategyKnowledgeBase from './components/StrategyKnowledgeBase';
import OlympTradeBridge from './components/OlympTradeBridge';
import BacktestModal from './components/BacktestModal';

import { marketService, STOCKS } from './services/marketDataService';
import { StrategyEngine } from './services/strategyEngine';
import { tradingEngine } from './services/tradingEngine';
import { todoService } from './services/todoService';

export default function App() {
  // Mobile Tab State (Optimized for iPhone 11)
  const [mobileTab, setMobileTab] = useState('trade'); // 'trade' | 'signals' | 'todo' | 'all'

  // Market Data State
  const [marketState, setMarketState] = useState(marketService.getState());
  // Strategy Analysis State
  const [analysis, setAnalysis] = useState(null);
  // Trading Engine State
  const [tradingState, setTradingState] = useState(tradingEngine.getState());
  // To-Do State
  const [todos, setTodos] = useState(todoService.todos);
  const [aiLogs, setAiLogs] = useState(todoService.aiLogs);

  // Modals
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);
  const [isBacktestModalOpen, setIsBacktestModalOpen] = useState(false);

  // Haptic feedback helper for iPhone
  const triggerHaptic = (ms = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch (e) {
        // Safe fallback
      }
    }
  };

  // Subscribe to Market Data
  useEffect(() => {
    const unsubMarket = marketService.subscribe((state) => {
      setMarketState(state);
      // Update active trades with tick
      tradingEngine.updateWithTick(state.currentPrice);

      // Analyze Confluence with latest candles
      const newAnalysis = StrategyEngine.analyzeConfluence(state.candles, tradingEngine.confluenceThreshold);
      setAnalysis(newAnalysis);

      // Check autonomous bot trade entry
      tradingEngine.evaluateAutoTrade(
        newAnalysis,
        state.currentPrice,
        state.stock.symbol,
        state.currentCandle.time
      );
    });

    const unsubCandleClose = marketService.onCandleClose((candles) => {
      todoService.logAIOperation(
        '5-Minute Bar Close',
        `Closed 5M candle for ${marketService.currentStock.symbol}. Running full 7-pillar confluence matrix.`,
        'info'
      );
    });

    return () => {
      unsubMarket();
      unsubCandleClose();
    };
  }, []);

  // Subscribe to Trading Engine
  useEffect(() => {
    const unsubTrading = tradingEngine.subscribe((state) => {
      setTradingState(state);
    });
    return () => unsubTrading();
  }, []);

  // Subscribe to To-Do Engine & AI Logs
  useEffect(() => {
    const unsubTodos = todoService.subscribe((t) => setTodos([...t]));
    const unsubLogs = todoService.subscribeAILogs((l) => setAiLogs([...l]));
    return () => {
      unsubTodos();
      unsubLogs();
    };
  }, []);

  // Handlers
  const handleSelectStock = (symbol) => {
    marketService.selectStock(symbol);
    todoService.logAIOperation(
      'Stock Switch',
      `Locked live 5-minute chart to ${symbol}. Resetting candle buffer.`,
      'info'
    );
  };

  const handleTogglePause = () => {
    const paused = marketService.togglePause();
    todoService.logAIOperation(
      'Market Feed',
      paused ? 'Tick feed paused by operator' : 'Tick feed resumed',
      'warning'
    );
  };

  const handleInjectVolatility = () => {
    marketService.injectVolatilityBurst();
    todoService.logAIOperation(
      'Volatility Burst Injected',
      'Simulating sudden high-impact ATR market spike to test AI volatility filter.',
      'warning'
    );
  };

  const handleResetDemo = () => {
    tradingEngine.resetDemoAccount();
    todoService.logAIOperation(
      'Demo Reset',
      'Demo account balance reset to starting $1,000.00 bankroll.',
      'info'
    );
  };

  const handleToggleAutoBot = () => {
    const active = tradingEngine.toggleAutoBot();
    todoService.logAIOperation(
      'AI Bot Mode',
      active
        ? `Autonomous Bot ACTIVATED. Executing 5-minute demo trades when Confluence ≥ ${tradingEngine.confluenceThreshold}%.`
        : 'Autonomous Bot set to ASSIST ONLY. Manual authorization required.',
      active ? 'success' : 'warning'
    );
  };

  const handleChangeThreshold = (val) => {
    tradingEngine.setThreshold(val);
    todoService.logAIOperation(
      'Confluence Threshold',
      `Updated selective trigger filter to ≥ ${val}%.`,
      'info'
    );
  };

  const handlePlaceManualTrade = (direction) => {
    triggerHaptic(30);
    const result = tradingEngine.placeTrade(
      direction,
      marketState.currentPrice,
      marketState.stock.symbol,
      analysis?.confluenceScore || 0,
      analysis?.summary || 'Manual execution by operator'
    );

    if (result.success) {
      todoService.logAIOperation(
        `Order Placed: ${direction}`,
        `Executed $${tradingEngine.stake} 5-Minute trade on ${marketState.stock.symbol} @ $${marketState.currentPrice}. Expiry: 00h05min00sec.`,
        'success'
      );
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        selectedStock={marketState.stock}
        onSelectStock={handleSelectStock}
        isPaused={marketState.isPaused}
        onTogglePause={handleTogglePause}
        onInjectVolatility={handleInjectVolatility}
        demoMetrics={tradingState.metrics}
        onResetDemo={handleResetDemo}
        autoBotActive={tradingState.autoBotActive}
        onToggleAutoBot={handleToggleAutoBot}
        onOpenKnowledgeBase={() => setIsKnowledgeBaseOpen(true)}
        onOpenBridgeModal={() => setIsBridgeModalOpen(true)}
        onOpenBacktestModal={() => setIsBacktestModalOpen(true)}
        countdownText={marketState.formattedCountdown}
      />

      {/* Main Trading Floor: Desktop Grid + iPhone Tab Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 space-y-4 pb-24 lg:pb-6">
        {/* Desktop View: Full 2x2 Grid (visible on lg screens) */}
        <div className="hidden lg:grid grid-cols-12 gap-4">
          <div className="col-span-7 xl:col-span-8">
            <LiveChart
              candles={marketState.candles}
              currentPrice={marketState.currentPrice}
              stock={marketState.stock}
              remainingSeconds={marketState.remainingSeconds}
              activeTrades={tradingState.activeTrades}
              isPaused={marketState.isPaused}
              onTogglePause={handleTogglePause}
              onInjectVolatility={handleInjectVolatility}
            />
          </div>

          <div className="col-span-5 xl:col-span-4">
            <AIAgentPanel
              analysis={analysis}
              confluenceThreshold={tradingState.confluenceThreshold}
              onChangeThreshold={handleChangeThreshold}
              autoBotActive={tradingState.autoBotActive}
            />
          </div>

          <div className="col-span-6">
            <TradeExecutionPanel
              tradingState={tradingState}
              currentPrice={marketState.currentPrice}
              stock={marketState.stock}
              onPlaceManualTrade={handlePlaceManualTrade}
              onSetStake={(val) => tradingEngine.setStake(val)}
              onResetDemo={handleResetDemo}
            />
          </div>

          <div className="col-span-6">
            <TodoApp
              todos={todos}
              onToggleTodo={(id) => todoService.toggleTodo(id)}
              onDeleteTodo={(id) => todoService.deleteTodo(id)}
              onAddTodo={(title, cat, prio, desc) => todoService.addTodo(title, cat, prio, desc)}
              onResetRoutine={() => todoService.resetDefaultRoutine()}
              aiLogs={aiLogs}
            />
          </div>
        </div>

        {/* Mobile View: Tab-based interface for iPhone 11 (screens < lg) */}
        <div className="lg:hidden space-y-4">
          {(mobileTab === 'trade' || mobileTab === 'all') && (
            <div className="space-y-4">
              <LiveChart
                candles={marketState.candles}
                currentPrice={marketState.currentPrice}
                stock={marketState.stock}
                remainingSeconds={marketState.remainingSeconds}
                activeTrades={tradingState.activeTrades}
                isPaused={marketState.isPaused}
                onTogglePause={handleTogglePause}
                onInjectVolatility={handleInjectVolatility}
              />
              <TradeExecutionPanel
                tradingState={tradingState}
                currentPrice={marketState.currentPrice}
                stock={marketState.stock}
                onPlaceManualTrade={handlePlaceManualTrade}
                onSetStake={(val) => tradingEngine.setStake(val)}
                onResetDemo={handleResetDemo}
              />
            </div>
          )}

          {(mobileTab === 'signals' || mobileTab === 'all') && (
            <AIAgentPanel
              analysis={analysis}
              confluenceThreshold={tradingState.confluenceThreshold}
              onChangeThreshold={handleChangeThreshold}
              autoBotActive={tradingState.autoBotActive}
            />
          )}

          {(mobileTab === 'todo' || mobileTab === 'all') && (
            <TodoApp
              todos={todos}
              onToggleTodo={(id) => todoService.toggleTodo(id)}
              onDeleteTodo={(id) => todoService.deleteTodo(id)}
              onAddTodo={(title, cat, prio, desc) => todoService.addTodo(title, cat, prio, desc)}
              onResetRoutine={() => todoService.resetDefaultRoutine()}
              aiLogs={aiLogs}
            />
          )}
        </div>
      </main>

      {/* iPhone 11 Bottom Navigation Dock */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/90 px-3 py-1.5 flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl">
        <button
          onClick={() => { triggerHaptic(10); setMobileTab('trade'); }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
            mobileTab === 'trade'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Trade</span>
        </button>

        <button
          onClick={() => { triggerHaptic(10); setMobileTab('signals'); }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer relative ${
            mobileTab === 'signals'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Cpu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">AI Signals</span>
          {analysis && analysis.confluenceScore >= tradingState.confluenceThreshold && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => { triggerHaptic(10); setMobileTab('todo'); }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer relative ${
            mobileTab === 'todo'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <ListChecks className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">To-Do</span>
          <span className="absolute top-0.5 right-1 text-[9px] font-mono px-1 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
            {todos.filter(t => t.completed).length}/{todos.length}
          </span>
        </button>

        <button
          onClick={() => { triggerHaptic(10); setMobileTab('all'); }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
            mobileTab === 'all'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">All Views</span>
        </button>
      </nav>

      {/* Modals */}
      <StrategyKnowledgeBase
        isOpen={isKnowledgeBaseOpen}
        onClose={() => setIsKnowledgeBaseOpen(false)}
      />

      <OlympTradeBridge
        isOpen={isBridgeModalOpen}
        onClose={() => setIsBridgeModalOpen(false)}
      />

      <BacktestModal
        isOpen={isBacktestModalOpen}
        onClose={() => setIsBacktestModalOpen(false)}
        stock={marketState.stock}
      />
    </div>
  );
}
