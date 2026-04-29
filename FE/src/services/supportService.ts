import api from './api';

export interface SupportTicket {
  id: number;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  course_title?: string;
  created_at: string;
  updated_at: string;
}

export const supportService = {
  createTicket: async (data: { subject: string; description: string; course_id?: number }) => {
    const response = await api.post('/support/tickets', data);
    return response.data;
  },
  getMyTickets: async (): Promise<{ tickets: SupportTicket[] }> => {
    const response = await api.get('/support/tickets');
    return response.data;
  },
};
