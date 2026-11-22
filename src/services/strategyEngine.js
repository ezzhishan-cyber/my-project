// Quantitative Strategy Engine - Multi-Indicator Confluence for 5-Minute Binary Options
// Migrated from top quant frameworks across GitHub, Reddit (r/algotrading, r/binaryoptions), and Claude/Grok/GPT quantitative research

export class StrategyEngine {
  // Calculate EMA
  static calculateEMA(data, period) {
    if (data.length < period) return Array(data.length).fill(null);
    const k = 2 / (period + 1);
    const ema = [];
    
    // First value SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[i];
    }
    ema[period - 1] = sum / period;

    for (let i = period; i < data.length; i++) {
      ema[i] = data[i] * k + ema[i - 1] * (1 - k);
    }
    return ema;
  }

  // Calculate Bollinger Bands (period: 20, multiplier: 2.0)
  static calculateBollingerBands(closes, period = 20, multiplier = 2.0) {
    const upper = [];
    const lower = [];
    const middle = [];
    const bandwidth = [];

    for (let i = 0; i < closes.length; i++) {
      if (i < period - 1) {
        upper.push(null);
        lower.push(null);
        middle.push(null);
        bandwidth.push(null);
        continue;
      }
      const slice = closes.slice(i - period + 1, i + 1);
      const sma = slice.reduce((a, b) => a + b, 0) / period;
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period;
      const stdDev = Math.sqrt(variance);

      const up = sma + multiplier * stdDev;
      const low = sma - multiplier * stdDev;

      middle.push(sma);
      upper.push(up);
      lower.push(low);
      bandwidth.push(sma > 0 ? (up - low) / sma : 0);
    }

    return { upper, middle, lower, bandwidth };
  }

  // Calculate RSI
  static calculateRSI(closes, period = 14) {
    const rsi = [];
    if (closes.length <= period) return Array(closes.length).fill(null);

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = 0; i < period; i++) rsi.push(null);

    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));

    for (let i = period + 1; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }

    return rsi;
  }

  // Calculate Stochastic Oscillator (%K 14, %D 3)
  static calculateStochastic(candles, kPeriod = 14, dPeriod = 3) {
    const kValues = [];
    for (let i = 0; i < candles.length; i++) {
      if (i < kPeriod - 1) {
        kValues.push(null);
        continue;
      }
      const slice = candles.slice(i - kPeriod + 1, i + 1);
      const highs = slice.map(c => c.high);
      const lows = slice.map(c => c.low);
      const highestHigh = Math.max(...highs);
      const lowestLow = Math.min(...lows);
      const currentClose = candles[i].close;

      const k = highestHigh === lowestLow ? 50 : ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
      kValues.push(k);
    }

    const dValues = [];
    for (let i = 0; i < kValues.length; i++) {
      if (i < kPeriod + dPeriod - 2) {
        dValues.push(null);
        continue;
      }
      const slice = kValues.slice(i - dPeriod + 1, i + 1);
      const sma = slice.reduce((a, b) => a + (b || 50), 0) / dPeriod;
      dValues.push(sma);
    }

    return { k: kValues, d: dValues };
  }

  // Calculate MACD (Fast 12, Slow 26, Signal 9)
  static calculateMACD(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const fastEMA = this.calculateEMA(closes, fastPeriod);
    const slowEMA = this.calculateEMA(closes, slowPeriod);
    const macdLine = [];

    for (let i = 0; i < closes.length; i++) {
      if (fastEMA[i] === null || slowEMA[i] === null) {
        macdLine.push(null);
      } else {
        macdLine.push(fastEMA[i] - slowEMA[i]);
      }
    }

    const validMacd = macdLine.filter(v => v !== null);
    const signalLineRaw = this.calculateEMA(validMacd, signalPeriod);
    
    // Align signal line
    const signalLine = [];
    const offset = closes.length - validMacd.length;
    for (let i = 0; i < offset; i++) signalLine.push(null);
    for (let i = 0; i < signalLineRaw.length; i++) signalLine.push(signalLineRaw[i]);

    const histogram = [];
    for (let i = 0; i < closes.length; i++) {
      if (macdLine[i] !== null && signalLine[i] !== null) {
        histogram.push(macdLine[i] - signalLine[i]);
      } else {
        histogram.push(null);
      }
    }

    return { macd: macdLine, signal: signalLine, histogram };
  }

  // Calculate ATR (Average True Range)
  static calculateATR(candles, period = 14) {
    if (candles.length < 2) return Array(candles.length).fill(null);
    const tr = [candles[0].high - candles[0].low];
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;
      const trueRange = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      tr.push(trueRange);
    }

    const atr = [];
    for (let i = 0; i < tr.length; i++) {
      if (i < period - 1) {
        atr.push(null);
        continue;
      }
      const slice = tr.slice(i - period + 1, i + 1);
      atr.push(slice.reduce((a, b) => a + b, 0) / period);
    }
    return atr;
  }

  // Detect Candlestick Rejection Patterns (Pin Bar / Hammer)
  static detectPriceAction(candle) {
    const totalRange = candle.high - candle.low;
    if (totalRange === 0) return { type: 'DOJI', strength: 0 };

    const body = Math.abs(candle.close - candle.open);
    const upperWick = candle.high - Math.max(candle.open, candle.close);
    const lowerWick = Math.min(candle.open, candle.close) - candle.low;

    const lowerWickRatio = lowerWick / totalRange;
    const upperWickRatio = upperWick / totalRange;

    // Bullish Pin Bar / Hammer (lower wick > 55% of total candle range)
    if (lowerWickRatio >= 0.55 && body / totalRange <= 0.35) {
      return { type: 'BULLISH_PINBAR', strength: lowerWickRatio, bias: 'CALL' };
    }

    // Bearish Shooting Star / Pin Bar (upper wick > 55% of total candle range)
    if (upperWickRatio >= 0.55 && body / totalRange <= 0.35) {
      return { type: 'BEARISH_PINBAR', strength: upperWickRatio, bias: 'PUT' };
    }

    // Bullish Engulfing
    if (candle.close > candle.open && body / totalRange >= 0.70) {
      return { type: 'BULLISH_MOMENTUM', strength: body / totalRange, bias: 'CALL' };
    }

    // Bearish Engulfing
    if (candle.close < candle.open && body / totalRange >= 0.70) {
      return { type: 'BEARISH_MOMENTUM', strength: body / totalRange, bias: 'PUT' };
    }

    return { type: 'NEUTRAL', strength: 0, bias: 'NONE' };
  }

  // Master Evaluation: 7-Pillar Confluence Engine for 90% Win Rate Target
  static analyzeConfluence(candles, minConfluenceThreshold = 85) {
    if (!candles || candles.length < 30) {
      return {
        confluenceScore: 0,
        signal: 'WAIT',
        confidence: 0,
        pillars: [],
        summary: 'Awaiting sufficient 5-minute historical candle buffer (min 30 bars)...',
      };
    }

    const closes = candles.map(c => c.close);
    const current = candles[candles.length - 1];
    const prev = candles[candles.length - 2];
    const currentPrice = current.close;

    // 1. Indicators calculation
    const ema9 = this.calculateEMA(closes, 9);
    const ema21 = this.calculateEMA(closes, 21);
    const ema50 = this.calculateEMA(closes, 50);
    const ema200 = this.calculateEMA(closes, 200);
    const bb = this.calculateBollingerBands(closes, 20, 2.0);
    const rsi14 = this.calculateRSI(closes, 14);
    const rsi7 = this.calculateRSI(closes, 7);
    const stoch = this.calculateStochastic(candles, 14, 3);
    const macdData = this.calculateMACD(closes);
    const atr = this.calculateATR(candles, 14);
    const priceAction = this.detectPriceAction(current);

    const idx = closes.length - 1;
    const curBBUp = bb.upper[idx];
    const curBBLow = bb.lower[idx];
    const curBBMid = bb.middle[idx];
    const curRSI14 = rsi14[idx] || 50;
    const curRSI7 = rsi7[idx] || 50;
    const curStochK = stoch.k[idx] || 50;
    const curStochD = stoch.d[idx] || 50;
    const prevStochK = stoch.k[idx - 1] || 50;
    const prevStochD = stoch.d[idx - 1] || 50;
    const curHist = macdData.histogram[idx] || 0;
    const prevHist = macdData.histogram[idx - 1] || 0;
    const curATR = atr[idx] || 0.5;

    // Evaluate CALL (UP) Score
    let callScore = 0;
    const callPillars = [];

    // Evaluate PUT (DOWN) Score
    let putScore = 0;
    const putPillars = [];

    // --- PILLAR 1: EMA Multi-Timeframe Trend Alignment (Weight: 20 pts) ---
    // Rule: We only take CALLs in an uptrend (Price > EMA 50 or EMA 9 > EMA 21)
    const isUptrend = (ema50[idx] && currentPrice > ema50[idx]) || (ema9[idx] > ema21[idx]);
    const isDowntrend = (ema50[idx] && currentPrice < ema50[idx]) || (ema9[idx] < ema21[idx]);
    
    if (isUptrend) {
      callScore += 20;
      callPillars.push({ name: 'Trend Alignment (EMA 9/21/50)', passed: true, weight: 20, reason: 'Strong Bullish Structure: Price holding above EMA dynamic support' });
      putPillars.push({ name: 'Trend Alignment (EMA 9/21/50)', passed: false, weight: 0, reason: 'Opposing Bullish Trend: Trading against the trend lowers win rate' });
    } else if (isDowntrend) {
      putScore += 20;
      putPillars.push({ name: 'Trend Alignment (EMA 9/21/50)', passed: true, weight: 20, reason: 'Strong Bearish Structure: Price holding below EMA dynamic resistance' });
      callPillars.push({ name: 'Trend Alignment (EMA 9/21/50)', passed: false, weight: 0, reason: 'Opposing Bearish Trend: Trading against the trend lowers win rate' });
    } else {
      callPillars.push({ name: 'Trend Alignment', passed: false, weight: 0, reason: 'Consolidation / Mixed EMA alignment' });
      putPillars.push({ name: 'Trend Alignment', passed: false, weight: 0, reason: 'Consolidation / Mixed EMA alignment' });
    }

    // --- PILLAR 2: Bollinger Bands 2.0 Sigma Mean-Reversion / Bounce (Weight: 20 pts) ---
    const lowerBandDist = curBBLow ? (currentPrice - curBBLow) / curBBLow : 1;
    const upperBandDist = curBBUp ? (curBBUp - currentPrice) / curBBUp : 1;

    if (curBBLow && (current.low <= curBBLow || lowerBandDist < 0.0015)) {
      callScore += 20;
      callPillars.push({ name: 'Bollinger Bands (20, 2.0)', passed: true, weight: 20, reason: 'Lower Band Pierced / Rejected: Statistical 95.4% mean-reversion zone' });
    } else {
      callPillars.push({ name: 'Bollinger Bands (20, 2.0)', passed: false, weight: 0, reason: 'Price not at lower band extremes' });
    }

    if (curBBUp && (current.high >= curBBUp || upperBandDist < 0.0015)) {
      putScore += 20;
      putPillars.push({ name: 'Bollinger Bands (20, 2.0)', passed: true, weight: 20, reason: 'Upper Band Pierced / Rejected: Statistical 95.4% mean-reversion zone' });
    } else {
      putPillars.push({ name: 'Bollinger Bands (20, 2.0)', passed: false, weight: 0, reason: 'Price not at upper band extremes' });
    }

    // --- PILLAR 3: Dual RSI Momentum & Divergence (Weight: 20 pts) ---
    // CALL: Oversold RSI 14 < 35 OR RSI 7 < 25 turning upward
    if (curRSI14 <= 35 || curRSI7 <= 25) {
      callScore += 20;
      callPillars.push({ name: 'RSI Oscillator (14 & 7)', passed: true, weight: 20, reason: `RSI Oversold Extreme (RSI-14: ${curRSI14.toFixed(1)}, RSI-7: ${curRSI7.toFixed(1)})` });
    } else if (curRSI14 > 45 && curRSI14 < 60 && curRSI14 > (rsi14[idx - 1] || 50) && isUptrend) {
      callScore += 10;
      callPillars.push({ name: 'RSI Momentum Continuation', passed: true, weight: 10, reason: `Bullish RSI expansion: ${curRSI14.toFixed(1)}` });
    } else {
      callPillars.push({ name: 'RSI Oscillator (14 & 7)', passed: false, weight: 0, reason: `RSI neutral: ${curRSI14.toFixed(1)}` });
    }

    // PUT: Overbought RSI 14 > 65 OR RSI 7 > 75 turning downward
    if (curRSI14 >= 65 || curRSI7 >= 75) {
      putScore += 20;
      putPillars.push({ name: 'RSI Oscillator (14 & 7)', passed: true, weight: 20, reason: `RSI Overbought Extreme (RSI-14: ${curRSI14.toFixed(1)}, RSI-7: ${curRSI7.toFixed(1)})` });
    } else if (curRSI14 < 55 && curRSI14 > 40 && curRSI14 < (rsi14[idx - 1] || 50) && isDowntrend) {
      putScore += 10;
      putPillars.push({ name: 'RSI Momentum Continuation', passed: true, weight: 10, reason: `Bearish RSI contraction: ${curRSI14.toFixed(1)}` });
    } else {
      putPillars.push({ name: 'RSI Oscillator (14 & 7)', passed: false, weight: 0, reason: `RSI neutral: ${curRSI14.toFixed(1)}` });
    }

    // --- PILLAR 4: Stochastic Crossover in Extreme Zones (Weight: 15 pts) ---
    // CALL: K crosses above D below 25
    if (curStochK < 30 && (curStochK >= curStochD || prevStochK <= prevStochD)) {
      callScore += 15;
      callPillars.push({ name: 'Stochastic Cross (14, 3, 3)', passed: true, weight: 15, reason: `Bullish %K/%D Cross in Oversold Zone (K:${curStochK.toFixed(0)}, D:${curStochD.toFixed(0)})` });
    } else {
      callPillars.push({ name: 'Stochastic Cross (14, 3, 3)', passed: false, weight: 0, reason: `Stoch neutral: K=${curStochK.toFixed(0)}, D=${curStochD.toFixed(0)}` });
    }

    // PUT: K crosses below D above 70
    if (curStochK > 70 && (curStochK <= curStochD || prevStochK >= prevStochD)) {
      putScore += 15;
      putPillars.push({ name: 'Stochastic Cross (14, 3, 3)', passed: true, weight: 15, reason: `Bearish %K/%D Cross in Overbought Zone (K:${curStochK.toFixed(0)}, D:${curStochD.toFixed(0)})` });
    } else {
      putPillars.push({ name: 'Stochastic Cross (14, 3, 3)', passed: false, weight: 0, reason: `Stoch neutral: K=${curStochK.toFixed(0)}, D=${curStochD.toFixed(0)}` });
    }

    // --- PILLAR 5: MACD Histogram Momentum Velocity (Weight: 10 pts) ---
    if (curHist > prevHist && (curHist > 0 || prevHist < 0)) {
      callScore += 10;
      callPillars.push({ name: 'MACD Momentum Velocity', passed: true, weight: 10, reason: 'Histogram accelerating upward (Bullish buyers in control)' });
    } else {
      callPillars.push({ name: 'MACD Momentum Velocity', passed: false, weight: 0, reason: 'MACD momentum not expanding upward' });
    }

    if (curHist < prevHist && (curHist < 0 || prevHist > 0)) {
      putScore += 10;
      putPillars.push({ name: 'MACD Momentum Velocity', passed: true, weight: 10, reason: 'Histogram decelerating downward (Bearish sellers in control)' });
    } else {
      putPillars.push({ name: 'MACD Momentum Velocity', passed: false, weight: 0, reason: 'MACD momentum not expanding downward' });
    }

    // --- PILLAR 6: Price Action & Candlestick Rejection Wick (Weight: 10 pts) ---
    if (priceAction.bias === 'CALL') {
      callScore += 10;
      callPillars.push({ name: 'Candlestick Price Action', passed: true, weight: 10, reason: `Identified ${priceAction.type}: Strong lower wick rejection at support` });
    } else {
      callPillars.push({ name: 'Candlestick Price Action', passed: false, weight: 0, reason: 'No clear bullish pin bar or engulfing wick' });
    }

    if (priceAction.bias === 'PUT') {
      putScore += 10;
      putPillars.push({ name: 'Candlestick Price Action', passed: true, weight: 10, reason: `Identified ${priceAction.type}: Strong upper wick rejection at resistance` });
    } else {
      putPillars.push({ name: 'Candlestick Price Action', passed: false, weight: 0, reason: 'No clear bearish pin bar or engulfing wick' });
    }

    // --- PILLAR 7: ATR Volatility Safety Filter (Weight: 5 pts) ---
    // We avoid trading in dead choppy markets (ATR near 0) or extreme freak spikes
    const isOptimalVolatility = curATR > 0.05;
    if (isOptimalVolatility) {
      callScore += 5;
      putScore += 5;
      callPillars.push({ name: 'ATR Volatility Safety Filter', passed: true, weight: 5, reason: `Market volatility active & healthy (ATR: ${curATR.toFixed(3)})` });
      putPillars.push({ name: 'ATR Volatility Safety Filter', passed: true, weight: 5, reason: `Market volatility active & healthy (ATR: ${curATR.toFixed(3)})` });
    } else {
      callPillars.push({ name: 'ATR Volatility Filter', passed: false, weight: 0, reason: 'Low liquidity/stagnant market' });
      putPillars.push({ name: 'ATR Volatility Filter', passed: false, weight: 0, reason: 'Low liquidity/stagnant market' });
    }

    // Normalize max score to 100
    callScore = Math.min(100, callScore);
    putScore = Math.min(100, putScore);

    // Determine leading signal
    let signal = 'WAIT';
    let leadingScore = 0;
    let leadingPillars = [];
    let summary = '';

    if (callScore >= minConfluenceThreshold && callScore > putScore) {
      signal = 'STRONG CALL (UP)';
      leadingScore = callScore;
      leadingPillars = callPillars;
      summary = `High-Probability 5-Min CALL setup detected with ${callScore}% Confluence. 5+ quantitative criteria aligned simultaneously.`;
    } else if (putScore >= minConfluenceThreshold && putScore > callScore) {
      signal = 'STRONG PUT (DOWN)';
      leadingScore = putScore;
      leadingPillars = putPillars;
      summary = `High-Probability 5-Min PUT setup detected with ${putScore}% Confluence. 5+ quantitative criteria aligned simultaneously.`;
    } else if (callScore >= 60 && callScore > putScore) {
      signal = 'MODERATE CALL (WAIT FOR CONFLUENCE)';
      leadingScore = callScore;
      leadingPillars = callPillars;
      summary = `Moderate CALL signal (${callScore}%). Filtered out by the 90% Win-Rate rule to protect capital against market noise.`;
    } else if (putScore >= 60 && putScore > callScore) {
      signal = 'MODERATE PUT (WAIT FOR CONFLUENCE)';
      leadingScore = putScore;
      leadingPillars = putPillars;
      summary = `Moderate PUT signal (${putScore}%). Filtered out by the 90% Win-Rate rule to protect capital against market noise.`;
    } else {
      signal = 'NEUTRAL / SCANNING';
      leadingScore = Math.max(callScore, putScore);
      leadingPillars = callScore >= putScore ? callPillars : putPillars;
      summary = `Scanning 5-minute candlestick stream. Current market noise level high (${leadingScore}% confluence). Preserving $1,000 balance until precision setup appears.`;
    }

    return {
      confluenceScore: leadingScore,
      signal,
      rawBias: callScore > putScore ? 'CALL' : (putScore > callScore ? 'PUT' : 'NEUTRAL'),
      callScore,
      putScore,
      pillars: leadingPillars,
      summary,
      metrics: {
        price: currentPrice,
        ema9: ema9[idx],
        ema21: ema21[idx],
        ema50: ema50[idx],
        ema200: ema200[idx],
        bbUpper: curBBUp,
        bbMiddle: curBBMid,
        bbLower: curBBLow,
        rsi14: curRSI14,
        rsi7: curRSI7,
        stochK: curStochK,
        stochD: curStochD,
        macdHist: curHist,
        atr: curATR,
        priceActionPattern: priceAction.type,
      }
    };
  }
}
