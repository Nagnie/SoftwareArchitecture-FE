export type VipRequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
}

export interface VipRequest {
  id: number;
  userId: number;
  requestedMonths: number;
  message?: string;
  status: VipRequestStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVipRequestPayload {
  requestedMonths: number;
  message?: string;
}

export interface ProcessVipRequestPayload {
  status: 'APPROVED' | 'REJECTED';
  adminNote?: string;
}
