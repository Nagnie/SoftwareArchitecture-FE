import { envConfig } from '@/config/envConfig';
import { apiClient } from '@/lib/axios';
import type { AIAnalysisParams, AIAnalysisResponse } from './type';

const BASE_URL = envConfig.AI_SERVICE_API_URL || 'http://localhost:8000/api/v1/ai';

const axios = apiClient.getClient();

export const getAIAnalysis = async (params: AIAnalysisParams, signal?: AbortSignal) => {
  const response = await axios.get<AIAnalysisResponse>(`${BASE_URL}/predict/${params.symbol}`, { signal });

  return response.data;
};
