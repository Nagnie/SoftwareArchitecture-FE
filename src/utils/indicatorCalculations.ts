/**
 * Technical Indicator Calculation Utilities
 * These functions calculate indicators from candle data for real-time updates
 */

import type { Candle } from '@/services/market';
import type { IndicatorValue, BollingerValue, MACDValue, StochasticValue } from '@/services/indicators';

/**
 * Calculate Simple Moving Average (SMA)
 */
export const calculateSMA = (candles: Candle[], period: number): IndicatorValue[] => {
  if (candles.length < period) return [];

  const result: IndicatorValue[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += candles[i - j].close;
    }
    result.push({
      time: candles[i].time,
      value: sum / period
    });
  }

  return result;
};

/**
 * Calculate Exponential Moving Average (EMA)
 */
export const calculateEMA = (candles: Candle[], period: number): IndicatorValue[] => {
  if (candles.length < period) return [];

  const multiplier = 2 / (period + 1);
  const result: IndicatorValue[] = [];

  // Calculate initial SMA for the first EMA value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let ema = sum / period;

  result.push({
    time: candles[period - 1].time,
    value: ema
  });

  // Calculate EMA for remaining values
  for (let i = period; i < candles.length; i++) {
    ema = (candles[i].close - ema) * multiplier + ema;
    result.push({
      time: candles[i].time,
      value: ema
    });
  }

  return result;
};

/**
 * Calculate Relative Strength Index (RSI)
 */
export const calculateRSI = (candles: Candle[], period: number = 14): IndicatorValue[] => {
  if (candles.length < period + 1) return [];

  const result: IndicatorValue[] = [];
  const changes: number[] = [];

  // Calculate price changes
  for (let i = 1; i < candles.length; i++) {
    changes.push(candles[i].close - candles[i - 1].close);
  }

  // Calculate initial average gains and losses
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }

  avgGain /= period;
  avgLoss /= period;

  // First RSI value
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - (100 / (1 + rs));

  result.push({
    time: candles[period].time,
    value: rsi
  });

  // Calculate RSI for remaining values using smoothed method
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));

    result.push({
      time: candles[i + 1].time,
      value: rsi
    });
  }

  return result;
};

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export const calculateMACD = (
  candles: Candle[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDValue[] => {
  if (candles.length < slowPeriod + signalPeriod) return [];

  // Calculate fast and slow EMAs
  const fastEMA = calculateEMA(candles, fastPeriod);
  const slowEMA = calculateEMA(candles, slowPeriod);

  // Calculate MACD line (fast EMA - slow EMA)
  const macdLine: { time: number; value: number }[] = [];

  // Find overlapping period
  const startIndex = slowPeriod - fastPeriod;

  for (let i = 0; i < slowEMA.length; i++) {
    const fastValue = fastEMA[i + startIndex]?.value;
    const slowValue = slowEMA[i]?.value;

    if (fastValue !== undefined && fastValue !== null && slowValue !== undefined && slowValue !== null) {
      macdLine.push({
        time: slowEMA[i].time,
        value: fastValue - slowValue
      });
    }
  }

  if (macdLine.length < signalPeriod) return [];

  // Calculate signal line (EMA of MACD line)
  const multiplier = 2 / (signalPeriod + 1);
  const result: MACDValue[] = [];

  // Initial signal (SMA of first signalPeriod MACD values)
  let signalSum = 0;
  for (let i = 0; i < signalPeriod; i++) {
    signalSum += macdLine[i].value;
  }
  let signal = signalSum / signalPeriod;

  // First complete MACD value
  const firstMacd = macdLine[signalPeriod - 1].value;
  result.push({
    time: macdLine[signalPeriod - 1].time,
    macd: firstMacd,
    signal: signal,
    histogram: firstMacd - signal
  });

  // Calculate remaining values
  for (let i = signalPeriod; i < macdLine.length; i++) {
    const macd = macdLine[i].value;
    signal = (macd - signal) * multiplier + signal;
    
    result.push({
      time: macdLine[i].time,
      macd: macd,
      signal: signal,
      histogram: macd - signal
    });
  }

  return result;
};

/**
 * Calculate Bollinger Bands
 */
export const calculateBollinger = (
  candles: Candle[],
  period: number = 20,
  stdDev: number = 2
): BollingerValue[] => {
  if (candles.length < period) return [];

  const result: BollingerValue[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    // Calculate SMA (middle band)
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += candles[i - j].close;
    }
    const middle = sum / period;

    // Calculate standard deviation
    let squaredDiffSum = 0;
    for (let j = 0; j < period; j++) {
      const diff = candles[i - j].close - middle;
      squaredDiffSum += diff * diff;
    }
    const std = Math.sqrt(squaredDiffSum / period);

    result.push({
      time: candles[i].time,
      upper: middle + stdDev * std,
      middle: middle,
      lower: middle - stdDev * std
    });
  }

  return result;
};

/**
 * Calculate Stochastic Oscillator
 */
export const calculateStochastic = (
  candles: Candle[],
  kPeriod: number = 14,
  dPeriod: number = 3
): StochasticValue[] => {
  if (candles.length < kPeriod + dPeriod - 1) return [];

  // Calculate %K values
  const kValues: { time: number; k: number }[] = [];

  for (let i = kPeriod - 1; i < candles.length; i++) {
    let highest = -Infinity;
    let lowest = Infinity;

    for (let j = 0; j < kPeriod; j++) {
      const candle = candles[i - j];
      if (candle.high > highest) highest = candle.high;
      if (candle.low < lowest) lowest = candle.low;
    }

    const range = highest - lowest;
    const k = range === 0 ? 50 : ((candles[i].close - lowest) / range) * 100;

    kValues.push({
      time: candles[i].time,
      k: k
    });
  }

  // Calculate %D (SMA of %K)
  const result: StochasticValue[] = [];

  for (let i = dPeriod - 1; i < kValues.length; i++) {
    let dSum = 0;
    for (let j = 0; j < dPeriod; j++) {
      dSum += kValues[i - j].k;
    }
    const d = dSum / dPeriod;

    result.push({
      time: kValues[i].time,
      k: kValues[i].k,
      d: d
    });
  }

  return result;
};

/**
 * Calculate Average True Range (ATR)
 */
export const calculateATR = (candles: Candle[], period: number = 14): IndicatorValue[] => {
  if (candles.length < period + 1) return [];

  const trueRanges: number[] = [];

  // Calculate True Range for each candle
  for (let i = 1; i < candles.length; i++) {
    const current = candles[i];
    const previous = candles[i - 1];

    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close)
    );
    trueRanges.push(tr);
  }

  const result: IndicatorValue[] = [];

  // Calculate initial ATR (SMA of first 'period' true ranges)
  let atrSum = 0;
  for (let i = 0; i < period; i++) {
    atrSum += trueRanges[i];
  }
  let atr = atrSum / period;

  result.push({
    time: candles[period].time,
    value: atr
  });

  // Calculate remaining ATR values using smoothed method
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
    result.push({
      time: candles[i + 1].time,
      value: atr
    });
  }

  return result;
};

