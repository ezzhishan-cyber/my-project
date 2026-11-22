// Market Data Service - Live Candlestick & Tick Simulator for 5-Minute Timeframe
// Supports AAPL, TSLA, NVDA, MSFT, AMZN, EUR/USD

export const STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 228.50, volatility: 0.18, decimals: 2 },
  { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 242.80, volatility: 0.35, decimals: 2 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', basePrice: 141.20, volatility: 0.28, decimals: 2 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', basePrice: 422.30, volatility: 0.16, decimals: 2 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', basePrice: 186.40, volatility: 0.22, decimals: 2 },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', basePrice: 1.0855, volatility: 0.08, decimals: 4 },
];

export const TIMEFRAME_SECONDS = 300; // 5 minutes = 300 seconds

class MarketDataService {
  constructor() {
    this.currentStock = STOCKS[0];
    this.candles = [];
    this.currentCandle = null;
    this.currentPrice = this.currentStock.basePrice;
    this.candleRemainingSeconds = TIMEFRAME_SECONDS;
    this.subscribers = new Set();
    this.candleSubscribers = new Set();
    this.tickInterval = null;
    this.timerInterval = null;
    this.isPaused = false;
    this.volatilityMultiplier = 1.0;

    this.initHistoricalCandles(60);
    this.startStreaming();
  }

  // Pre-seed realistic 5-minute historical candles
  initHistoricalCandles(count = 60) {
    this.candles = [];
    let price = this.currentStock.basePrice * (1 + (Math.random() - 0.5) * 0.02);
    const now = Date.now();
    const candleDurationMs = TIMEFRAME_SECONDS * 1000;
    const startTime = now - count * candleDurationMs;

    for (let i = 0; i < count; i++) {
      const candleTime = startTime + i * candleDurationMs;
      const open = price;
      // random walk with mean reversion
      const trend = Math.sin(i / 8) * 0.0015;
      const changePct = (Math.random() - 0.495 + trend) * 0.003 * this.currentStock.volatility;
      const close = Math.max(0.01, open * (1 + changePct));
      const highWick = Math.random() * 0.002 * open;
      const lowWick = Math.random() * 0.002 * open;
      const high = Math.max(open, close) + highWick;
      const low = Math.min(open, close) - lowWick;
      const volume = Math.floor(10000 + Math.random() * 40000);

      this.candles.push({
        time: candleTime,
        open: Number(open.toFixed(this.currentStock.decimals)),
        high: Number(high.toFixed(this.currentStock.decimals)),
        low: Number(low.toFixed(this.currentStock.decimals)),
        close: Number(close.toFixed(this.currentStock.decimals)),
        volume,
      });

      price = close;
    }

    // Start live candle
    const lastClose = this.candles[this.candles.length - 1].close;
    this.currentPrice = lastClose;
    this.currentCandle = {
      time: now,
      open: lastClose,
      high: lastClose,
      low: lastClose,
      close: lastClose,
      volume: 1200,
    };
    this.candleRemainingSeconds = TIMEFRAME_SECONDS;
  }

  selectStock(symbol) {
    const stock = STOCKS.find(s => s.symbol === symbol);
    if (!stock) return;
    this.currentStock = stock;
    this.initHistoricalCandles(60);
    this.notifySubscribers();
  }

  startStreaming() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    if (this.timerInterval) clearInterval(this.timerInterval);

    // Tick update every 500ms
    this.tickInterval = setInterval(() => {
      if (this.isPaused) return;
      this.generateTick();
    }, 500);

    // Candle countdown timer every 1000ms
    this.timerInterval = setInterval(() => {
      if (this.isPaused) return;
      this.candleRemainingSeconds -= 1;
      if (this.candleRemainingSeconds <= 0) {
        this.closeCandleAndStartNew();
      }
      this.notifySubscribers();
    }, 1000);
  }

  generateTick() {
    const vol = (this.currentStock.volatility / 100) * this.volatilityMultiplier;
    const delta = (Math.random() - 0.5) * 2 * vol * this.currentPrice * 0.08;
    this.currentPrice = Number(Math.max(0.01, this.currentPrice + delta).toFixed(this.currentStock.decimals));

    // Update active 5m candle
    this.currentCandle.close = this.currentPrice;
    if (this.currentPrice > this.currentCandle.high) this.currentCandle.high = this.currentPrice;
    if (this.currentPrice < this.currentCandle.low) this.currentCandle.low = this.currentPrice;
    this.currentCandle.volume += Math.floor(Math.random() * 50);

    this.notifySubscribers();
  }

  closeCandleAndStartNew() {
    // Push finished candle to history
    this.candles.push({ ...this.currentCandle });
    if (this.candles.length > 100) {
      this.candles.shift();
    }

    // Notify candle close listeners (AI strategy recalculation trigger)
    this.candleSubscribers.forEach(cb => {
      try {
        cb(this.candles);
      } catch (e) {
        console.error('Candle listener error', e);
      }
    });

    // Start fresh 5-minute candle
    const now = Date.now();
    this.currentCandle = {
      time: now,
      open: this.currentPrice,
      high: this.currentPrice,
      low: this.currentPrice,
      close: this.currentPrice,
      volume: 100,
    };
    this.candleRemainingSeconds = TIMEFRAME_SECONDS;
  }

  injectVolatilityBurst() {
    this.volatilityMultiplier = 3.0;
    setTimeout(() => {
      this.volatilityMultiplier = 1.0;
    }, 15000);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.notifySubscribers();
    return this.isPaused;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.getState());
    return () => this.subscribers.delete(callback);
  }

  onCandleClose(callback) {
    this.candleSubscribers.add(callback);
    return () => this.candleSubscribers.delete(callback);
  }

  notifySubscribers() {
    const state = this.getState();
    this.subscribers.forEach(cb => {
      try {
        cb(state);
      } catch (err) {
        console.error('Tick listener error', err);
      }
    });
  }

  getState() {
    return {
      stock: this.currentStock,
      currentPrice: this.currentPrice,
      candles: [...this.candles, { ...this.currentCandle }],
      currentCandle: this.currentCandle,
      remainingSeconds: this.candleRemainingSeconds,
      formattedCountdown: this.formatTime(this.candleRemainingSeconds),
      isPaused: this.isPaused,
      volatilityMultiplier: this.volatilityMultiplier,
    };
  }

  formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `00h${String(mins).padStart(2, '0')}min${String(secs).padStart(2, '0')}sec`;
  }
}

export const marketService = new MarketDataService();
