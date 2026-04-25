import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle, Pencil, Trash2, ArrowLeft, BookOpen,
  Video, GripVertical, FileText, HelpCircle, CheckCircle2
} from "lucide-react";
import api from "@/services/api";

type LessonType = "text" | "video" | "quiz";

interface Lesson {
  id: number;
  course_id: number;
  title: string;
  content: string | null;
  video_url: string | null;
  lesson_type: LessonType;
  order: number;
}

interface LessonForm {
  title: string;
  content: string;
  video_url: string;
  lesson_type: LessonType;
  order: number;
}

interface QuizQuestion {
  id: number;
  lesson_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_option: string;
  order: number;
}

interface QuestionForm {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  order: number;
}

const emptyLessonForm: LessonForm = {
  title: "", content: "", video_url: "", lesson_type: "text", order: 1
};

const emptyQuestionForm: QuestionForm = {
  question: "", option_a: "", option_b: "", option_c: "", option_d: "",
  correct_option: "a", order: 1
};

const LESSON_TYPE_LABELS: Record<LessonType, { label: string; icon: React.ReactNode; color: string }> = {
  text: { label: "Bài đọc", icon: <FileText size={14} />, color: "text-blue-600 bg-blue-50" },
  video: { label: "Video", icon: <Video size={14} />, color: "text-red-600 bg-red-50" },
  quiz: { label: "Bài kiểm tra", icon: <HelpCircle size={14} />, color: "text-purple-600 bg-purple-50" },
};

