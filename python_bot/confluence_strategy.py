"""
Quantitative Confluence Strategy Engine (Python Implementation)
7-Pillar Multi-Indicator Analysis for 5-Minute Binary Options
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List


class ConfluenceStrategy:
    @staticmethod
    def calculate_indicators(df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculates EMA 9/21/50/200, Bollinger Bands, RSI 14/7, Stochastic, MACD, and ATR
        """
        data = df.copy()

        # EMAs
        data["ema9"] = data["close"].ewm(span=9, adjust=False).mean()
        data["ema21"] = data["close"].ewm(span=21, adjust=False).mean()
        data["ema50"] = data["close"].ewm(span=50, adjust=False).mean()
        data["ema200"] = data["close"].ewm(span=200, adjust=False).mean()

        # Bollinger Bands (20, 2.0)
        data["bb_mid"] = data["close"].rolling(window=20).mean()
        data["bb_std"] = data["close"].rolling(window=20).std()
        data["bb_up"] = data["bb_mid"] + 2.0 * data["bb_std"]
        data["bb_low"] = data["bb_mid"] - 2.0 * data["bb_std"]

        # RSI 14 & 7
        for period in [14, 7]:
            delta = data["close"].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
            rs = gain / (loss.replace(0, np.nan))
            data[f"rsi{period}"] = 100 - (100 / (1 + rs))
            data[f"rsi{period}"] = data[f"rsi{period}"].fillna(50)

        # Stochastic Oscillator (%K 14, %D 3)
        low14 = data["low"].rolling(window=14).min()
        high14 = data["high"].rolling(window=14).max()
        data["stoch_k"] = ((data["close"] - low14) / (high14 - low14).replace(0, np.nan)) * 100
        data["stoch_k"] = data["stoch_k"].fillna(50)
        data["stoch_d"] = data["stoch_k"].rolling(window=3).mean().fillna(50)

        # MACD (12, 26, 9)
        ema12 = data["close"].ewm(span=12, adjust=False).mean()
        ema26 = data["close"].ewm(span=26, adjust=False).mean()
        data["macd"] = ema12 - ema26
        data["macd_signal"] = data["macd"].ewm(span=9, adjust=False).mean()
        data["macd_hist"] = data["macd"] - data["macd_signal"]

        # ATR (14)
        prev_close = data["close"].shift(1)
        tr1 = data["high"] - data["low"]
        tr2 = (data["high"] - prev_close).abs()
        tr3 = (data["low"] - prev_close).abs()
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        data["atr"] = tr.rolling(window=14).mean().fillna(0.5)

        return data

    @classmethod
    def evaluate(cls, df: pd.DataFrame, threshold: int = 85) -> Dict[str, Any]:
        """
        Evaluates the latest 5-minute candle against the 7-Pillar Confluence Matrix
        """
        if len(df) < 30:
            return {"score": 0, "signal": "WAIT", "bias": "NEUTRAL", "pillars": []}

        df_calc = cls.calculate_indicators(df)
        cur = df_calc.iloc[-1]
        prev = df_calc.iloc[-2]

        call_score = 0
        put_score = 0
        call_reasons = []
        put_reasons = []

        # Pillar 1: Trend Alignment (EMA 9/21/50) - 20 pts
        if cur["close"] > cur["ema50"] and cur["ema9"] > cur["ema21"]:
            call_score += 20
            call_reasons.append("Bullish Trend Structure: Price above EMA 50 & 9>21")
        elif cur["close"] < cur["ema50"] and cur["ema9"] < cur["ema21"]:
            put_score += 20
            put_reasons.append("Bearish Trend Structure: Price below EMA 50 & 9<21")

        # Pillar 2: Bollinger Bands 2.0 Sigma Reversal - 20 pts
        if cur["low"] <= cur["bb_low"] or abs(cur["close"] - cur["bb_low"]) / cur["bb_low"] < 0.0015:
            call_score += 20
            call_reasons.append("Lower Bollinger Band Rejection: 95.4% mean-reversion zone")
        if cur["high"] >= cur["bb_up"] or abs(cur["bb_up"] - cur["close"]) / cur["bb_up"] < 0.0015:
            put_score += 20
            put_reasons.append("Upper Bollinger Band Rejection: 95.4% mean-reversion zone")

        # Pillar 3: Dual RSI (14 & 7) - 20 pts
        if cur["rsi14"] <= 35 or cur["rsi7"] <= 25:
            call_score += 20
            call_reasons.append(f"RSI Oversold Extreme (RSI14: {cur['rsi14']:.1f}, RSI7: {cur['rsi7']:.1f})")
        if cur["rsi14"] >= 65 or cur["rsi7"] >= 75:
            put_score += 20
            put_reasons.append(f"RSI Overbought Extreme (RSI14: {cur['rsi14']:.1f}, RSI7: {cur['rsi7']:.1f})")

        # Pillar 4: Stochastic Cross in Extremes - 15 pts
        if cur["stoch_k"] < 30 and cur["stoch_k"] >= cur["stoch_d"]:
            call_score += 15
            call_reasons.append(f"Bullish %K/%D Cross in Oversold (K: {cur['stoch_k']:.0f}, D: {cur['stoch_d']:.0f})")
        if cur["stoch_k"] > 70 and cur["stoch_k"] <= cur["stoch_d"]:
            put_score += 15
            put_reasons.append(f"Bearish %K/%D Cross in Overbought (K: {cur['stoch_k']:.0f}, D: {cur['stoch_d']:.0f})")

        # Pillar 5: MACD Histogram Momentum Acceleration - 10 pts
        if cur["macd_hist"] > prev["macd_hist"]:
            call_score += 10
            call_reasons.append("MACD Histogram expanding upward")
        elif cur["macd_hist"] < prev["macd_hist"]:
            put_score += 10
            put_reasons.append("MACD Histogram expanding downward")

        # Pillar 6: Price Action Pin Bar Rejection Wick - 10 pts
        tot_range = cur["high"] - cur["low"]
        if tot_range > 0:
            lower_wick = min(cur["open"], cur["close"]) - cur["low"]
            upper_wick = cur["high"] - max(cur["open"], cur["close"])
            if lower_wick / tot_range >= 0.55:
                call_score += 10
                call_reasons.append("Bullish Hammer / Pin Bar rejection wick > 55%")
            elif upper_wick / tot_range >= 0.55:
                put_score += 10
                put_reasons.append("Bearish Shooting Star rejection wick > 55%")

        # Pillar 7: ATR Volatility Safety - 5 pts
        if cur["atr"] > 0.05:
            call_score += 5
            put_score += 5
            call_reasons.append(f"ATR Volatility active (ATR: {cur['atr']:.3f})")
            put_reasons.append(f"ATR Volatility active (ATR: {cur['atr']:.3f})")

        # Select winner
        if call_score >= threshold and call_score > put_score:
            return {
                "score": call_score,
                "signal": "STRONG CALL (UP)",
                "bias": "CALL",
                "reasons": call_reasons,
                "price": cur["close"],
            }
        elif put_score >= threshold and put_score > call_score:
            return {
                "score": put_score,
                "signal": "STRONG PUT (DOWN)",
                "bias": "PUT",
                "reasons": put_reasons,
                "price": cur["close"],
            }
        else:
            best_score = max(call_score, put_score)
            best_bias = "CALL" if call_score >= put_score else "PUT"
            return {
                "score": best_score,
                "signal": f"WAIT (Score {best_score}% < Threshold {threshold}%)",
                "bias": best_bias,
                "reasons": call_reasons if best_bias == "CALL" else put_reasons,
                "price": cur["close"],
            }
