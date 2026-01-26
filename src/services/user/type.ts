export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  accountType: string;
  isActive: boolean;
  isEmailVerified: boolean;
  vipExpiryDate: string | null;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    tokenType: string;
    expiresIn: number;
    user: User;
  };
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

export interface UserServiceApiResponse<T> {
  // Adjust based on actual response structure if known, otherwise assume standard
  data?: T;
  message?: string;
  status?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}
