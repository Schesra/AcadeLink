import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseCardSkeleton from "@/components/CourseCardSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, CheckCircle2, Clock, XCircle, PlayCircle } from "lucide-react";
import { courseService } from "@/services/courseService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Enrollment {
  enrollment_id: number;
  course_id: number;
  title: string;
  description: string;
  instructor_name: string;
  category_name: string;
  thumbnail_url?: string;
  lesson_count?: number;
  status: "pending" | "approved" | "rejected";
}

const getProgress = (courseId: number): number => {
  try {
    const raw = localStorage.getItem(`lesson_progress_${courseId}`);
    if (!raw) return 0;
    const completed: number[] = JSON.parse(raw);
    return completed.length;
  } catch {
    return 0;
  }
};

const EnrollmentCard = ({ enrollment }: { enrollment: Enrollment }) => {
  const totalLessons = enrollment.lesson_count || 0;
  const completedLessons = getProgress(enrollment.course_id);
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isCompleted = totalLessons > 0 && completedLessons >= totalLessons;

  return (
    <div className="bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={enrollment.thumbnail_url || "/placeholder.svg"}
          alt={enrollment.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 px-3 py-1 text-xs font-medium rounded-md bg-accent text-accent-foreground">
          {enrollment.category_name}
        </span>
        {isCompleted && (
          <span className="absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded-md bg-success text-success-foreground flex items-center gap-1">
            <CheckCircle2 size={12} /> Hoàn thành
          </span>
        )}
        {enrollment.status === "approved" && !isCompleted && (
          <Link
            to={`/learn/${enrollment.course_id}`}
            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity duration-200"
          >
            <PlayCircle size={48} className="text-white" />
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-bold text-card-foreground line-clamp-2 mb-1 hover:text-primary transition-colors duration-200">
          {enrollment.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">{enrollment.instructor_name}</p>

        {enrollment.status === "approved" && totalLessons > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{completedLessons}/{totalLessons} bài học</span>
              <span>{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>
        )}

        <div className="flex items-center justify-between">
          {enrollment.status === "pending" && (
            <Badge variant="outline" className="text-warning border-warning bg-warning-light gap-1">
              <Clock size={12} /> Chờ duyệt
            </Badge>
          )}
          {enrollment.status === "rejected" && (
            <Badge variant="outline" className="text-destructive border-destructive bg-destructive/10 gap-1">
              <XCircle size={12} /> Bị từ chối
            </Badge>
          )}
          {enrollment.status === "approved" && (
            <Badge variant="outline" className="text-success border-success bg-success-light gap-1">
              <CheckCircle2 size={12} /> Đã duyệt
            </Badge>
          )}

          {enrollment.status === "approved" && (
            <Link to={`/learn/${enrollment.course_id}`}>
              <Button size="sm" variant="default">Tiếp tục học</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyTab = ({ message, cta }: { message: string; cta?: boolean }) => (
  <div className="bg-card rounded-lg shadow-sm p-12 text-center">
    <BookOpen size={72} className="mx-auto text-muted-foreground/30 mb-4" />
    <p className="text-lg font-semibold text-card-foreground mb-2">{message}</p>
    {cta && (
      <Link to="/courses">
        <Button className="mt-2">Khám phá khóa học</Button>
      </Link>
    )}
  </div>
);

const MyCourses = () => {
  const [myCourses, setMyCourses] = useState<Enrollment[]>([]);
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
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khóa học của bạn",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approved = useMemo(() => myCourses.filter((e) => e.status === "approved"), [myCourses]);
  const pending = useMemo(() => myCourses.filter((e) => e.status === "pending"), [myCourses]);
  const rejected = useMemo(() => myCourses.filter((e) => e.status === "rejected"), [myCourses]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-muted py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Khóa học của tôi</h1>
          <p className="text-muted-foreground mt-2">
            {loading ? "Đang tải..." : `${myCourses.length} khóa học đã đăng ký`}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 flex-1">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : myCourses.length === 0 ? (
          <EmptyTab message="Bạn chưa đăng ký khóa học nào" cta />
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                Tất cả
                <Badge variant="secondary" className="ml-2 text-xs">{myCourses.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="approved">
                Đang học
                <Badge variant="secondary" className="ml-2 text-xs">{approved.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending">
                Chờ duyệt
                {pending.length > 0 && (
                  <Badge className="ml-2 text-xs bg-warning text-warning-foreground">{pending.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Bị từ chối
                {rejected.length > 0 && (
                  <Badge className="ml-2 text-xs bg-destructive text-destructive-foreground">{rejected.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {myCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 page-enter">
                  {myCourses.map((e) => <EnrollmentCard key={e.enrollment_id} enrollment={e} />)}
                </div>
              ) : <EmptyTab message="Không có khóa học nào" cta />}
            </TabsContent>

            <TabsContent value="approved">
              {approved.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 page-enter">
                  {approved.map((e) => <EnrollmentCard key={e.enrollment_id} enrollment={e} />)}
                </div>
              ) : <EmptyTab message="Bạn chưa được duyệt vào khóa học nào" cta />}
            </TabsContent>

            <TabsContent value="pending">
              {pending.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 page-enter">
                  {pending.map((e) => <EnrollmentCard key={e.enrollment_id} enrollment={e} />)}
                </div>
              ) : <EmptyTab message="Không có khóa học nào đang chờ duyệt" />}
            </TabsContent>

            <TabsContent value="rejected">
              {rejected.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 page-enter">
                  {rejected.map((e) => <EnrollmentCard key={e.enrollment_id} enrollment={e} />)}
                </div>
              ) : <EmptyTab message="Không có khóa học nào bị từ chối" />}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyCourses;
