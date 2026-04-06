import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { mockCourses, mockLessons } from "@/lib/data";
import { ArrowLeft, Menu, Video, FileText } from "lucide-react";

const LearnCourse = () => {
  const { id } = useParams();
  const course = mockCourses.find((c) => c.id === id);
  const [currentLessonId, setCurrentLessonId] = useState(mockLessons[0]?.id);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentLesson = mockLessons.find((l) => l.id === currentLessonId) || mockLessons[0];

  if (!course) return null;

  return (
    <div className="h-screen flex bg-foreground text-primary-foreground overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-80 shrink-0 bg-[hsl(220,20%,12%)] flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-[hsl(220,13%,20%)]">
            <Link to={`/courses/${course.id}`} className="flex items-center gap-2 text-primary-light text-sm hover:text-primary transition-colors mb-3">
              <ArrowLeft size={16} /> Quay lại
            </Link>
            <h2 className="text-lg font-semibold line-clamp-2">{course.title}</h2>
          </div>
          <div className="p-4 space-y-2">
            {mockLessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => setCurrentLessonId(lesson.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm transition-colors duration-200 ${
                  currentLessonId === lesson.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-[hsl(220,13%,22%)] hover:bg-[hsl(220,13%,30%)]"
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-[hsl(220,13%,35%)] flex items-center justify-center text-xs shrink-0">
                  {lesson.order}
                </span>
                <span className="line-clamp-2">{lesson.title}</span>
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top bar */}
        <div className="bg-[hsl(220,20%,12%)] p-4 flex items-center gap-4 shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded hover:bg-[hsl(220,13%,22%)] transition-colors">
            <Menu size={20} />
          </button>
          <h3 className="text-lg font-semibold">{currentLesson.title}</h3>
        </div>

        {/* Video */}
        {currentLesson.type === 'video' && currentLesson.videoUrl && (
          <div className="w-full max-w-[1280px] mx-auto p-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={currentLesson.videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={currentLesson.title}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-[1280px] mx-auto w-full p-4">
          <div className="bg-[hsl(220,20%,12%)] rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{currentLesson.title}</h2>
            {currentLesson.content ? (
              <p className="text-primary-foreground/90 whitespace-pre-line">{currentLesson.content}</p>
            ) : (
              <p className="text-[hsl(220,13%,50%)]">Bài học này chưa có nội dung.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearnCourse;
