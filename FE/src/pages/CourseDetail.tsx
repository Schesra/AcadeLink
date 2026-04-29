import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewSection from "@/components/ReviewSection";
import SupportTicketModal from "@/components/SupportTicketModal";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Users, BookOpen, Video, FileText } from "lucide-react";
import { courseService } from "@/services/courseService";
import { cartService } from "@/services/cartService";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart } from "lucide-react";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { cartCourseIds, refresh: refreshCart } = useCart();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseDetail();
      fetchLessons();
    }
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && id) {
      courseService.getMyCourses().then(data => {
        const enrolled = (data.enrollments || []).some(
          (e: any) => String(e.course_id) === id && e.status === 'approved'
        );
        setIsEnrolled(enrolled);
      }).catch(() => {});
    }
  }, [isAuthenticated, id]);

  const fetchCourseDetail = async () => {
    try {
      const data = await courseService.getCourseById(id!);
      setCourse(data.course);
      // lessons đã có trong response của getCourseDetail
      setLessons(data.course?.lessons || []);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin khóa học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    // Lessons đã được load cùng với course detail, không cần gọi riêng
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để đăng ký khóa học",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    // Paid course → add to cart then go to cart for checkout
    if (Number(course?.price) > 0) {
      setEnrolling(true);
      try {
        if (!cartCourseIds.has(Number(id))) {
          await cartService.addToCart(Number(id));
          refreshCart();
        }
        navigate('/cart');
      } catch (error: any) {
        toast({ title: "Lỗi", description: error.response?.data?.message || "Không thể thêm vào giỏ hàng", variant: "destructive" });
      } finally {
        setEnrolling(false);
      }
      return;
    }

    // Free course → enroll directly (pending, waits for instructor approval)
    setEnrolling(true);
    try {
      await courseService.enrollCourse(id!);
      toast({ title: "Thành công", description: "Đăng ký khóa học thành công! Vui lòng chờ giảng viên duyệt." });
      navigate('/my-courses');
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.response?.data?.message || "Đăng ký khóa học thất bại", variant: "destructive" });
    } finally {
      setEnrolling(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (cartCourseIds.has(Number(id))) { navigate('/cart'); return; }
    setAddingToCart(true);
    try {
      await cartService.addToCart(Number(id));
      refreshCart();
      toast({ title: "Đã thêm vào giỏ hàng", description: "Xem giỏ hàng để đăng ký" });
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.response?.data?.message || "Không thể thêm vào giỏ hàng", variant: "destructive" });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-lg">Đang tải...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-lg">Không tìm thấy khóa học.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-muted border-b px-4 py-3">
        <div className="container mx-auto">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Trang chủ</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/courses">Khóa học</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1 max-w-xs">{course.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-warning py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          {/* Text */}
          <div className="flex-1 min-w-0">
            <span className="inline-block px-3 py-1 rounded-md text-sm font-medium bg-primary-foreground/20 text-primary-foreground mb-4">
              {course.category_name}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
              {course.title}
            </h1>
            <p className="text-lg text-primary-foreground/90 mb-6 line-clamp-4">
              {course.description}
            </p>
            <div className="flex flex-wrap gap-6 text-primary-foreground/90 text-sm mb-6">
              <span className="flex items-center gap-2"><Users size={16} /> {course.instructor_name}</span>
              <span className="flex items-center gap-2"><BookOpen size={16} /> {course.student_count || 0} học viên</span>
              <span className="flex items-center gap-2"><Video size={16} /> {lessons.length} bài học</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-3xl font-bold text-primary-foreground">
                {Number(course.price) === 0 ? 'Miễn phí' : `${Number(course.price).toLocaleString('vi-VN')}₫`}
              </span>
              {isEnrolled ? (
                <Button variant="hero" size="lg" onClick={() => navigate(`/learn/${id}`)}>
                  Vào học ngay
                </Button>
              ) : (
                <>
                  <Button variant="hero" size="lg" onClick={handleEnroll} disabled={enrolling}>
                    {enrolling ? "Đang xử lý..." : Number(course?.price) > 0 ? "Mua ngay" : "Đăng ký ngay"}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2"
                  >
                    <ShoppingCart size={18} />
                    {cartCourseIds.has(Number(id)) ? "Xem giỏ hàng" : addingToCart ? "Đang thêm..." : "Thêm vào giỏ"}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          {course.thumbnail_url && (
            <div className="w-full md:w-[420px] lg:w-[500px] shrink-0">
              <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `http://localhost:3000${course.thumbnail_url}`}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="bg-muted py-12">
        <div className="container mx-auto px-4 max-w-4xl space-y-8">
          {/* Description */}
          <div className="bg-card rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-card-foreground mb-4">Mô tả khóa học</h2>
            <p className="text-muted-foreground whitespace-pre-line">{course.description}</p>
          </div>

          {/* Curriculum */}
          <div className="bg-card rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-card-foreground mb-4">Nội dung khóa học</h2>
            {lessons.length > 0 ? (
              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted transition-colors duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      {lesson.order || index + 1}
                    </div>
                    <span className="flex-1 text-sm font-medium text-card-foreground">{lesson.title}</span>
                    <FileText size={20} className="text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Chưa có bài học nào</p>
            )}
          </div>
          {/* Reviews */}
          <div className="bg-card rounded-lg shadow-sm p-8">
            <ReviewSection courseId={id!} isEnrolled={isEnrolled} />
          </div>

          {/* Support */}
          {isAuthenticated && isEnrolled && (
            <div className="flex justify-end">
              <SupportTicketModal courseId={course.id} courseTitle={course.title} />
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CourseDetail;
