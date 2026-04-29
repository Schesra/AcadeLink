import api from './api';

export interface OrderItem {
  id: number;
  course_id: number;
  instructor_id: number;
  course_title: string;
  thumbnail_url: string | null;
  instructor_name: string;
  instructor_username: string;
  price: number;
  instructor_amount: number;
  platform_amount: number;
}

export interface Order {
  id: number;
  user_id: number;
  order_code: string;
  total_amount: number;
  status: 'pending_payment' | 'paid' | 'cancelled';
  payment_note: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  student_name?: string;
  student_username?: string;
  item_count?: number;
  items?: OrderItem[];
  vietqr_url?: string;
  platform_bank?: {
    bank_id: string;
    account_no: string;
    account_name: string;
  };
}

export interface AdminBalance {
  total_platform_revenue: number;
  total_withdrawn: number;
  available_balance: number;
  withdrawal_history: AdminOwnWithdrawal[];
}

export interface AdminOwnWithdrawal {
  id: number;
  admin_id: number;
  amount: number;
  bank_name: string;
  bank_account: string;
  account_name: string;
  status: 'completed';
  created_at: string;
}

export interface AdminWithdrawal {
  id: number;
  instructor_id: number;
  instructor_name: string;
  instructor_username: string;
  amount: number;
  bank_name: string;
  bank_account: string;
  account_name: string;
  status: 'pending_admin' | 'approved' | 'completed' | 'rejected';
  created_at: string;
}

export const paymentService = {
  getOrderById: async (id: number): Promise<{ order: Order }> => {
    const res = await api.get(`/payment/orders/${id}`);
    return res.data;
  },
  getMyOrders: async (): Promise<{ orders: Order[] }> => {
    const res = await api.get('/payment/my-orders');
    return res.data;
  },
  reportPayment: async (id: number, payment_note?: string): Promise<{ message: string }> => {
    const res = await api.post(`/payment/orders/${id}/report`, { payment_note });
    return res.data;
  },
  adminGetOrders: async (status?: string): Promise<{ orders: Order[] }> => {
    const res = await api.get('/payment/admin/orders', { params: status ? { status } : {} });
    return res.data;
  },
  adminConfirmPayment: async (id: number): Promise<{ message: string }> => {
    const res = await api.put(`/payment/admin/orders/${id}/confirm`);
    return res.data;
  },
  adminCancelOrder: async (id: number): Promise<{ message: string }> => {
    const res = await api.put(`/payment/admin/orders/${id}/cancel`);
    return res.data;
  },
  adminGetWithdrawals: async (status?: string): Promise<{ withdrawals: AdminWithdrawal[] }> => {
    const res = await api.get('/payment/admin/withdrawals', { params: status ? { status } : {} });
    return res.data;
  },
  adminApproveWithdrawal: async (id: number): Promise<{ message: string }> => {
    const res = await api.put(`/payment/admin/withdrawals/${id}/approve`);
    return res.data;
  },
  adminRejectWithdrawal: async (id: number, reason?: string): Promise<{ message: string }> => {
    const res = await api.put(`/payment/admin/withdrawals/${id}/reject`, { reason });
    return res.data;
  },
  adminGetBalance: async (): Promise<AdminBalance> => {
    const res = await api.get('/payment/admin/balance');
    return res.data;
  },
  adminCreateWithdrawal: async (amount: number): Promise<{ message: string }> => {
    const res = await api.post('/payment/admin/withdraw', { amount });
    return res.data;
  },
};
