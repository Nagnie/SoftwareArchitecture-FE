// Base API response type
export interface IndicatorApiResponse<T> {
  success: boolean;
  data: T;
}

// Single indicator value (for MA, EMA, RSI, ATR)
export interface IndicatorValue {
  time: number;
  value: number | null;
}

// MACD indicator value
export interface MACDValue {
  time: number;
  macd: number | null;
  signal: number | null;
  histogram: number | null;
}

// Bollinger Bands value
export interface BollingerValue {
  time: number;
  upper: number | null;
  middle: number | null;
  lower: number | null;
}

// Stochastic value
export interface StochasticValue {
  time: number;
  k: number | null;
  d: number | null;
}

// Response types for different indicators
export interface MAResponse {
  symbol: string;
  interval: string;
  indicator: 'SMA';
  period: number;
  values: IndicatorValue[];
}

export interface EMAResponse {
  symbol: string;
  interval: string;
  indicator: 'EMA';
  period: number;
  values: IndicatorValue[];
}

export interface RSIResponse {
  symbol: string;
  interval: string;
  indicator: 'RSI';
  period: number;
  values: IndicatorValue[];
}

export interface MACDResponse {
  symbol: string;
  interval: string;
  indicator: 'MACD';
  params: {
    fastPeriod: number;
    slowPeriod: number;
    signalPeriod: number;
  };
  values: MACDValue[];
}

export interface BollingerResponse {
  symbol: string;
  interval: string;
  indicator: 'Bollinger Bands';
  params: {
    period: number;
    stdDev: number;
  };
  values: BollingerValue[];
}

export interface StochasticResponse {
  symbol: string;
  interval: string;
  indicator: 'Stochastic';
  params: {
    kPeriod: number;
    dPeriod: number;
  };
  values: StochasticValue[];
}

export interface ATRResponse {
  symbol: string;
  interval: string;
  indicator: 'ATR';
  period: number;
  values: IndicatorValue[];
}

// Multi indicators response
export interface MultiIndicatorsCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MultiIndicatorsData {
  symbol: string;
  interval: string;
  period: number;
  requestedIndicators: string[];
  candles: MultiIndicatorsCandle[];
  indicators: {
    ma?: IndicatorValue[];
    ema?: IndicatorValue[];
    rsi?: IndicatorValue[];
    macd?: MACDValue[];
    bollinger?: BollingerValue[];
    stochastic?: StochasticValue[];
    atr?: IndicatorValue[];
  };
}

// Summary response
export interface TASummaryData {
  symbol: string;
  interval: string;
  timestamp: number;
  price: {
    current: number;
    change24h: number | null;
  };
  indicators: {
    rsi: number;
    macd: {
      macd: number;
      signal: number;
      histogram: number;
    };
    stochastic: {
      k: number;
      d: number;
    };
    ma20: number;
    ma50: number;
    ema12: number;
    ema26: number;
  };
  signals: string[];
  summary: {
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    bullishSignals: number;
    bearishSignals: number;
    totalSignals: number;
  };
}

// Indicator types enum
export type IndicatorType = 'ma' | 'ema' | 'rsi' | 'macd' | 'bollinger' | 'stochastic' | 'atr';

// Request params types
export interface BaseIndicatorParams {
  symbol: string;
  interval: string;
  limit?: number;
}

export interface MAParams extends BaseIndicatorParams {
  period?: number;
}

export interface EMAParams extends BaseIndicatorParams {
  period?: number;
}

export interface RSIParams extends BaseIndicatorParams {
  period?: number;
}

export interface MACDParams extends BaseIndicatorParams {
  fastPeriod?: number;
  slowPeriod?: number;
  signalPeriod?: number;
}

export interface BollingerParams extends BaseIndicatorParams {
  period?: number;
  stdDev?: number;
}

export interface StochasticParams extends BaseIndicatorParams {
  kPeriod?: number;
  dPeriod?: number;
}

export interface ATRParams extends BaseIndicatorParams {
  period?: number;
}

export interface MultiIndicatorsParams extends BaseIndicatorParams {
  indicators: IndicatorType[];
  period?: number;
}

// Enabled indicators state for UI
export interface EnabledIndicators {
  ma: boolean;
  ema: boolean;
  rsi: boolean;
  macd: boolean;
  bollinger: boolean;
  stochastic: boolean;
  atr: boolean;
}

// Indicator settings for UI
export interface IndicatorSettings {
  ma: { period: number; color: string };
  ema: { period: number; color: string };
  rsi: { period: number };
  macd: { fastPeriod: number; slowPeriod: number; signalPeriod: number };
  bollinger: { period: number; stdDev: number };
  stochastic: { kPeriod: number; dPeriod: number };
  atr: { period: number };
}