/**
 * Update a single indicator value when a new candle arrives
 * This is optimized for real-time updates
 */
export const updateIndicatorWithNewCandle = (
  existingData: IndicatorValue[],
  candles: Candle[],
  indicatorType: 'sma' | 'ema',
  period: number
): IndicatorValue[] => {
  if (candles.length < period) return existingData;

  const lastCandle = candles[candles.length - 1];
  const lastDataTime = existingData[existingData.length - 1]?.time;

  // Check if we need to update the last value or add a new one
  if (lastDataTime === lastCandle.time) {
    // Update existing value
    const newData = [...existingData];
    
    if (indicatorType === 'sma') {
      let sum = 0;
      for (let i = candles.length - period; i < candles.length; i++) {
        sum += candles[i].close;
      }
      newData[newData.length - 1] = {
        time: lastCandle.time,
        value: sum / period
      };
    } else if (indicatorType === 'ema') {
      const multiplier = 2 / (period + 1);
      const prevEma = existingData.length >= 2 
        ? existingData[existingData.length - 2].value 
        : existingData[existingData.length - 1].value;
      
      if (prevEma === null) return newData;
      
      newData[newData.length - 1] = {
        time: lastCandle.time,
        value: (lastCandle.close - prevEma) * multiplier + prevEma
      };
    }
    
    return newData;
  } else {
    // Add new value - recalculate the last portion
    if (indicatorType === 'sma') {
      return calculateSMA(candles, period);
    } else {
      return calculateEMA(candles, period);
    }
  }
};
