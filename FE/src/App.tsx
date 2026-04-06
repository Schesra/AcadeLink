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
import NotFound from "./pages/NotFound.tsx";
import InstructorDashboard from "./pages/instructor/Dashboard.tsx";
import InstructorCourseForm from "./pages/instructor/CourseForm.tsx";
import InstructorCourses from "./pages/instructor/Courses.tsx";
import InstructorEnrollments from "./pages/instructor/Enrollments.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/learn/:id" element={<LearnCourse />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/become-instructor" element={<BecomeInstructor />} />
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
              <Route path="/instructor/enrollments" element={
                <InstructorRoute><InstructorEnrollments /></InstructorRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
