import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import CourseCardSkeleton from "@/components/CourseCardSkeleton";
import { BookOpen, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  created_at?: string;
}

interface Category {
  id: number;
  category_name: string;
}

const ITEMS_PER_PAGE = 9;

type SortOption = "newest" | "price_asc" | "price_desc" | "most_students";

const CoursesPage = () => {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchCourses();
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [activeCategory]);

  // Debounce search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 300);
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await courseService.getCategories();
      setCategories(data.categories || []);
    } catch {
      console.error("Error fetching categories");
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = activeCategory ? { category_id: activeCategory } : {};
      const data = await courseService.getAllCourses(params);
      setCourses(data.courses || []);
      setCurrentPage(1);
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khóa học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = courses.filter((c) =>
      c.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.instructor_name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    result = [...result].sort((a, b) => {
      if (sortBy === "price_asc") return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === "price_desc") return parseFloat(b.price) - parseFloat(a.price);
      if (sortBy === "most_students") return (b.student_count || 0) - (a.student_count || 0);
      // newest: default order from API
      return 0;
    });

    return result;
  }, [courses, debouncedSearch, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE));
  const paginatedCourses = filteredAndSorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryChange = (catId: number | null) => {
    setActiveCategory(catId);
    setSearchQuery("");
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Page Header */}
      <section className="bg-muted py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Tất cả khóa học</h1>
          <p className="text-muted-foreground mt-2">
            {loading ? "Đang tải..." : `Tìm thấy ${filteredAndSorted.length} khóa học`}
          </p>
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
                  onClick={() => handleCategoryChange(null)}
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
                    onClick={() => handleCategoryChange(cat.id)}
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
          <main className="flex-1 min-w-0">
            {/* Search + Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm khóa học, giảng viên..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <SlidersHorizontal size={16} className="text-muted-foreground" />
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortOption); setCurrentPage(1); }}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="price_asc">Giá tăng dần</SelectItem>
                    <SelectItem value="price_desc">Giá giảm dần</SelectItem>
                    <SelectItem value="most_students">Nhiều học viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : paginatedCourses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 page-enter">
                  {paginatedCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={{
                        id: course.id.toString(),
                        title: course.title,
                        description: course.description,
                        price: course.price,
                        instructor: course.instructor_name,
                        category: course.category_name,
                        thumbnail: course.thumbnail_url
                          ? (course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `http://localhost:3000${course.thumbnail_url}`)
                          : "/placeholder.svg",
                        lessons: 0,
                        students: course.student_count || 0,
                      }}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              isActive={currentPage === i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                              className="cursor-pointer"
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-card rounded-lg shadow-sm p-12 text-center">
                <BookOpen size={96} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-lg font-semibold text-card-foreground mb-2">
                  {debouncedSearch ? `Không tìm thấy kết quả cho "${debouncedSearch}"` : "Không tìm thấy khóa học nào"}
                </p>
                <Button
                  variant="default"
                  onClick={() => { handleCategoryChange(null); setSearchQuery(""); setDebouncedSearch(""); }}
                >
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
