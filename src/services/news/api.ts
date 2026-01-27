import type { GetNewsParams, GetNewsResponse } from '@/services/news/type';
import { envConfig } from '@/config/envConfig';
import { apiClient } from '@/lib/axios';

const BASE_URL = envConfig.NEWS_API_URL || 'http://localhost:3001/api/v1/news';

const axios = apiClient.getClient();

export const getNews = async (params: GetNewsParams) => {
  const response = await axios.get<GetNewsResponse>(`${BASE_URL}/news`, { params, withCredentials: false });

  return response.data;
};
