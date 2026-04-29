import api from './api';

export const courseService = {
  // Get all courses
  getAllCourses: async (params?: { category_id?: number; search?: string }) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  // Get course by ID
  getCourseById: async (id: string) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  // Get my enrolled courses
  getMyCourses: async () => {
    const response = await api.get('/my-courses');
    return response.data;
  },

  // Enroll in a course
  enrollCourse: async (courseId: string) => {
    const response = await api.post('/enrollments', { course_id: Number(courseId) });
    return response.data;
  },

  // Get course lessons
  getCourseLessons: async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}/lessons`);
    return response.data;
  },

  // Get all categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // ==================== REVIEWS ====================
  getCourseReviews: async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}/reviews`);
    return response.data;
  },
  createReview: async (courseId: string, data: { rating: number; comment?: string }) => {
    const response = await api.post(`/courses/${courseId}/reviews`, data);
    return response.data;
  },
  deleteReview: async (courseId: string) => {
    const response = await api.delete(`/courses/${courseId}/reviews`);
    return response.data;
  },

  // ==================== PROGRESS ====================
  getCourseProgress: async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}/progress`);
    return response.data;
  },
  completeLesson: async (lessonId: number) => {
    const response = await api.post(`/lessons/${lessonId}/complete`);
    return response.data;
  },
  uncompleteLesson: async (lessonId: number) => {
    const response = await api.delete(`/lessons/${lessonId}/complete`);
    return response.data;
  },
};
