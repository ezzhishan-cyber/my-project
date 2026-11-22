import React, { useState, useEffect } from 'react';
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

      {/* Main Trading Floor Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-4">
        {/* Top Row: Live Chart (Left/Center) + AI Confluence Engine (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 xl:col-span-8">
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

          <div className="lg:col-span-5 xl:col-span-4">
            <AIAgentPanel
              analysis={analysis}
              confluenceThreshold={tradingState.confluenceThreshold}
              onChangeThreshold={handleChangeThreshold}
              autoBotActive={tradingState.autoBotActive}
            />
          </div>
        </div>

        {/* Bottom Row: Olymp Trade Demo Execution Desk (Left) + To-Do App Engine (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6">
            <TradeExecutionPanel
              tradingState={tradingState}
              currentPrice={marketState.currentPrice}
              stock={marketState.stock}
              onPlaceManualTrade={handlePlaceManualTrade}
              onSetStake={(val) => tradingEngine.setStake(val)}
              onResetDemo={handleResetDemo}
            />
          </div>

          <div className="lg:col-span-6">
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
      </main>

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
