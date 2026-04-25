import api from './api';

export const userService = {
  getProfile: () => api.get('/profile').then(r => r.data),
  updateProfile: (data: { full_name: string; bio?: string }) =>
    api.put('/profile', data).then(r => r.data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.put('/profile/password', data).then(r => r.data),
};
