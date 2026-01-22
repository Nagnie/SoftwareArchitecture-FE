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
