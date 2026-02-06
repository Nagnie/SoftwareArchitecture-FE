import { envConfig } from '@/config/envConfig';
import { apiClient } from '@/lib/axios';
import type {
  IndicatorApiResponse,
  MAResponse,
  EMAResponse,
  RSIResponse,
  MACDResponse,
  BollingerResponse,
  StochasticResponse,
  ATRResponse,
  MultiIndicatorsData,
  TASummaryData,
  MAParams,
  EMAParams,
  RSIParams,
  MACDParams,
  BollingerParams,
  StochasticParams,
  ATRParams,
  MultiIndicatorsParams
} from './type';

// Base URL for indicators API - same server as market service
const BASE_URL = envConfig.MARKET_API_URL?.replace('/market', '/indicators') || 'http://localhost:3001/api/v1/indicators';

const axios = apiClient.getClient();

/**
 * Get Simple Moving Average (SMA) data
 */
export const getMA = async (params: MAParams, signal?: AbortSignal): Promise<MAResponse> => {
  const { symbol, interval, period = 20, limit = 500 } = params;
  const response = await axios.get<IndicatorApiResponse<MAResponse>>(
    `${BASE_URL}/${symbol}/ma`,
    { params: { interval, period, limit }, signal }
  );
  return response.data.data;
};

/**
 * Get Exponential Moving Average (EMA) data
 */
export const getEMA = async (params: EMAParams, signal?: AbortSignal): Promise<EMAResponse> => {
  const { symbol, interval, period = 12, limit = 500 } = params;
  const response = await axios.get<IndicatorApiResponse<EMAResponse>>(
    `${BASE_URL}/${symbol}/ema`,
    { params: { interval, period, limit }, signal }
  );
  return response.data.data;
};

/**
 * Get Relative Strength Index (RSI) data
 */
export const getRSI = async (params: RSIParams, signal?: AbortSignal): Promise<RSIResponse> => {
  const { symbol, interval, period = 14, limit = 500 } = params;
  const response = await axios.get<IndicatorApiResponse<RSIResponse>>(
    `${BASE_URL}/${symbol}/rsi`,
    { params: { interval, period, limit }, signal }
  );
  return response.data.data;
};

/**
 * Get MACD data
 */
export const getMACD = async (params: MACDParams, signal?: AbortSignal): Promise<MACDResponse> => {
  const { symbol, interval, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9, limit = 500 } = params;
  const response = await axios.get<IndicatorApiResponse<MACDResponse>>(
    `${BASE_URL}/${symbol}/macd`,
    { params: { interval, fastPeriod, slowPeriod, signalPeriod, limit }, signal }
  );
  return response.data.data;
};

/**
 * Get Bollinger Bands data
 */
export const getBollinger = async (params: BollingerParams, signal?: AbortSignal): Promise<BollingerResponse> => {
  const { symbol, interval, period = 20, stdDev = 2, limit = 500 } = params;
  const response = await axios.get<IndicatorApiResponse<BollingerResponse>>(
    `${BASE_URL}/${symbol}/bollinger`,
    { params: { interval, period, stdDev, limit }, signal }
  );
  return response.data.data;
};

/**
 * Get Stochastic Oscillator data
 */
export const getStochastic = async (params: StochasticParams, signal?: AbortSignal): Promise<StochasticResponse> => {
  const { symbol, interval, kPeriod = 14, dPeriod = 3, limit = 500 } = params;
  const response = await axios.get<IndicatorApiResponse<StochasticResponse>>(
    `${BASE_URL}/${symbol}/stochastic`,
    { params: { interval, kPeriod, dPeriod, limit }, signal }
  );
  return response.data.data;
};

/**
 * Get Average True Range (ATR) data
 */
export const getATR = async (params: ATRParams, signal?: AbortSignal): Promise<ATRResponse> => {
  const { symbol, interval, period = 14, limit = 500 } = params;
  const response = await axios.get<IndicatorApiResponse<ATRResponse>>(
    `${BASE_URL}/${symbol}/atr`,
    { params: { interval, period, limit }, signal }
  );
  return response.data.data;
};

/**
 * Get multiple indicators in a single request (recommended for initial load)
 */
export const getMultiIndicators = async (params: MultiIndicatorsParams, signal?: AbortSignal): Promise<MultiIndicatorsData> => {
  const { symbol, interval, indicators, period = 14, limit = 500 } = params;
  const response = await axios.get<IndicatorApiResponse<MultiIndicatorsData>>(
    `${BASE_URL}/${symbol}/multi`,
    { 
      params: { 
        interval, 
        indicators: indicators.join(','), 
        period, 
        limit 
      }, 
      signal 
    }
  );
  return response.data.data;
};

/**
 * Get Technical Analysis Summary
 */
export const getTASummary = async (symbol: string, interval: string = '1h', signal?: AbortSignal): Promise<TASummaryData> => {
  const response = await axios.get<IndicatorApiResponse<TASummaryData>>(
    `${BASE_URL}/${symbol}/summary`,
    { params: { interval }, signal }
  );
  return response.data.data;
};
