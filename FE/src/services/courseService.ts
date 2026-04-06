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
};
