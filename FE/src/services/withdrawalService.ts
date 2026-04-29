import api from './api';

export interface BankAccount {
  id: number;
  bank_name: string;
  bank_account: string;
  account_name: string;
  created_at: string;
}

export interface Withdrawal {
  id: number;
  amount: number;
  bank_name: string;
  bank_account: string;
  account_name: string;
  status: 'pending_admin' | 'approved' | 'completed' | 'rejected';
  created_at: string;
}

export const withdrawalService = {
  getBankAccount: async (): Promise<{ bank_account: BankAccount | null }> => {
    const res = await api.get('/instructor/bank-account');
    return res.data;
  },
  saveBankAccount: async (data: { bank_name: string; bank_account: string; account_name: string }) => {
    const res = await api.post('/instructor/bank-account', data);
    return res.data;
  },
  deleteBankAccount: async () => {
    const res = await api.delete('/instructor/bank-account');
    return res.data;
  },
  getWithdrawals: async (): Promise<{ withdrawals: Withdrawal[] }> => {
    const res = await api.get('/instructor/withdrawals');
    return res.data;
  },
  createWithdrawal: async (amount: number) => {
    const res = await api.post('/instructor/withdrawals', { amount });
    return res.data;
  },
};
