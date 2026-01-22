export interface MarketServiceApiResponse<Data> {
  success: boolean;
  message: string;
  data: Data | null | undefined;
  timestamp: string;
  path: string;
}

export interface TickerData {
  symbol: string;
  priceChangePercent: string;
  lastPrice: string;
  highPrice: string;
  lowPrice: string;
  quoteVolume: string;
  baseAsset?: string;
}

export interface AllTickersUpdateData {
  data: TickerData[];
}

export type AllTickersCallback = (tickers: TickerData[]) => void;

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  isFinal?: boolean;
}

export type CandleCallback = (candle: Candle) => void;

export type TickerCallback = (ticker: TickerData) => void;

export type HistoricalDataCallback = (candles: Candle[]) => void;

export interface CandleUpdateData {
  symbol: string;
  interval: string;
  data: Candle;
}

export interface TickerUpdateData {
  symbol: string;
  data: TickerData;
}
