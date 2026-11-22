# OlympTrade 5-Minute AI Trading Bot Suite

Headless Python agent for automated fixed-time trading on Olymp Trade Demo accounts, utilizing a 7-Pillar Confluence Architecture targeting 85-90% precision.

---

## Key Features

- **Demo Account Enforcement**: Orders are strictly routed to `group: "demo"` to ensure real funds cannot be risked.
- **Fixed Expiration Timeframe**: Locked to `00h05min00sec` (300 seconds), eliminating sub-minute market noise.
- **7-Pillar Quantitative Confluence Engine**:
  1. EMA 9 / 21 / 50 Trend Alignment
  2. Bollinger Bands 2.0 Sigma Outer Boundary Reversion
  3. Dual RSI (14 & 7) Overbought/Oversold Extremes
  4. Stochastic %K/%D Cross in Extreme Zones
  5. MACD Momentum Acceleration
  6. Candlestick Price Action (Hammer / Pin Bar Rejection Wicks > 55%)
  7. ATR Volatility Filter (Rejection of dead chop and chaotic news spikes)
- **Starting Bankroll**: Configured for $1,000.00 initial capital with fixed fractional risk ($25 = 2.5% safe stake).

---

## Installation

```bash
pip install -r requirements.txt
```

---

## Usage

### 1. Run Quantitative Backtester
To evaluate strategy performance over 500 5-minute candles:

```bash
python3 backtester.py
```

### 2. Run Autonomous Trading Bot (Demo Mode)
To run the automated agent in local demo sandbox:

```bash
python3 run_agent.py --symbol AAPL --balance 1000 --stake 25 --duration 300 --threshold 85
```

### 3. Connect Directly to Olymp Trade Demo Server
To execute trades directly on your live Olymp Trade Demo account via WebSocket:

1. Log into [Olymp Trade](https://olymptrade.com) in your browser and switch to your **Demo Account**.
2. Open Developer Tools (`F12`), go to the **Network** tab, filter by **WS** (WebSockets).
3. Refresh the page (`Ctrl+R` / `Cmd+R`) and inspect the active WebSocket request to copy your `access_token`.
4. Run:
```bash
python3 run_agent.py --token YOUR_ACCESS_TOKEN --symbol AAPL --duration 300 --group demo
```
