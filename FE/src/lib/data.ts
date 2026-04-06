export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  instructor: string;
  price: string;
  students: number;
  lessons: number;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface Lesson {
  id: string;
  title: string;
  order: number;
  type: 'video' | 'text';
  videoUrl?: string;
  content?: string;
}

export const categories = [
  'Tất cả', 'Lập trình', 'Thiết kế', 'Marketing', 'Kinh doanh', 'Ngoại ngữ', 'Kỹ năng mềm'
];

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'React & TypeScript cho người mới bắt đầu',
    description: 'Học cách xây dựng ứng dụng web hiện đại với React và TypeScript từ cơ bản đến nâng cao.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=340&fit=crop',
    category: 'Lập trình',
    instructor: 'Nguyễn Văn A',
    price: '599.000₫',
    students: 1250,
    lessons: 24,
  },
  {
    id: '2',
    title: 'UI/UX Design với Figma',
    description: 'Thành thạo thiết kế giao diện và trải nghiệm người dùng bằng Figma.',
    thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&h=340&fit=crop',
    category: 'Thiết kế',
    instructor: 'Trần Thị B',
    price: '499.000₫',
    students: 890,
    lessons: 18,
  },
  {
    id: '3',
    title: 'Digital Marketing A-Z',
    description: 'Chiến lược marketing số toàn diện từ SEO, SEM đến Social Media.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop',
    category: 'Marketing',
    instructor: 'Lê Văn C',
    price: '699.000₫',
    students: 2100,
    lessons: 32,
  },
  {
    id: '4',
    title: 'Python cho Data Science',
    description: 'Phân tích dữ liệu và machine learning với Python, Pandas, và Scikit-learn.',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=340&fit=crop',
    category: 'Lập trình',
    instructor: 'Phạm Văn D',
    price: '799.000₫',
    students: 1680,
    lessons: 28,
  },
  {
    id: '5',
    title: 'Khởi nghiệp và Quản lý doanh nghiệp',
    description: 'Từ ý tưởng đến thực thi - xây dựng và vận hành doanh nghiệp thành công.',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=340&fit=crop',
    category: 'Kinh doanh',
    instructor: 'Hoàng Thị E',
    price: '899.000₫',
    students: 750,
    lessons: 20,
  },
  {
    id: '6',
    title: 'IELTS 7.0+ - Lộ trình toàn diện',
    description: 'Chinh phục IELTS với phương pháp học hiệu quả, bao gồm 4 kỹ năng.',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=340&fit=crop',
    category: 'Ngoại ngữ',
    instructor: 'Đỗ Văn F',
    price: '1.299.000₫',
    students: 3200,
    lessons: 40,
  },
];

export const mockLessons: Lesson[] = [
  { id: 'l1', title: 'Giới thiệu khóa học', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', content: 'Chào mừng bạn đến với khóa học! Trong bài này, chúng ta sẽ tìm hiểu tổng quan về nội dung khóa học.' },
  { id: 'l2', title: 'Cài đặt môi trường', order: 2, type: 'text', content: 'Hướng dẫn chi tiết cách cài đặt môi trường phát triển bao gồm Node.js, VS Code và các extension cần thiết.' },
  { id: 'l3', title: 'Kiến thức nền tảng', order: 3, type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', content: 'Tìm hiểu các khái niệm cơ bản và nền tảng quan trọng.' },
  { id: 'l4', title: 'Thực hành dự án đầu tiên', order: 4, type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', content: 'Bắt tay vào xây dựng dự án thực tế đầu tiên.' },
  { id: 'l5', title: 'Tổng kết và bài tập', order: 5, type: 'text', content: 'Ôn tập kiến thức đã học và hoàn thành bài tập thực hành.' },
];
