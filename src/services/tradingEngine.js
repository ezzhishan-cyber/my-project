// Trading Engine - Olymp Trade Demo Account Simulator ($1,000 Starting Bankroll & 00h05min00sec Timeframe)
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'olymptrade_demo_account_v1';
export const DEFAULT_INITIAL_BALANCE = 1000.00;
export const DEFAULT_STAKE = 25.00; // 2.5% conservative risk allocation
export const DEFAULT_PAYOUT_RATE = 0.85; // 85% return on winning binary trades
export const TRADE_DURATION_SECONDS = 300; // 00h05min00sec

class TradingEngine {
  constructor() {
    this.loadState();
    this.subscribers = new Set();
    this.autoBotActive = false;
    this.confluenceThreshold = 85; // Target 85-90% confluence
    this.activeTradeTimer = null;
    this.lastProcessedCandleTime = null;
    this.startActiveTradeCountdown();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.balance = parsed.balance !== undefined ? parsed.balance : DEFAULT_INITIAL_BALANCE;
        this.stake = parsed.stake || DEFAULT_STAKE;
        this.history = parsed.history || [];
        this.activeTrades = parsed.activeTrades || [];
        this.autoBotActive = parsed.autoBotActive || false;
        this.confluenceThreshold = parsed.confluenceThreshold || 85;
        return;
      }
    } catch (e) {
      console.warn('Failed to load demo account state from localStorage', e);
    }

    this.balance = DEFAULT_INITIAL_BALANCE;
    this.stake = DEFAULT_STAKE;
    this.history = [];
    this.activeTrades = [];
    this.autoBotActive = false;
    this.confluenceThreshold = 85;
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        balance: this.balance,
        stake: this.stake,
        history: this.history,
        activeTrades: this.activeTrades,
        autoBotActive: this.autoBotActive,
        confluenceThreshold: this.confluenceThreshold,
      }));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }

  resetDemoAccount() {
    this.balance = DEFAULT_INITIAL_BALANCE;
    this.stake = DEFAULT_STAKE;
    this.history = [];
    this.activeTrades = [];
    this.saveState();
    this.notifySubscribers();
  }

  setStake(amount) {
    this.stake = Math.max(1, Math.min(this.balance, Number(amount)));
    this.saveState();
    this.notifySubscribers();
  }

  setThreshold(threshold) {
    this.confluenceThreshold = Number(threshold);
    this.saveState();
    this.notifySubscribers();
  }

  toggleAutoBot() {
    this.autoBotActive = !this.autoBotActive;
    this.saveState();
    this.notifySubscribers();
    return this.autoBotActive;
  }

  // Place a 5-minute fixed-time binary trade
  placeTrade(direction, currentPrice, stockSymbol, confluenceScore = 0, rationale = '') {
    if (this.balance < this.stake) {
      return { success: false, message: 'Insufficient Demo Account balance' };
    }

    if (this.activeTrades.length >= 3) {
      return { success: false, message: 'Maximum 3 concurrent 5-minute trades allowed for risk control' };
    }

    this.balance = Number((this.balance - this.stake).toFixed(2));
    const now = Date.now();
    const trade = {
      id: `trade_${now}_${Math.random().toString(36).substr(2, 5)}`,
      symbol: stockSymbol,
      direction: direction.toUpperCase(), // 'CALL' or 'PUT'
      strikePrice: currentPrice,
      currentPrice: currentPrice,
      stake: this.stake,
      payoutRate: DEFAULT_PAYOUT_RATE,
      potentialProfit: Number((this.stake * DEFAULT_PAYOUT_RATE).toFixed(2)),
      potentialReturn: Number((this.stake * (1 + DEFAULT_PAYOUT_RATE)).toFixed(2)),
      startTime: now,
      expiryTime: now + TRADE_DURATION_SECONDS * 1000,
      durationSeconds: TRADE_DURATION_SECONDS,
      remainingSeconds: TRADE_DURATION_SECONDS,
      confluenceScore,
      rationale,
      status: 'ACTIVE', // 'ACTIVE', 'WIN', 'LOSS', 'TIE'
      isITM: false,
    };

    this.activeTrades.push(trade);
    this.saveState();
    this.notifySubscribers();

    return { success: true, trade };
  }

  // Called on every market price tick to update active trade status
  updateWithTick(currentPrice) {
    let updated = false;
    this.activeTrades.forEach(trade => {
      trade.currentPrice = currentPrice;
      const isCall = trade.direction === 'CALL';
      if (isCall) {
        trade.isITM = currentPrice > trade.strikePrice;
      } else {
        trade.isITM = currentPrice < trade.strikePrice;
      }
      updated = true;
    });

    if (updated) {
      this.notifySubscribers();
    }
  }

  // Active Trade Countdown Timer (ticks every second)
  startActiveTradeCountdown() {
    if (this.activeTradeTimer) clearInterval(this.activeTradeTimer);
    this.activeTradeTimer = setInterval(() => {
      if (this.activeTrades.length === 0) return;

      const now = Date.now();
      const finishedTrades = [];
      const remainingTrades = [];

      this.activeTrades.forEach(trade => {
        const remainingMs = trade.expiryTime - now;
        trade.remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

        if (trade.remainingSeconds <= 0) {
          // Resolve trade
          this.resolveTrade(trade);
          finishedTrades.push(trade);
        } else {
          remainingTrades.push(trade);
        }
      });

      if (finishedTrades.length > 0) {
        this.activeTrades = remainingTrades;
        this.saveState();
        this.notifySubscribers();
      } else {
        this.notifySubscribers();
      }
    }, 1000);
  }

  // Resolve trade upon reaching 00h00min00sec
  resolveTrade(trade) {
    const isCall = trade.direction === 'CALL';
    const won = isCall ? trade.currentPrice > trade.strikePrice : trade.currentPrice < trade.strikePrice;
    const tied = trade.currentPrice === trade.strikePrice;

    if (won) {
      trade.status = 'WIN';
      trade.pnl = trade.potentialProfit;
      this.balance = Number((this.balance + trade.potentialReturn).toFixed(2));
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {}
    } else if (tied) {
      trade.status = 'TIE';
      trade.pnl = 0;
      this.balance = Number((this.balance + trade.stake).toFixed(2));
    } else {
      trade.status = 'LOSS';
      trade.pnl = -trade.stake;
    }

    trade.resolvedAt = Date.now();
    this.history.unshift(trade);
    if (this.history.length > 200) this.history.pop();
  }

  // Autonomous AI Bot Evaluation: Called by strategy engine
  evaluateAutoTrade(analysis, currentPrice, stockSymbol, candleTime) {
    if (!this.autoBotActive) return;
    if (this.activeTrades.length > 0) return; // Wait for active 5m trade to finish

    // Prevent duplicate entries on the same candle
    if (this.lastProcessedCandleTime === candleTime) return;

    if (analysis.confluenceScore >= this.confluenceThreshold) {
      if (analysis.rawBias === 'CALL') {
        this.placeTrade('CALL', currentPrice, stockSymbol, analysis.confluenceScore, analysis.summary);
        this.lastProcessedCandleTime = candleTime;
      } else if (analysis.rawBias === 'PUT') {
        this.placeTrade('PUT', currentPrice, stockSymbol, analysis.confluenceScore, analysis.summary);
        this.lastProcessedCandleTime = candleTime;
      }
    }
  }

  getMetrics() {
    const totalTrades = this.history.length;
    const wins = this.history.filter(t => t.status === 'WIN').length;
    const losses = this.history.filter(t => t.status === 'LOSS').length;
    const ties = this.history.filter(t => t.status === 'TIE').length;
    const winRate = totalTrades > 0 ? (wins / (wins + losses || 1)) * 100 : 0;

    let totalProfit = 0;
    let grossWins = 0;
    let grossLosses = 0;
    let peakBalance = DEFAULT_INITIAL_BALANCE;
    let maxDrawdown = 0;
    let runningBalance = DEFAULT_INITIAL_BALANCE;

    [...this.history].reverse().forEach(t => {
      runningBalance += t.pnl;
      if (runningBalance > peakBalance) peakBalance = runningBalance;
      const dd = ((peakBalance - runningBalance) / peakBalance) * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;

      totalProfit += t.pnl;
      if (t.pnl > 0) grossWins += t.pnl;
      else if (t.pnl < 0) grossLosses += Math.abs(t.pnl);
    });

    const profitFactor = grossLosses > 0 ? Number((grossWins / grossLosses).toFixed(2)) : (grossWins > 0 ? 99.9 : 0);

    return {
      balance: this.balance,
      initialBalance: DEFAULT_INITIAL_BALANCE,
      netPnL: Number((this.balance - DEFAULT_INITIAL_BALANCE).toFixed(2)),
      netPnLPct: Number((((this.balance - DEFAULT_INITIAL_BALANCE) / DEFAULT_INITIAL_BALANCE) * 100).toFixed(2)),
      totalTrades,
      wins,
      losses,
      ties,
      winRate: Number(winRate.toFixed(1)),
      profitFactor,
      maxDrawdown: Number(maxDrawdown.toFixed(1)),
      stake: this.stake,
      autoBotActive: this.autoBotActive,
      confluenceThreshold: this.confluenceThreshold,
    };
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.getState());
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    const state = this.getState();
    this.subscribers.forEach(cb => {
      try {
        cb(state);
      } catch (err) {
        console.error('TradingEngine subscriber error', err);
      }
    });
  }

  getState() {
    return {
      balance: this.balance,
      stake: this.stake,
      autoBotActive: this.autoBotActive,
      confluenceThreshold: this.confluenceThreshold,
      activeTrades: this.activeTrades,
      history: this.history,
      metrics: this.getMetrics(),
    };
  }
}

export const tradingEngine = new TradingEngine();
