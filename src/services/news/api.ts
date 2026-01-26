import type { GetNewsParams, GetNewsResponse } from '@/services/news/type';
import { envConfig } from '@/config/envConfig';
import { apiClient } from '@/lib/axios';

const BASE_URL = envConfig.NEWS_API_URL || 'http://localhost:3001/api/v1/news';

const axios = apiClient.getClient();
axios.defaults.baseURL = BASE_URL;

export const getNews = async (params: GetNewsParams) => {
  const response = await axios.get<GetNewsResponse>('/news', { params });

  return response.data;
};
