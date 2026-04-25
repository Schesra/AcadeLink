import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2, Users, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

const InstructorCourses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    fetchCourses();
  }, [location.key]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/instructor/courses');
      setCourses(res.data.courses || []);
    } catch {
      toast({ title: "Lỗi", description: "Không thể tải danh sách khóa học", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa khóa học "${title}"?`)) return;
    try {
      await api.delete(`/instructor/courses/${id}`);
      toast({ title: "Thành công", description: "Đã xóa khóa học" });
      fetchCourses();
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.response?.data?.message || "Xóa thất bại", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Khóa học của tôi</h1>
          <Link to="/instructor/courses/new">
            <Button className="gap-2"><PlusCircle size={16} /> Tạo khóa học</Button>
          </Link>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Đang tải...</p>
        ) : courses.length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm p-12 text-center">
            <p className="text-muted-foreground mb-4">Bạn chưa có khóa học nào</p>
            <Link to="/instructor/courses/new">
              <Button className="gap-2"><PlusCircle size={16} /> Tạo khóa học đầu tiên</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                {/* Thumbnail */}
                <div className="aspect-video overflow-hidden bg-muted shrink-0">
                  <img
                    src={course.thumbnail_url
                      ? (course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `http://localhost:3000${course.thumbnail_url}`)
                      : '/placeholder.svg'}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                </div>
                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-card-foreground line-clamp-2 mb-3 min-h-[2.75rem]">{course.title}</h3>
                  <div className="flex items-center justify-between text-sm mt-auto">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users size={14} /> {course.student_count || 0} học viên
                    </span>
                    <span className="font-bold text-primary">
                      {Number(course.price).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <Link to={`/instructor/courses/${course.id}/lessons`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full gap-1">
                        <BookOpen size={14} /> Bài học
                        {course.lesson_count > 0 && (
                          <span className="ml-1 bg-primary/10 text-primary text-xs rounded-full px-1.5">
                            {course.lesson_count}
                          </span>
                        )}
                      </Button>
                    </Link>
                    <Link to={`/instructor/courses/${course.id}/edit`}>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Pencil size={14} />
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(course.id, course.title)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default InstructorCourses;
