import { envConfig } from '@/config/envConfig';
import { apiClient } from '@/lib/axios';
import type { MarketServiceApiResponse, TickerData } from '@/services/market/type';

const BASE_URL = envConfig.MARKET_API_URL || 'http://localhost:3001/api/v1/market';

const axios = apiClient.getClient();
axios.defaults.baseURL = BASE_URL;

export const getIconUrl = (symbol: string): string => {
  return `${BASE_URL}/icon/${symbol}`;
};

export const getAllTickers = async () => {
  const response = await axios.get<MarketServiceApiResponse<TickerData[]>>('/tickers');

  return response.data.data || [];
};
