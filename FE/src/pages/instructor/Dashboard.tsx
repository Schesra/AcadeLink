import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, PlusCircle, Clock } from "lucide-react";
import api from "@/services/api";

const Dashboard = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    api.get('/instructor/courses')
      .then(async (coursesRes) => {
        const fetchedCourses = coursesRes.data.courses || [];
        setCourses(fetchedCourses);

        // Lấy enrollments pending cho từng course
        const allEnrollments: any[] = [];
        await Promise.all(
          fetchedCourses.map(async (course: any) => {
            try {
              const res = await api.get(`/instructor/enrollments?course_id=${course.id}&status=pending`);
              allEnrollments.push(...(res.data.enrollments || []).map((e: any) => ({
                ...e,
                course_title: course.title,
              })));
            } catch {}
          })
        );
        setEnrollments(allEnrollments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [location.key]);

  const pendingCount = enrollments.filter(e => e.status === 'pending').length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard Giảng viên</h1>
          <Link to="/instructor/courses/new">
            <Button className="gap-2"><PlusCircle size={16} /> Tạo khóa học</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Khóa học</p>
                <p className="text-2xl font-bold text-foreground">{courses.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Users size={24} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Học viên</p>
                <p className="text-2xl font-bold text-foreground">{courses.reduce((sum, c) => sum + (c.student_count || 0), 0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock size={24} className="text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chờ duyệt</p>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent enrollments */}
        {pendingCount > 0 && (
          <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Yêu cầu đăng ký chờ duyệt</h2>
              <Link to="/instructor/enrollments">
                <Button variant="ghost" size="sm">Xem tất cả</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {enrollments.filter(e => e.status === 'pending').slice(0, 5).map((e) => (
                <div key={e.enrollment_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{e.student_name}</p>
                    <p className="text-xs text-muted-foreground">{e.course_title}</p>
                  </div>
                  <Link to="/instructor/enrollments">
                    <Button size="sm" variant="outline">Xem</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courses list */}
        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Khóa học của tôi</h2>
            <Link to="/instructor/courses">
              <Button variant="ghost" size="sm">Xem tất cả</Button>
            </Link>
          </div>
          {loading ? (
            <p className="text-muted-foreground text-sm">Đang tải...</p>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen size={48} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground mb-4">Bạn chưa có khóa học nào</p>
              <Link to="/instructor/courses/new">
                <Button className="gap-2"><PlusCircle size={16} /> Tạo khóa học đầu tiên</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.slice(0, 5).map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <p className="font-medium text-sm">{course.title}</p>
                    <p className="text-xs text-muted-foreground">{course.category_name} • {course.student_count || 0} học viên</p>
                  </div>
                  <Link to={`/instructor/courses/${course.id}/edit`}>
                    <Button size="sm" variant="outline">Quản lý</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
