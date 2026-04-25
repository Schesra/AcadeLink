import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import CourseCardSkeleton from "@/components/CourseCardSkeleton";
import { BookOpen, Users, Award } from "lucide-react";
import { courseService } from "@/services/courseService";

const features = [
  { icon: <BookOpen size={48} className="text-primary" />, title: "Khóa học chất lượng", desc: "Nội dung được biên soạn bởi các chuyên gia hàng đầu trong ngành." },
  { icon: <Users size={48} className="text-primary" />, title: "Cộng đồng học tập", desc: "Kết nối với hàng nghìn học viên và giảng viên trên toàn quốc." },
  { icon: <Award size={48} className="text-primary" />, title: "Chứng nhận hoàn thành", desc: "Nhận chứng chỉ sau khi hoàn thành khóa học để nâng cao CV." },
];

const Index = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseService.getAllCourses().then((data) => {
      setCourses((data.courses || []).slice(0, 6));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-warning py-20 md:py-24 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Welcome to AcadeLink
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Học kỹ năng mới, nâng cao sự nghiệp và khám phá tiềm năng của bạn cùng hàng nghìn khóa học chất lượng.
          </p>
            <Link to="/courses">
            <Button variant="hero" size="lg">
              Khám phá khóa học
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-card rounded-lg shadow-sm p-8 text-center hover:shadow-md transition-shadow duration-300">
                <div className="flex justify-center mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-card-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="bg-card py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-card-foreground mb-10">
            Khóa học nổi bật
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)
              : courses.map((course) => (
                  <CourseCard key={course.id} course={{
                    id: course.id.toString(),
                    title: course.title,
                    description: course.description,
                    price: course.price,
                    instructor: course.instructor_name,
                    category: course.category_name,
                    thumbnail: course.thumbnail_url
                      ? (course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `http://localhost:3000${course.thumbnail_url}`)
                      : '/placeholder.svg',
                    lessons: 0,
                    students: course.student_count || 0,
                  }} />
                ))
            }
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
