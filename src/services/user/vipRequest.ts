import userApi from '@/services/user/api';
import type { VipRequest, CreateVipRequestPayload } from '../admin/type';
import type { ApiResponse } from '@/services/user/type';

export const vipRequestApi = {
  // Create VIP upgrade request
  createRequest: async (data: CreateVipRequestPayload) => {
    const response = await userApi.post<ApiResponse<VipRequest>>('/vip-requests', data);
    return response.data.data;
  },

  // Get my VIP requests
  getMyRequests: async () => {
    const response = await userApi.get<ApiResponse<VipRequest[]>>('/vip-requests/my-requests');
    return response.data.data;
  },

  // Cancel my VIP request
  cancelRequest: async (id: number) => {
    const response = await userApi.delete<ApiResponse<any>>(`/vip-requests/${id}`);
    return response.data.data;
  }
};