const CourseLessons = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // Lesson modal state
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonForm>(emptyLessonForm);
  const [submittingLesson, setSubmittingLesson] = useState(false);

  // Quiz question modal state
  const [quizLesson, setQuizLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionForm>(emptyQuestionForm);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, lessonsRes] = await Promise.all([
        api.get("/instructor/courses"),
        api.get("/instructor/lessons"),
      ]);
      const course = (coursesRes.data.courses || []).find(
        (c: any) => c.id === Number(courseId)
      );
      if (!course) {
        toast({ title: "Lỗi", description: "Không tìm thấy khóa học", variant: "destructive" });
        navigate("/instructor/courses");
        return;
      }
      setCourseTitle(course.title);
      const filtered = (lessonsRes.data.lessons || [])
        .filter((l: Lesson) => l.course_id === Number(courseId))
        .sort((a: Lesson, b: Lesson) => a.order - b.order);
      setLessons(filtered);
    } catch {
      toast({ title: "Lỗi", description: "Không thể tải dữ liệu", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ===== LESSON MODAL =====
  const openCreateLesson = () => {
    const nextOrder = lessons.length > 0 ? Math.max(...lessons.map((l) => l.order)) + 1 : 1;
    setLessonForm({ ...emptyLessonForm, order: nextOrder });
    setEditingLesson(null);
    setShowLessonModal(true);
  };

  const openEditLesson = (lesson: Lesson) => {
    setLessonForm({
      title: lesson.title,
      content: lesson.content || "",
      video_url: lesson.video_url || "",
      lesson_type: lesson.lesson_type || "text",
      order: lesson.order,
    });
    setEditingLesson(lesson);
    setShowLessonModal(true);
  };

  const closeLessonModal = () => {
    setShowLessonModal(false);
    setEditingLesson(null);
    setLessonForm(emptyLessonForm);
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) {
      toast({ title: "Lỗi", description: "Vui lòng nhập tiêu đề bài học", variant: "destructive" });
      return;
    }
    setSubmittingLesson(true);
    try {
      const payload = {
        course_id: Number(courseId),
        title: lessonForm.title.trim(),
        content: lessonForm.content.trim() || null,
        video_url: lessonForm.video_url.trim() || null,
        lesson_type: lessonForm.lesson_type,
        order: lessonForm.order,
      };
      if (editingLesson) {
        await api.put(`/instructor/lessons/${editingLesson.id}`, payload);
        toast({ title: "Thành công", description: "Đã cập nhật bài học" });
      } else {
        await api.post("/instructor/lessons", payload);
        toast({ title: "Thành công", description: "Đã tạo bài học mới" });
      }
      closeLessonModal();
      fetchData();
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.response?.data?.message || "Thao tác thất bại", variant: "destructive" });
    } finally {
      setSubmittingLesson(false);
    }
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!confirm(`Bạn có chắc muốn xóa bài học "${lesson.title}"?`)) return;
    try {
      await api.delete(`/instructor/lessons/${lesson.id}`);
      toast({ title: "Thành công", description: "Đã xóa bài học" });
      fetchData();
      if (quizLesson?.id === lesson.id) setQuizLesson(null);
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.response?.data?.message || "Xóa thất bại", variant: "destructive" });
    }
  };

  // ===== QUIZ QUESTION MANAGER =====
  const openQuizManager = async (lesson: Lesson) => {
    setQuizLesson(lesson);
    setShowQuestionForm(false);
    setEditingQuestion(null);
    setQuestionForm(emptyQuestionForm);
    await fetchQuestions(lesson.id);
  };

  const fetchQuestions = async (lessonId: number) => {
    setLoadingQuestions(true);
    try {
      const res = await api.get(`/instructor/lessons/${lessonId}/questions`);
      setQuestions(res.data.questions || []);
    } catch {
      toast({ title: "Lỗi", description: "Không thể tải câu hỏi", variant: "destructive" });
    } finally {
      setLoadingQuestions(false);
    }
  };

  const openAddQuestion = () => {
    const nextOrder = questions.length > 0 ? Math.max(...questions.map((q) => q.order)) + 1 : 1;
    setQuestionForm({ ...emptyQuestionForm, order: nextOrder });
    setEditingQuestion(null);
    setShowQuestionForm(true);
  };

  const openEditQuestion = (q: QuizQuestion) => {
    setQuestionForm({
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c || "",
      option_d: q.option_d || "",
      correct_option: q.correct_option,
      order: q.order,
    });
    setEditingQuestion(q);
    setShowQuestionForm(true);
  };

  const closeQuestionForm = () => {
    setShowQuestionForm(false);
    setEditingQuestion(null);
    setQuestionForm(emptyQuestionForm);
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.question.trim() || !questionForm.option_a.trim() || !questionForm.option_b.trim()) {
      toast({ title: "Lỗi", description: "Vui lòng điền câu hỏi và ít nhất đáp án A, B", variant: "destructive" });
      return;
    }
    setSubmittingQuestion(true);
    try {
      const payload = {
        question: questionForm.question.trim(),
        option_a: questionForm.option_a.trim(),
        option_b: questionForm.option_b.trim(),
        option_c: questionForm.option_c.trim() || null,
        option_d: questionForm.option_d.trim() || null,
        correct_option: questionForm.correct_option,
        order: questionForm.order,
      };
      if (editingQuestion) {
        await api.put(`/instructor/questions/${editingQuestion.id}`, payload);
        toast({ title: "Thành công", description: "Đã cập nhật câu hỏi" });
      } else {
        await api.post(`/instructor/lessons/${quizLesson!.id}/questions`, payload);
        toast({ title: "Thành công", description: "Đã thêm câu hỏi" });
      }
      closeQuestionForm();
      fetchQuestions(quizLesson!.id);
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.response?.data?.message || "Thao tác thất bại", variant: "destructive" });
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (q: QuizQuestion) => {
    if (!confirm(`Xóa câu hỏi "${q.question.slice(0, 40)}..."?`)) return;
    try {
      await api.delete(`/instructor/questions/${q.id}`);
      toast({ title: "Thành công", description: "Đã xóa câu hỏi" });
      fetchQuestions(quizLesson!.id);
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.response?.data?.message || "Xóa thất bại", variant: "destructive" });
    }
  };

  const OPTION_LABELS = ["a", "b", "c", "d"];
  const OPTION_KEYS: (keyof QuestionForm)[] = ["option_a", "option_b", "option_c", "option_d"];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Link to="/instructor/courses" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft size={14} /> Khóa học của tôi
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium line-clamp-1">{courseTitle}</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quản lý bài học</h1>
            {courseTitle && <p className="text-muted-foreground text-sm mt-1">{courseTitle}</p>}
          </div>
          <Button onClick={openCreateLesson} className="gap-2">
            <PlusCircle size={16} /> Thêm bài học
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Đang tải...</p>
        ) : lessons.length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm p-12 text-center">
            <BookOpen size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">Khóa học chưa có bài học nào</p>
            <Button onClick={openCreateLesson} className="gap-2">
              <PlusCircle size={16} /> Thêm bài học đầu tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson) => {
              const typeInfo = LESSON_TYPE_LABELS[lesson.lesson_type || "text"];
              return (
                <div key={lesson.id} className="bg-card rounded-lg shadow-sm p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
                  <div className="text-muted-foreground mt-1"><GripVertical size={16} /></div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                    {lesson.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-card-foreground">{lesson.title}</h3>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                        {typeInfo.icon} {typeInfo.label}
                      </span>
                    </div>
                    {lesson.lesson_type === "text" && lesson.content && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{lesson.content}</p>
                    )}
                    {lesson.lesson_type === "video" && lesson.video_url && (
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <Video size={12} />
                        <span className="truncate max-w-xs">{lesson.video_url}</span>
                      </div>
                    )}
                    {lesson.lesson_type === "quiz" && (
                      <Button size="sm" variant="outline"
                        className="mt-1 gap-1 border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-400"
                        onClick={() => openQuizManager(lesson)}>
                        <HelpCircle size={14} /> Quản lý câu hỏi
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => openEditLesson(lesson)}>
                      <Pencil size={14} /> Sửa
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteLesson(lesson)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />

      {/* ===== LESSON MODAL ===== */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">
              {editingLesson ? "Chỉnh sửa bài học" : "Thêm bài học mới"}
            </h2>
            <form onSubmit={handleLessonSubmit} className="space-y-4">
              {/* Loại bài học */}
              <div>
                <Label>Loại bài học *</Label>
                <div className="flex gap-3 mt-2">
                  {(["text", "video", "quiz"] as LessonType[]).map((type) => {
                    const info = LESSON_TYPE_LABELS[type];
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setLessonForm({ ...lessonForm, lesson_type: type })}
                        className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                          lessonForm.lesson_type === type
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-input hover:border-primary/50"
                        }`}
                      >
                        {info.icon}
                        {info.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label htmlFor="lesson-title">Tiêu đề *</Label>
                <Input id="lesson-title" value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="Nhập tiêu đề bài học" className="mt-1" required />
              </div>

              <div>
                <Label htmlFor="lesson-order">Thứ tự *</Label>
                <Input id="lesson-order" type="number" min={1} value={lessonForm.order}
                  onChange={(e) => setLessonForm({ ...lessonForm, order: Number(e.target.value) })}
                  className="mt-1" required />
              </div>

              {lessonForm.lesson_type === "video" && (
                <div>
                  <Label htmlFor="lesson-video">URL Video (YouTube)</Label>
                  <Input id="lesson-video" value={lessonForm.video_url}
                    onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... hoặc https://youtu.be/..."
                    className="mt-1" />
                </div>
              )}

              {lessonForm.lesson_type === "text" && (
                <div>
                  <Label htmlFor="lesson-content">Nội dung</Label>
                  <textarea id="lesson-content" value={lessonForm.content}
                    onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                    placeholder="Nhập nội dung bài học..." rows={5}
                    className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
              )}

              {lessonForm.lesson_type === "quiz" && (
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-sm text-purple-700">
                  Sau khi lưu bài học, nhấn <strong>"Quản lý câu hỏi"</strong> để thêm câu hỏi trắc nghiệm.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submittingLesson} className="flex-1">
                  {submittingLesson ? "Đang xử lý..." : editingLesson ? "Lưu thay đổi" : "Thêm bài học"}
                </Button>
                <Button type="button" variant="outline" onClick={closeLessonModal}>Hủy</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== QUIZ QUESTION MANAGER PANEL ===== */}
      {quizLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b flex items-center justify-between shrink-0">
              <div>
                <p className="text-xs text-muted-foreground">Bài trắc nghiệm</p>
                <h2 className="text-lg font-bold">{quizLesson.title}</h2>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={openAddQuestion} className="gap-1">
                  <PlusCircle size={14} /> Thêm câu hỏi
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setQuizLesson(null); setShowQuestionForm(false); }}>
                  Đóng
                </Button>
              </div>
            </div>

            {/* Question list */}
            <div className="overflow-y-auto flex-1 p-5 space-y-3">
              {loadingQuestions ? (
                <p className="text-muted-foreground text-sm">Đang tải câu hỏi...</p>
              ) : questions.length === 0 && !showQuestionForm ? (
                <div className="text-center py-8">
                  <HelpCircle size={36} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-sm">Chưa có câu hỏi nào</p>
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div key={q.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="font-medium text-sm flex-1">
                        <span className="text-muted-foreground mr-1">Câu {idx + 1}.</span>
                        {q.question}
                      </p>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEditQuestion(q)}>
                          <Pencil size={13} />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteQuestion(q)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(["a", "b", "c", "d"] as const).map((opt) => {
                        const key = `option_${opt}` as keyof QuizQuestion;
                        const text = q[key] as string | null;
                        if (!text) return null;
                        const isCorrect = q.correct_option === opt;
                        return (
                          <div key={opt} className={`flex items-center gap-2 p-2 rounded-md text-xs ${isCorrect ? "bg-green-50 border border-green-300 text-green-700" : "bg-muted"}`}>
                            {isCorrect ? <CheckCircle2 size={12} className="text-green-600 shrink-0" /> : <span className="w-3 h-3 rounded-full border border-muted-foreground/40 shrink-0" />}
                            <span className="font-medium uppercase mr-1">{opt}.</span>
                            <span>{text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}

              {/* Add/Edit question form */}
              {showQuestionForm && (
                <div className="border-2 border-primary/30 rounded-lg p-4 bg-primary/5">
                  <h3 className="font-semibold text-sm mb-3">
                    {editingQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
                  </h3>
                  <form onSubmit={handleQuestionSubmit} className="space-y-3">
                    <div>
                      <Label className="text-xs">Câu hỏi *</Label>
                      <textarea value={questionForm.question}
                        onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                        placeholder="Nhập câu hỏi..." rows={2}
                        className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        required />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {OPTION_KEYS.map((key, i) => {
                        const opt = OPTION_LABELS[i];
                        const required = opt === "a" || opt === "b";
                        return (
                          <div key={key}>
                            <Label className="text-xs">
                              Đáp án {opt.toUpperCase()} {required ? "*" : "(tùy chọn)"}
                            </Label>
                            <Input
                              value={questionForm[key] as string}
                              onChange={(e) => setQuestionForm({ ...questionForm, [key]: e.target.value })}
                              placeholder={`Đáp án ${opt.toUpperCase()}`}
                              className="mt-1 text-sm h-8"
                              required={required}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      <Label className="text-xs">Đáp án đúng *</Label>
                      <div className="flex gap-2 mt-1">
                        {OPTION_LABELS.map((opt) => {
                          const key = `option_${opt}` as keyof QuestionForm;
                          const hasValue = !!(questionForm[key] as string)?.trim();
                          if (!hasValue && opt !== "a" && opt !== "b") return null;
                          return (
                            <button key={opt} type="button"
                              onClick={() => setQuestionForm({ ...questionForm, correct_option: opt })}
                              className={`px-3 py-1.5 rounded-md text-sm font-medium border-2 transition-colors ${
                                questionForm.correct_option === opt
                                  ? "border-green-500 bg-green-50 text-green-700"
                                  : "border-input hover:border-green-400"
                              }`}>
                              {opt.toUpperCase()}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Thứ tự</Label>
                      <Input type="number" min={1} value={questionForm.order}
                        onChange={(e) => setQuestionForm({ ...questionForm, order: Number(e.target.value) })}
                        className="mt-1 text-sm h-8 w-24" />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button type="submit" size="sm" disabled={submittingQuestion}>
                        {submittingQuestion ? "Đang lưu..." : editingQuestion ? "Lưu thay đổi" : "Thêm câu hỏi"}
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={closeQuestionForm}>Hủy</Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseLessons;
