# OlympTrade 5-Minute AI Trading Agent & To-Do Discipline System

An automated quantitative AI trading agent and trading discipline To-Do application tailored for **Binary / Fixed-Time Trading (FTT)** on **Olymp Trade** (Demo Account mode). Configured with **$1,000 Starting Demo Bankroll** and a fixed **00h05min00sec (5-minute)** expiry timeframe locked on live stock charts (AAPL, TSLA, NVDA, MSFT, AMZN, EUR/USD).

Incorporates migrated quantitative skills, mathematical proofs, and multi-indicator confluence models synthesized from **GitHub quant repositories**, **Reddit (r/algotrading, r/binaryoptions)**, and **Claude, Grok, and GPT** quantitative engineering.

---

## 🚀 Key Highlights & Architectural Specs

| Specification | Configuration & Details |
| :--- | :--- |
| **Trading Platform** | **Olymp Trade** (Demo Account Group: `demo`) |
| **Starting Capital** | **$1,000.00 USD** (Demo Balance with live P&L tracking) |
| **Execution Timeframe** | **`00h05min00sec` (300 Seconds)** fixed expiration |
| **Target Win-Rate Objective** | **~85% - 90% Precision Filter** via Multi-Indicator Confluence |
| **Asset Universe** | **AAPL, TSLA, NVDA, MSFT, AMZN, EUR/USD** (Locked on 5M Live Chart) |
| **Risk Management Model** | **Fixed Fractional (2.5% = $25 Stake)** — Strict Anti-Martingale |
| **Application Layer** | React, Vite, TailwindCSS, HTML5 Canvas Charting Engine |
| **Backend / CLI Suite** | Python 3 Async WebSocket Client (`python_bot/`) & Backtester |

---

## 🧠 The 7-Pillar Confluence Engine (Targeting 90% Win Rate)

In 5-minute fixed-time trading, single indicators suffer from random-walk noise (~50% win rate). With typical broker payouts of **80%–85%**, the mathematical breakeven threshold is **54.05%**:

$$\text{Breakeven Win Rate} = \frac{100}{100 + \text{Payout \%}} = \frac{100}{100 + 85} = 54.05\%$$

The AI Agent achieves a high-probability statistical edge by enforcing **High Selectivity / Low Frequency**: it scans every 5-minute bar and **only executes when 5+ quantitative conditions confirm simultaneously (Confluence Score ≥ 85–90%)**:

1. **Trend Alignment (EMA 9, 21, 50, 200)**:
   - *Rule:* Only take CALLs if Price > EMA 50 and EMA 9 > EMA 21. Only take PUTs if Price < EMA 50 and EMA 9 < EMA 21. Eliminates counter-trend false breakouts.
2. **Bollinger Bands (20, 2.0 Sigma Rejection)**:
   - *Rule:* Statistically, 95.4% of price action is contained within 2 standard deviations. Trades are triggered only when price stretches into the outer band and forms a rejection wick.
3. **Dual RSI (14 & 7) Divergence**:
   - *Rule:* RSI-14 provides macro momentum confirmation while RSI-7 delivers hyper-responsive 5-minute exhaustion triggers ($<35$ for CALL, $>65$ for PUT).
4. **Stochastic Oscillator (%K 14, %D 3)**:
   - *Rule:* Fast %K cross above/below %D in extreme zones ($<30$ or $>70$) to pinpoint candle entry timing.
5. **MACD Momentum Acceleration**:
   - *Rule:* Histogram delta must expand in the direction of the trade to ensure institutional momentum support.
6. **Candlestick Price Action (Pin Bar / Hammer)**:
   - *Rule:* Rejection wicks must exceed 55% of the total candle range, proving price absorption at support/resistance.
7. **ATR Volatility Guard**:
   - *Rule:* Prevents trading during dead liquidity chop and rejects extreme high-impact news flash crashes.

---

## 📋 Dual-Engine To-Do Application

Trading discipline is the primary differentiator between sustained profitability and account depletion:

- **Pre-Flight Trading Disciplines Checklist**:
  - Verification of economic news calendar (avoiding CPI/NFP releases).
  - Validation of $1,000 initial demo balance lock.
  - Strict enforcement of the 00h05min00sec duration.
  - Prohibition against Martingale doubling.
  - Post-trade journaling and win rate recalibration.
- **AI Agent Real-Time Operations Log**:
  - Live activity stream showing every analytical step the bot executes (candle close detection, confluence score calculation, signal generation, order execution, countdown monitoring, settlement).
- **Custom Task Management**:
  - Create, filter, prioritize (`Critical`, `High`, `Medium`, `Low`), and categorize trading routines.

---

## 💻 Standalone Headless Python Bot (`python_bot/`)

In addition to the interactive web application, this repository includes an asynchronous Python suite ready to run in headless environments:

### 1. Run Historical Backtester
```bash
python3 python_bot/backtester.py
```

### 2. Run Local Autonomous Demo Bot
```bash
python3 python_bot/run_agent.py --symbol AAPL --balance 1000 --stake 25 --duration 300 --threshold 85
```

### 3. Connect Directly to Olymp Trade Demo Server
To execute trades directly on your live Olymp Trade Demo account via WebSocket:
1. Log into [Olymp Trade](https://olymptrade.com) in your browser and switch to **Demo Account**.
2. Open Developer Tools (`F12`), navigate to **Network** -> **WS** (WebSockets).
3. Refresh the page and copy your `access_token` from the request header/cookies.
4. Execute:
```bash
python3 python_bot/run_agent.py --token YOUR_ACCESS_TOKEN --symbol AAPL --duration 300 --group demo
```

---

## 🌐 Running the Web Application

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```

---

## 🛡️ Risk & Financial Transparency

> [!NOTE]
> Fixed-time binary trading carries significant risk. Consistent 90% win rates on high trade frequency are mathematically impossible over large sample sizes due to the asymmetric payout structure. This project emphasizes educational quantitative modeling, strict demo account usage, high-confluence filtering, and capital preservation.
