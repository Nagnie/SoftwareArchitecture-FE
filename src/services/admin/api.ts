import userApi from '@/services/user/api';
import type { VipRequest, ProcessVipRequestPayload } from './type';
import type { ApiResponse } from '@/services/user/type';

export const adminVipRequestApi = {
  // Get all VIP requests
  getAllRequests: async () => {
    const response = await userApi.get<ApiResponse<VipRequest[]>>('/vip-requests/admin/all');
    console.log("🚀 ~ response:", response)
    return response.data;
  },

  // Get pending VIP requests
  getPendingRequests: async () => {
    const response = await userApi.get<ApiResponse<VipRequest[]>>('/vip-requests/admin/pending');
    return response.data;
  },

  // Approve or reject VIP request
  processRequest: async (id: number, data: ProcessVipRequestPayload) => {
    const response = await userApi.post<ApiResponse<VipRequest>>(`/vip-requests/admin/${id}/process`, data);
    return response.data;
  }
};
