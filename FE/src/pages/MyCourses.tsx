import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { courseService } from "@/services/courseService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const MyCourses = () => {
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyCourses();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const data = await courseService.getMyCourses();
      setMyCourses(data.enrollments || []);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khóa học của bạn",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-muted py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Khóa học của tôi</h1>
          <p className="text-muted-foreground mt-2">Bạn đã đăng ký {myCourses.length} khóa học</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 flex-1">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        ) : myCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((enrollment) => (
              <CourseCard 
                key={enrollment.enrollment_id} 
                course={{
                  id: enrollment.course_id.toString(),
                  title: enrollment.title,
                  description: enrollment.description,
                  price: '',
                  instructor: enrollment.instructor_name,
                  category: enrollment.category_name,
                  thumbnail: enrollment.thumbnail_url || '/placeholder.svg',
                  lessons: enrollment.lesson_count || 0,
                  students: 0,
                  status: enrollment.status,
                }} 
                showStatus 
              />
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-sm p-12 text-center">
            <BookOpen size={96} className="mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold text-card-foreground mb-2">Bạn chưa đăng ký khóa học nào</h3>
            <p className="text-muted-foreground mb-6">Khám phá các khóa học chất lượng và bắt đầu hành trình học tập!</p>
            <Link to="/courses">
              <Button>Khám phá khóa học</Button>
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyCourses;
