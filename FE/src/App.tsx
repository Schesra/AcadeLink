import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import InstructorRoute from "@/components/InstructorRoute";
import Index from "./pages/Index.tsx";
import Courses from "./pages/Courses.tsx";
import CourseDetail from "./pages/CourseDetail.tsx";
import MyCourses from "./pages/MyCourses.tsx";
import LearnCourse from "./pages/LearnCourse.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import BecomeInstructor from "./pages/BecomeInstructor.tsx";
import Profile from "./pages/Profile.tsx";
import NotFound from "./pages/NotFound.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import InstructorDashboard from "./pages/instructor/Dashboard.tsx";
import InstructorCourseForm from "./pages/instructor/CourseForm.tsx";
import InstructorCourses from "./pages/instructor/Courses.tsx";
import InstructorEnrollments from "./pages/instructor/Enrollments.tsx";
import InstructorCourseLessons from "./pages/instructor/CourseLessons.tsx";
import AdminRoute from "@/components/AdminRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminCourses from "./pages/admin/AdminCourses.tsx";
import AdminEnrollments from "./pages/admin/AdminEnrollments.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminCategories from "./pages/admin/AdminCategories.tsx";
import AdminInstructors from "./pages/admin/AdminInstructors.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="acadelink-theme">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/learn/:id" element={<LearnCourse />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/become-instructor" element={<BecomeInstructor />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/profile" element={<Profile />} />
              {/* Instructor routes */}
              <Route path="/instructor/dashboard" element={
                <InstructorRoute><InstructorDashboard /></InstructorRoute>
              } />
              <Route path="/instructor/courses" element={
                <InstructorRoute><InstructorCourses /></InstructorRoute>
              } />
              <Route path="/instructor/courses/new" element={
                <InstructorRoute><InstructorCourseForm /></InstructorRoute>
              } />
              <Route path="/instructor/courses/:id/edit" element={
                <InstructorRoute><InstructorCourseForm /></InstructorRoute>
              } />
              <Route path="/instructor/courses/:id/lessons" element={
                <InstructorRoute><InstructorCourseLessons /></InstructorRoute>
              } />
              <Route path="/instructor/enrollments" element={
                <InstructorRoute><InstructorEnrollments /></InstructorRoute>
              } />
              <Route path="*" element={<NotFound />} />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="enrollments" element={<AdminEnrollments />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="instructors" element={<AdminInstructors />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
