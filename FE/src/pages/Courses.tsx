import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { courseService } from "@/services/courseService";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: number;
  title: string;
  description: string;
  price: string;
  instructor_name: string;
  category_name: string;
  thumbnail_url?: string;
  student_count?: number;
}

interface Category {
  id: number;
  category_name: string;
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [activeCategory]);

  const fetchCategories = async () => {
    try {
      const data = await courseService.getCategories();
      setCategories(data.categories || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = activeCategory ? { category_id: activeCategory } : {};
      const data = await courseService.getAllCourses(params);
      setCourses(data.courses || []);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khóa học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Page Header */}
      <section className="bg-muted py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Tất cả khóa học</h1>
          <p className="text-muted-foreground mt-2">Khám phá {courses.length} khóa học chất lượng</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-card rounded-lg shadow-sm p-6 md:sticky md:top-20">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Danh mục</h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeCategory === null
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Tất cả
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {cat.category_name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Course Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Đang tải...</p>
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={{
                      id: course.id.toString(),
                      title: course.title,
                      description: course.description,
                      price: course.price,
                      instructor: course.instructor_name,
                      category: course.category_name,
                      thumbnail: course.thumbnail_url || '/placeholder.svg',
                      lessons: 0,
                      students: course.student_count || 0,
                    }} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-lg shadow-sm p-12 text-center">
                <BookOpen size={96} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-lg font-semibold text-card-foreground mb-2">Không tìm thấy khóa học nào</p>
                <Button variant="default" onClick={() => setActiveCategory(null)}>
                  Xem tất cả khóa học
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CoursesPage;
