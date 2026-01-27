import axios from 'axios';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ApiResponse,
  UpdateUserRequest,
  ChangePasswordRequest
} from './type';
import { envConfig } from '@/config/envConfig';

const BASE_URL = envConfig.USER_SERVICE_API_URL || 'http://localhost:8080/api';

const userApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token
userApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = async (data: LoginRequest) => {
  const response = await userApi.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterRequest) => {
  const response = await userApi.post<string>('/auth/register', data); // Response might be a success message
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await userApi.get<ApiResponse<User>>('/users/me');
  return response.data.data;
};

export const getAllUsers = async () => {
  const response = await userApi.get<ApiResponse<User[]>>('/users');
  return response.data.data;
};

// Admin endpoints
export const upgradeToVip = async (userId: number, months: number) => {
  const response = await userApi.post(`/users/${userId}/upgrade-vip`, null, {
    params: { months }
  });
  return response.data;
};

export const downgradeUser = async (userId: number) => {
  const response = await userApi.post(`/users/${userId}/downgrade`);
  return response.data;
};

export const updateCurrentUser = async (data: UpdateUserRequest) => {
  const response = await userApi.put<ApiResponse<User>>('/users/me', data);
  return response.data.data;
};

export const changePassword = async (data: ChangePasswordRequest) => {
  const response = await userApi.put<ApiResponse<string>>('/users/me/password', data);
  return response.data;
};

export const deleteAccount = async () => {
  const response = await userApi.delete<ApiResponse<string>>('/users/me');
  return response.data;
};

export default userApi;
