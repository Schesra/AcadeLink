import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:  { label: "Chờ duyệt", className: "bg-warning-light text-warning" },
  approved: { label: "Đã duyệt",  className: "bg-success-light text-success" },
  rejected: { label: "Từ chối",   className: "bg-destructive/10 text-destructive" },
};

const InstructorEnrollments = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    fetchData();
  }, [location.key]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const coursesRes = await api.get('/instructor/courses');
      const fetchedCourses = coursesRes.data.courses || [];
      setCourses(fetchedCourses);

      // Fetch enrollments cho tất cả courses
      const all: any[] = [];
      await Promise.all(fetchedCourses.map(async (course: any) => {
        try {
          const res = await api.get(`/instructor/enrollments?course_id=${course.id}`);
          all.push(...(res.data.enrollments || []).map((e: any) => ({
            ...e,
            course_title: course.title,
          })));
        } catch {}
      }));
      setEnrollments(all);
    } catch {
      toast({ title: "Lỗi", description: "Không thể tải dữ liệu", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (enrollmentId: number, action: 'approve' | 'reject') => {
    try {
      await api.put(`/instructor/enrollments/${enrollmentId}/${action}`);
      toast({ title: "Thành công", description: action === 'approve' ? "Đã duyệt học viên" : "Đã từ chối học viên" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.response?.data?.message || "Thao tác thất bại", variant: "destructive" });
    }
  };

  const filtered = selectedCourse === "all"
    ? enrollments
    : enrollments.filter(e => e.course_id?.toString() === selectedCourse);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold text-foreground mb-6">Quản lý học viên</h1>

        {/* Filter */}
        <div className="mb-4">
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Tất cả khóa học</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Đang tải...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm p-12 text-center">
            <p className="text-muted-foreground">Chưa có học viên nào đăng ký</p>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Học viên</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Khóa học</th>
                  <th className="text-left px-4 py-3">Ngày đăng ký</th>
                  <th className="text-left px-4 py-3">Trạng thái</th>
                  <th className="text-right px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{e.full_name || e.username}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.email}</td>
                    <td className="px-4 py-3">{e.course_title}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(e.enrolled_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[e.status]?.className}`}>
                        {statusConfig[e.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {e.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground"
                            onClick={() => handleAction(e.id, 'approve')}>
                            Duyệt
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive"
                            onClick={() => handleAction(e.id, 'reject')}>
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default InstructorEnrollments;
