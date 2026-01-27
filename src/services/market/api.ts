import { envConfig } from '@/config/envConfig';
import { apiClient } from '@/lib/axios';
import type { Candle, MarketServiceApiResponse, TickerData } from '@/services/market/type';

const BASE_URL = envConfig.MARKET_API_URL || 'http://localhost:3001/api/v1/market';

const axios = apiClient.getClient();

export const getIconUrl = (symbol: string): string => {
  return `${BASE_URL}/icon/${symbol}`;
};

export const getAllTickers = async (signal?: AbortSignal) => {
  const response = await axios.get<MarketServiceApiResponse<TickerData[]>>(`${BASE_URL}/tickers`, { signal });

  return response.data.data || [];
};

export const get24hrTicker = async (symbol: string, signal?: AbortSignal) => {
  const response = await axios.get<MarketServiceApiResponse<TickerData>>(`${BASE_URL}/ticker/${symbol}`, { signal });

  return response.data.data;
};

export const getHistoryCandles = async (
  symbol: string,
  interval: string = '1h',
  limit: number = 1000,
  signal?: AbortSignal
) => {
  const response = await axios.get<MarketServiceApiResponse<Candle[]>>(`${BASE_URL}/candles/${symbol}`, {
    params: { interval, limit },
    signal
  });

  return response.data.data || [];
};

export const getSymbols = async (signal?: AbortSignal): Promise<string[]> => {
  const response = await axios.get<MarketServiceApiResponse<string[]>>(`${BASE_URL}/symbols`, { signal });

  return response.data.data || [];
};
