import { Link } from "react-router-dom";
import type { Course } from "@/lib/data";

interface CourseCardProps {
  course: Course;
  showStatus?: boolean;
}

const statusConfig = {
  pending: { label: "Chờ duyệt", className: "bg-warning-light text-warning" },
  approved: { label: "Đã duyệt", className: "bg-success-light text-success" },
  rejected: { label: "Từ chối", className: "bg-destructive/10 text-destructive" },
};

const CourseCard = ({ course, showStatus }: CourseCardProps) => {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="group bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden shrink-0">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Category Badge */}
        <span className="absolute top-3 left-3 px-3 py-1 text-xs font-medium rounded-md bg-accent text-accent-foreground">
          {course.category}
        </span>
        {/* Status Badge */}
        {showStatus && course.status && (
          <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded-md ${statusConfig[course.status].className}`}>
            {statusConfig[course.status].label}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-card-foreground line-clamp-2 mb-2 min-h-[3.5rem] group-hover:text-primary transition-colors duration-200">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
          {course.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm text-muted-foreground">{course.instructor}</span>
          <span className="text-base font-bold text-primary">
            {isNaN(Number(course.price))
              ? course.price
              : `${Number(course.price).toLocaleString('vi-VN')}đ`}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
