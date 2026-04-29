import api from './api';

export interface CartItem {
  id: number;
  course_id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string | null;
  category_name: string;
  instructor_name: string;
  instructor_username: string;
  lesson_count: number;
  added_at: string;
}

export const cartService = {
  getCart: async (): Promise<{ items: CartItem[]; total: number; count: number }> => {
    const res = await api.get('/cart');
    return res.data;
  },
  addToCart: async (course_id: number) => {
    const res = await api.post('/cart', { course_id });
    return res.data;
  },
  removeFromCart: async (course_id: number) => {
    const res = await api.delete(`/cart/${course_id}`);
    return res.data;
  },
  clearCart: async () => {
    const res = await api.delete('/cart');
    return res.data;
  },
  checkout: async (): Promise<{
    message: string;
    free_results?: any[];
    order?: { id: number; order_code: string; total_amount: number; vietqr_url: string } | null;
  }> => {
    const res = await api.post('/cart/checkout');
    return res.data;
  },
};
