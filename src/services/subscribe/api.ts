import type {
  SubscribeSourceParams,
  SubscribeSourceResponse,
  UnsubscribeSourceParams,
  UnsubscribeSourceResponse,
  GetSourcesParams,
  GetSourcesResponse,
  GetUserSourcesResponse
} from '@/services/subscribe/type';
import { envConfig } from '@/config/envConfig';
import { apiClient } from '@/lib/axios';

const BASE_URL = envConfig.CRAWLER_SERVICE_API_URL || 'http://localhost:3001/api/v1/user-service';

const axios = apiClient.getClient();

export const subscribeSource = async (params: SubscribeSourceParams) => {
  const response = await axios.post<SubscribeSourceResponse>(`${BASE_URL}/subscribe-source`, params, {
    withCredentials: false
  });

  return response.data;
};

export const unsubscribeSource = async (params: UnsubscribeSourceParams) => {
  const response = await axios.post<UnsubscribeSourceResponse>(`${BASE_URL}/unsubscribe-source`, params, {
    withCredentials: false
  });

  return response.data;
};

export const getSources = async (params?: GetSourcesParams) => {
  const response = await axios.get<GetSourcesResponse>(`${BASE_URL}/sources`, {
    params,
    withCredentials: false
  });

  return response.data;
};

export const getUserSources = async (userId: string) => {
  const response = await axios.get<GetUserSourcesResponse>(`${BASE_URL}/user/${userId}/sources`, {
    withCredentials: false
  });

  return response.data;
};
