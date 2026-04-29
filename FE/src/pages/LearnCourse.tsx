import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, CheckCircle2, Circle, FileText, Video, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { courseService } from "@/services/courseService";
import { useToast } from "@/hooks/use-toast";
import SupportTicketModal from "@/components/SupportTicketModal";

type LessonType = "text" | "video" | "quiz";

interface QuizQuestion {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_option: string;
  order: number;
}

interface Lesson {
  id: number;
  title: string;
  content: string | null;
  video_url: string | null;
  lesson_type: LessonType;
  order: number;
  questions?: QuizQuestion[];
}

interface Course {
  id: number;
  title: string;
}

const STORAGE_KEY = (courseId: string) => `lesson_progress_${courseId}`;

const getCompletedLessons = (courseId: string): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(courseId));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
};

const saveCompletedLessons = (courseId: string, completed: Set<string>) => {
  localStorage.setItem(STORAGE_KEY(courseId), JSON.stringify([...completed]));
};

const getYouTubeEmbedUrl = (url: string): string => {
  try {
    if (url.includes("youtube.com/embed/")) return url;
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    const watchMatch = url.match(/[?&]v=([^?&]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  } catch { /* ignore */ }
  return url;
};

// ===== QUIZ COMPONENT =====
interface QuizViewProps {
  questions: QuizQuestion[];
  onComplete: () => void;
  alreadyCompleted: boolean;
}

const QuizView = ({ questions, onComplete, alreadyCompleted }: QuizViewProps) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Reset khi chuyển bài
  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  }, [questions]);

  const handleSubmit = () => {
    let correct = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correct_option) correct++;
    }
    setScore(correct);
    setSubmitted(true);
    if (correct === questions.length) onComplete();
  };

  const allAnswered = questions.every((q) => answers[q.id]);
  const OPTION_LABELS = ["a", "b", "c", "d"] as const;

  if (questions.length === 0) {
    return (
      <div className="text-center py-10 text-[hsl(210,20%,45%)]">
        <HelpCircle size={36} className="mx-auto mb-2 opacity-40" />
        <p>Bài quiz chưa có câu hỏi nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {submitted && (
        <div className={`rounded-lg p-4 text-center font-semibold ${score === questions.length ? "bg-green-900/30 text-green-400 border border-green-700" : score >= questions.length / 2 ? "bg-yellow-900/30 text-yellow-400 border border-yellow-700" : "bg-red-900/30 text-red-400 border border-red-700"}`}>
          Kết quả: {score}/{questions.length} câu đúng
          {score === questions.length && " — Xuất sắc!"}
        </div>
      )}

      {questions.map((q, idx) => {
        const isSubmitted = submitted;
        return (
          <div key={q.id} className="bg-[hsl(222,25%,16%)] rounded-lg p-5 border border-[hsl(222,20%,22%)]">
            <p className="font-medium mb-4 text-[hsl(210,20%,90%)]">
              <span className="text-primary mr-2">Câu {idx + 1}.</span>
              {q.question}
            </p>
            <div className="space-y-2">
              {OPTION_LABELS.map((opt) => {
                const key = `option_${opt}` as keyof QuizQuestion;
                const text = q[key] as string | null;
                if (!text) return null;
                const selected = answers[q.id] === opt;
                const isCorrect = opt === q.correct_option;

                let style = "border-[hsl(222,20%,28%)] bg-[hsl(222,20%,18%)] hover:border-primary/60 cursor-pointer";
                if (isSubmitted) {
                  if (isCorrect) style = "border-green-500 bg-green-900/30 text-green-300 cursor-default";
                  else if (selected) style = "border-red-500 bg-red-900/30 text-red-400 cursor-default line-through";
                  else style = "border-[hsl(222,20%,22%)] opacity-50 cursor-default";
                } else if (selected) {
                  style = "border-primary bg-primary/20 cursor-pointer";
                }

                return (
                  <button key={opt} type="button"
                    disabled={isSubmitted}
                    onClick={() => !isSubmitted && setAnswers({ ...answers, [q.id]: opt })}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left text-sm transition-colors ${style}`}
                  >
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 uppercase ${selected && !isSubmitted ? "border-primary text-primary" : isSubmitted && isCorrect ? "border-green-500 text-green-400" : "border-current opacity-60"}`}>
                      {opt}
                    </span>
                    {text}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {!submitted ? (
        <Button onClick={handleSubmit} disabled={!allAnswered} className="w-full">
          {allAnswered ? "Nộp bài" : `Còn ${questions.filter((q) => !answers[q.id]).length} câu chưa trả lời`}
        </Button>
      ) : (
        <Button variant="outline" onClick={() => { setAnswers({}); setSubmitted(false); setScore(0); }}
          className="w-full border-[hsl(222,20%,30%)] text-[hsl(210,20%,70%)] hover:text-white">
          Làm lại
        </Button>
      )}
    </div>
  );
};

// ===== MAIN COMPONENT =====
const LearnCourse = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseData, lessonsData] = await Promise.all([
        courseService.getCourseById(id!),
        courseService.getCourseLessons(id!),
      ]);

      const fetchedLessons: Lesson[] = (lessonsData.lessons || []).sort(
        (a: Lesson, b: Lesson) => a.order - b.order
      );

      setCourse(courseData.course);
      setLessons(fetchedLessons);
      if (fetchedLessons.length > 0) setCurrentLessonId(String(fetchedLessons[0].id));

      // Load progress từ backend, fallback về localStorage
      try {
        const progressData = await courseService.getCourseProgress(id!);
        const backendIds = new Set<string>((progressData.completed_lesson_ids || []).map(String));
        // Merge với localStorage để không mất data cũ
        const localIds = getCompletedLessons(id!);
        const merged = new Set([...backendIds, ...localIds]);
        setCompletedLessons(merged);
        saveCompletedLessons(id!, merged);
      } catch {
        setCompletedLessons(getCompletedLessons(id!));
      }
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 403) {
        toast({
          title: "Truy cập bị từ chối",
          description: error.response?.data?.message || "Bạn chưa được duyệt vào khóa học này",
          variant: "destructive",
        });
        navigate("/my-courses");
      } else if (status === 401) {
        navigate("/login");
      } else {
        toast({ title: "Lỗi", description: "Không thể tải bài học", variant: "destructive" });
        navigate("/my-courses");
      }
    } finally {
      setLoading(false);
    }
  };

  const currentLesson = lessons.find((l) => String(l.id) === currentLessonId) ?? lessons[0];
  const totalLessons = lessons.length;
  const completedCount = completedLessons.size;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const markComplete = useCallback(() => {
    if (!currentLessonId || !id) return;
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      next.add(currentLessonId);
      saveCompletedLessons(id, next);
      return next;
    });
    courseService.completeLesson(Number(currentLessonId)).catch(() => {});
  }, [currentLessonId, id]);

  const toggleComplete = useCallback(() => {
    if (!currentLessonId || !id) return;
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(currentLessonId)) {
        next.delete(currentLessonId);
        courseService.uncompleteLesson(Number(currentLessonId)).catch(() => {});
      } else {
        next.add(currentLessonId);
        courseService.completeLesson(Number(currentLessonId)).catch(() => {});
      }
      saveCompletedLessons(id, next);
      return next;
    });
  }, [currentLessonId, id]);

  const goToNext = useCallback(() => {
    const idx = lessons.findIndex((l) => String(l.id) === currentLessonId);
    if (idx < lessons.length - 1) setCurrentLessonId(String(lessons[idx + 1].id));
  }, [currentLessonId, lessons]);

  const LESSON_TYPE_ICON: Record<LessonType, React.ReactNode> = {
    text: <FileText size={13} />,
    video: <Video size={13} />,
    quiz: <HelpCircle size={13} />,
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[hsl(222,25%,10%)] text-white">
        <p>Đang tải bài học...</p>
      </div>
    );
  }

  if (!course || lessons.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-[hsl(222,25%,10%)] text-white flex-col gap-4">
        <p className="text-lg">Khóa học chưa có bài học nào.</p>
        <Link to="/my-courses" className="text-primary hover:underline">Quay lại khóa học của tôi</Link>
      </div>
    );
  }

  const isCurrentCompleted = completedLessons.has(currentLessonId);
  const currentIdx = lessons.findIndex((l) => String(l.id) === currentLessonId);
  const lessonType = currentLesson?.lesson_type || "text";

  return (
    <div className="h-screen flex bg-[hsl(222,25%,10%)] text-primary-foreground overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-80 shrink-0 bg-[hsl(222,25%,12%)] flex flex-col overflow-y-auto border-r border-[hsl(222,20%,20%)]">
          <div className="p-4 border-b border-[hsl(222,20%,20%)]">
            <Link to={`/courses/${course.id}`}
              className="flex items-center gap-2 text-primary text-sm hover:text-primary/80 transition-colors mb-3">
              <ArrowLeft size={16} /> Quay lại khóa học
            </Link>
            <h2 className="text-base font-semibold line-clamp-2 text-white mb-3">{course.title}</h2>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[hsl(210,20%,60%)]">
                <span>{completedCount}/{totalLessons} bài hoàn thành</span>
                <span>{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-1.5 bg-[hsl(222,20%,22%)]" />
            </div>
          </div>

          <div className="p-3 space-y-1 flex-1">
            {lessons.map((lesson) => {
              const isDone = completedLessons.has(String(lesson.id));
              const isCurrent = currentLessonId === String(lesson.id);
              const type = lesson.lesson_type || "text";
              return (
                <button key={lesson.id} onClick={() => setCurrentLessonId(String(lesson.id))}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm transition-colors duration-200 ${isCurrent ? "bg-primary text-primary-foreground" : "bg-[hsl(222,20%,18%)] hover:bg-[hsl(222,20%,24%)] text-[hsl(210,20%,80%)]"}`}>
                  {isDone ? (
                    <CheckCircle2 size={16} className={isCurrent ? "text-primary-foreground shrink-0" : "text-primary shrink-0"} />
                  ) : (
                    <Circle size={16} className="shrink-0 opacity-40" />
                  )}
                  <span className="flex-1 line-clamp-2">{lesson.title}</span>
                  <span className={`shrink-0 opacity-60 ${isCurrent ? "text-primary-foreground" : ""}`}>
                    {LESSON_TYPE_ICON[type]}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top bar */}
        <div className="bg-[hsl(222,25%,12%)] px-4 py-3 flex items-center gap-4 shrink-0 border-b border-[hsl(222,20%,20%)]">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded hover:bg-[hsl(222,20%,20%)] transition-colors shrink-0">
            <Menu size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[hsl(210,20%,50%)] truncate">{course.title}</p>
            <h3 className="text-sm font-semibold truncate">{currentLesson?.title}</h3>
          </div>
          <div className="text-xs text-[hsl(210,20%,50%)] shrink-0">{progressPct}% hoàn thành</div>
          <SupportTicketModal courseId={course.id} courseTitle={course.title} />
        </div>

        {/* Video lesson */}
        {lessonType === "video" && currentLesson?.video_url && (
          <div className="w-full max-w-[1280px] mx-auto p-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={getYouTubeEmbedUrl(currentLesson.video_url)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={currentLesson.title}
              />
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="max-w-[1280px] mx-auto w-full p-4 flex-1">
          <div className="bg-[hsl(222,25%,14%)] rounded-lg p-6 border border-[hsl(222,20%,20%)]">
            <h2 className="text-xl font-bold mb-4">{currentLesson?.title}</h2>

            {/* TEXT lesson */}
            {lessonType === "text" && (
              currentLesson?.content ? (
                <p className="text-[hsl(210,20%,80%)] whitespace-pre-line leading-relaxed">
                  {currentLesson.content}
                </p>
              ) : (
                <p className="text-[hsl(210,20%,45%)]">Bài học này chưa có nội dung.</p>
              )
            )}

            {/* VIDEO lesson — show description below video */}
            {lessonType === "video" && currentLesson?.content && (
              <p className="text-[hsl(210,20%,80%)] whitespace-pre-line leading-relaxed">
                {currentLesson.content}
              </p>
            )}
            {lessonType === "video" && !currentLesson?.video_url && !currentLesson?.content && (
              <p className="text-[hsl(210,20%,45%)]">Bài học video chưa có nội dung.</p>
            )}

            {/* QUIZ lesson */}
            {lessonType === "quiz" && (
              <QuizView
                questions={currentLesson?.questions || []}
                onComplete={markComplete}
                alreadyCompleted={isCurrentCompleted}
              />
            )}

            {/* Action buttons (not for quiz — quiz has its own submit) */}
            {lessonType !== "quiz" && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-[hsl(222,20%,22%)]">
                <Button onClick={toggleComplete}
                  variant={isCurrentCompleted ? "outline" : "default"}
                  className={isCurrentCompleted ? "border-primary text-primary hover:bg-primary/10" : ""}>
                  {isCurrentCompleted ? (
                    <><CheckCircle2 size={16} className="mr-2" /> Đã hoàn thành</>
                  ) : "Đánh dấu hoàn thành"}
                </Button>
                {currentIdx < lessons.length - 1 && (
                  <Button variant="ghost" onClick={goToNext} className="text-[hsl(210,20%,70%)] hover:text-white">
                    Bài tiếp theo →
                  </Button>
                )}
              </div>
            )}

            {/* Quiz: next button after submit */}
            {lessonType === "quiz" && currentIdx < lessons.length - 1 && isCurrentCompleted && (
              <div className="mt-6 pt-6 border-t border-[hsl(222,20%,22%)] flex justify-end">
                <Button variant="ghost" onClick={goToNext} className="text-[hsl(210,20%,70%)] hover:text-white">
                  Bài tiếp theo →
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearnCourse;
