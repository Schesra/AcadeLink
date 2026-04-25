const db = require('./database');
const bcrypt = require('bcrypt');

/**
 * Seed dữ liệu mẫu vào MySQL database
 */
async function seedDatabase() {
  try {
    console.log('🌱 Seeding MySQL database...');

    // 1. Tạo users
    const password = await bcrypt.hash('Password123@', 10);
    
    await db.query(`
      INSERT IGNORE INTO users (id, username, email, password_hash, full_name)
      VALUES 
        (1, 'admin', 'admin@acadelink.com', ?, 'Admin User'),
        (2, 'instructor1', 'instructor1@acadelink.com', ?, 'Instructor One'),
        (3, 'student1', 'student1@acadelink.com', ?, 'Student One'),
        (4, 'student2', 'student2@acadelink.com', ?, 'Student Two')
    `, [password, password, password, password]);
    console.log('✅ Users seeded');

    // 2. Tạo user roles
    await db.query(`
      INSERT IGNORE INTO user_roles (user_id, role)
      VALUES 
        (1, 'admin'),
        (1, 'instructor'),
        (2, 'instructor'),
        (3, 'student'),
        (4, 'student')
    `);
    console.log('✅ User roles seeded');

    // 3. Tạo categories
    await db.query(`
      INSERT IGNORE INTO categories (id, category_name, description)
      VALUES 
        (1, 'Programming', 'Learn programming languages and frameworks'),
        (2, 'Design', 'Graphic design, UI/UX, and creative skills'),
        (3, 'Business', 'Business management and entrepreneurship'),
        (4, 'Marketing', 'Digital marketing and social media')
    `);
    console.log('✅ Categories seeded');

    // 4. Tạo courses
    await db.query(`
      INSERT IGNORE INTO courses (id, instructor_id, category_id, title, description, price)
      VALUES 
        (1, 2, 1, 'JavaScript Fundamentals', 'Learn JavaScript from scratch', 99.99),
        (2, 2, 1, 'React for Beginners', 'Build modern web apps with React', 149.99),
        (3, 1, 2, 'UI/UX Design Basics', 'Learn design principles', 79.99),
        (4, 1, 3, 'Startup 101', 'How to start your own business', 199.99)
    `);
    console.log('✅ Courses seeded');

    // 5. Tạo lessons - Course 1: JavaScript Fundamentals (15 lessons)
    await db.query(`
      INSERT IGNORE INTO lessons (id, course_id, title, content, \`order\`)
      VALUES 
        (1,  1, 'Introduction to JavaScript', 'JavaScript là ngôn ngữ lập trình phổ biến nhất thế giới, chạy trên trình duyệt và server. Bài này giới thiệu lịch sử, vai trò và cách JavaScript hoạt động trong web.', 1),
        (2,  1, 'Setting Up Your Environment', 'Cài đặt VS Code, Node.js và các extension cần thiết. Tạo file .js đầu tiên và chạy thử với Node.js và trình duyệt.', 2),
        (3,  1, 'Variables and Data Types', 'Tìm hiểu var, let, const và sự khác biệt giữa chúng. Các kiểu dữ liệu: string, number, boolean, null, undefined, symbol, bigint.', 3),
        (4,  1, 'Operators and Expressions', 'Toán tử số học, so sánh, logic, gán và toán tử ba ngôi. Hiểu về type coercion và strict equality (===).', 4),
        (5,  1, 'Control Flow: if/else and switch', 'Câu lệnh điều kiện if, else if, else và switch-case. Thực hành viết logic phân nhánh cho các bài toán thực tế.', 5),
        (6,  1, 'Loops: for, while, do-while', 'Vòng lặp for, while, do-while và for...of, for...in. Kỹ thuật break, continue và tránh vòng lặp vô hạn.', 6),
        (7,  1, 'Functions', 'Khai báo hàm, function expression, arrow function. Tham số, giá trị mặc định, rest parameters và return value.', 7),
        (8,  1, 'Scope and Closures', 'Global scope, function scope, block scope. Hiểu closure và ứng dụng thực tế trong JavaScript.', 8),
        (9,  1, 'Arrays', 'Tạo và thao tác mảng với các method: push, pop, shift, unshift, map, filter, reduce, find, forEach.', 9),
        (10, 1, 'Objects', 'Tạo object, truy cập thuộc tính, destructuring, spread operator. Object methods và this keyword.', 10),
        (11, 1, 'DOM Manipulation', 'Truy cập và thay đổi HTML/CSS qua JavaScript. querySelector, addEventListener, createElement, innerHTML.', 11),
        (12, 1, 'Events and Event Handling', 'Các loại event: click, input, submit, keydown. Event bubbling, capturing và event delegation.', 12),
        (13, 1, 'Asynchronous JavaScript: Callbacks & Promises', 'Hiểu về synchronous vs asynchronous. Callback hell, Promise, .then()/.catch() và Promise.all().', 13),
        (14, 1, 'Async/Await and Fetch API', 'Cú pháp async/await để viết code bất đồng bộ dễ đọc hơn. Gọi API với Fetch và xử lý JSON response.', 14),
        (15, 1, 'ES6+ Modern JavaScript Features', 'Template literals, optional chaining, nullish coalescing, modules (import/export), Map, Set và các tính năng hiện đại khác.', 15)
    `);

    // Course 2: React for Beginners (18 lessons)
    await db.query(`
      INSERT IGNORE INTO lessons (id, course_id, title, content, \`order\`)
      VALUES 
        (16, 2, 'Introduction to React', 'React là gì? Tại sao dùng React? So sánh với Vanilla JS. Giới thiệu Virtual DOM và component-based architecture.', 1),
        (17, 2, 'Setting Up React with Vite', 'Tạo project React với Vite, cấu trúc thư mục, chạy dev server và build production.', 2),
        (18, 2, 'JSX Syntax', 'JSX là gì và cách hoạt động. Quy tắc viết JSX: className, self-closing tags, expressions trong {}, fragments.', 3),
        (19, 2, 'Functional Components', 'Tạo và sử dụng functional components. Props là gì, cách truyền và nhận props, PropTypes.', 4),
        (20, 2, 'useState Hook', 'Quản lý state trong component với useState. Cập nhật state, re-render và các lưu ý khi dùng state với object/array.', 5),
        (21, 2, 'useEffect Hook', 'Side effects trong React: fetch data, subscriptions, timers. Dependency array, cleanup function và các use case phổ biến.', 6),
        (22, 2, 'Handling Events in React', 'onClick, onChange, onSubmit trong React. Synthetic events, event handlers và cách truyền tham số vào handler.', 7),
        (23, 2, 'Conditional Rendering', 'Render có điều kiện với &&, ternary operator, if/else. Hiển thị loading state và empty state.', 8),
        (24, 2, 'Lists and Keys', 'Render danh sách với .map(), tầm quan trọng của key prop và cách chọn key phù hợp.', 9),
        (25, 2, 'Forms in React', 'Controlled vs uncontrolled components. Xử lý form input, validation cơ bản và submit form.', 10),
        (26, 2, 'Component Composition and Props Drilling', 'Tổ chức component tree, truyền data qua nhiều tầng và nhận biết khi nào cần state management.', 11),
        (27, 2, 'useContext Hook', 'React Context API để chia sẻ state toàn cục. Tạo Context, Provider, Consumer và useContext hook.', 12),
        (28, 2, 'useRef and useMemo', 'useRef để truy cập DOM và lưu giá trị không trigger re-render. useMemo để tối ưu performance.', 13),
        (29, 2, 'Custom Hooks', 'Tạo custom hooks để tái sử dụng logic. Ví dụ: useFetch, useLocalStorage, useDebounce.', 14),
        (30, 2, 'React Router', 'Cài đặt React Router v6, cấu hình routes, Link, NavLink, useNavigate, useParams và nested routes.', 15),
        (31, 2, 'Fetching Data with Axios', 'Cài đặt Axios, GET/POST/PUT/DELETE requests, interceptors, xử lý loading và error state.', 16),
        (32, 2, 'State Management with Zustand', 'Giới thiệu Zustand như một giải pháp state management đơn giản. Tạo store, actions và sử dụng trong components.', 17),
        (33, 2, 'Building and Deploying React App', 'Build production bundle với Vite, tối ưu bundle size, deploy lên Vercel/Netlify.', 18)
    `);

    // Course 3: UI/UX Design Basics (12 lessons)
    await db.query(`
      INSERT IGNORE INTO lessons (id, course_id, title, content, \`order\`)
      VALUES 
        (34, 3, 'Introduction to UI/UX Design', 'Phân biệt UI và UX. Vai trò của designer trong quy trình phát triển sản phẩm và tư duy lấy người dùng làm trung tâm.', 1),
        (35, 3, 'Design Thinking Process', '5 bước Design Thinking: Empathize, Define, Ideate, Prototype, Test. Áp dụng vào bài toán thiết kế thực tế.', 2),
        (36, 3, 'Color Theory', 'Bánh xe màu sắc, màu bổ sung, tương phản, màu sắc trong branding. Cách chọn color palette cho sản phẩm.', 3),
        (37, 3, 'Typography Fundamentals', 'Font serif vs sans-serif, font pairing, hierarchy, line height, letter spacing. Chọn typography phù hợp cho web/app.', 4),
        (38, 3, 'Layout and Grid Systems', 'Grid 12 cột, spacing system, alignment, whitespace. Responsive layout và breakpoints.', 5),
        (39, 3, 'Design Principles: Gestalt', 'Các nguyên lý Gestalt: proximity, similarity, continuity, closure. Ứng dụng vào thiết kế giao diện.', 6),
        (40, 3, 'User Research Methods', 'User interviews, surveys, usability testing, card sorting. Cách thu thập và phân tích insight từ người dùng.', 7),
        (41, 3, 'Wireframing', 'Low-fidelity wireframe là gì, công cụ wireframing (Figma, Balsamiq). Tạo wireframe cho một ứng dụng đơn giản.', 8),
        (42, 3, 'Prototyping with Figma', 'Tạo prototype tương tác trong Figma: frames, components, auto layout, prototype connections và sharing.', 9),
        (43, 3, 'Design Systems and Components', 'Xây dựng design system: color tokens, typography scale, spacing, component library. Tại sao cần design system.', 10),
        (44, 3, 'Accessibility in Design', 'WCAG guidelines, contrast ratio, font size tối thiểu, keyboard navigation, alt text và thiết kế inclusive.', 11),
        (45, 3, 'Handing Off Design to Developers', 'Export assets, viết design spec, sử dụng Figma Dev Mode, giao tiếp hiệu quả với developer.', 12)
    `);

    // Course 4: Startup 101 (10 lessons)
    await db.query(`
      INSERT IGNORE INTO lessons (id, course_id, title, content, \`order\`)
      VALUES 
        (46, 4, 'What is a Startup?', 'Định nghĩa startup, phân biệt startup với doanh nghiệp truyền thống. Các giai đoạn phát triển: idea, MVP, growth, scale.', 1),
        (47, 4, 'Finding and Validating Your Idea', 'Kỹ thuật tìm ý tưởng kinh doanh, phân tích pain point, customer discovery và cách validate idea trước khi đầu tư.', 2),
        (48, 4, 'Business Model Canvas', '9 khối của Business Model Canvas: customer segments, value proposition, channels, revenue streams... Thực hành điền BMC cho ý tưởng của bạn.', 3),
        (49, 4, 'Market Research and Competitive Analysis', 'TAM/SAM/SOM, phân tích đối thủ cạnh tranh, SWOT analysis và xác định competitive advantage.', 4),
        (50, 4, 'Building an MVP', 'MVP là gì, nguyên tắc build-measure-learn, cách xác định core features và launch MVP nhanh nhất có thể.', 5),
        (51, 4, 'Startup Funding Basics', 'Bootstrapping, angel investors, venture capital, crowdfunding. Các vòng gọi vốn: pre-seed, seed, Series A/B/C.', 6),
        (52, 4, 'Building Your Team', 'Tìm co-founder, hiring đầu tiên, equity split, culture và cách xây dựng team hiệu quả trong giai đoạn đầu.', 7),
        (53, 4, 'Marketing and Growth Hacking', 'Growth hacking là gì, các kênh marketing cho startup: content, SEO, social media, referral, paid ads. Đo lường CAC và LTV.', 8),
        (54, 4, 'Financial Planning for Startups', 'Burn rate, runway, unit economics, P&L cơ bản. Lập kế hoạch tài chính 12 tháng và khi nào cần gọi vốn.', 9),
        (55, 4, 'Pitching to Investors', 'Cấu trúc pitch deck 10 slide, storytelling, demo, Q&A. Những lỗi phổ biến khi pitch và cách tránh.', 10)
    `);
    console.log('✅ Lessons seeded (55 lessons across 4 courses)');

    // 6. Tạo enrollments
    await db.query(`
      INSERT IGNORE INTO enrollments (id, user_id, course_id, status)
      VALUES 
        (1, 3, 1, 'approved'),
        (2, 3, 2, 'pending'),
        (3, 4, 1, 'approved'),
        (4, 4, 3, 'approved')
    `);
    console.log('✅ Enrollments seeded');

    console.log('🎉 MySQL Database seeded successfully!');
    console.log('\n📝 Test accounts:');
    console.log('   Admin: admin@acadelink.com / Password123@');
    console.log('   Instructor: instructor1@acadelink.com / Password123@');
    console.log('   Student: student1@acadelink.com / Password123@');
    console.log('\n📊 Enrollments for testing:');
    console.log('   - Enrollment 2 (student1 → React): PENDING - use for approve/reject tests');
    console.log('   - instructor1 courses: Course 1 (JS), Course 2 (React)');
    console.log('   - Query: GET /api/instructor/enrollments?course_id=2&status=pending');
    
    return true;

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Chạy nếu file này được execute trực tiếp
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
