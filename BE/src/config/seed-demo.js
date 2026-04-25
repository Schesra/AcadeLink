const db = require('./database');
const bcrypt = require('bcrypt');

async function seedDemo() {
  try {
    console.log('🌱 Seeding demo data (MySQL)...\n');

    const password = await bcrypt.hash('Password123@', 10);

    // ==================== USERS ====================
    await db.query(`
      INSERT IGNORE INTO users (id, username, email, password_hash, full_name, created_at) VALUES
        (1,  'admin',       'admin@acadelink.com',       ?, 'Admin System',        '2025-01-01 00:00:00'),
        (2,  'gv_minh',     'minh.gv@acadelink.com',     ?, 'Nguyễn Văn Minh',    '2025-01-05 08:00:00'),
        (3,  'gv_lan',      'lan.gv@acadelink.com',      ?, 'Trần Thị Lan',       '2025-01-10 09:00:00'),
        (4,  'gv_tuan',     'tuan.gv@acadelink.com',     ?, 'Lê Quốc Tuấn',       '2025-01-15 10:00:00'),
        (5,  'gv_huong',    'huong.gv@acadelink.com',    ?, 'Phạm Thị Hương',     '2025-02-01 08:00:00'),
        (6,  'gv_duc',      'duc.gv@acadelink.com',      ?, 'Hoàng Minh Đức',     '2025-02-10 09:00:00'),
        (7,  'sv_an',       'an.sv@acadelink.com',       ?, 'Nguyễn Thành An',    '2025-03-01 07:00:00'),
        (8,  'sv_binh',     'binh.sv@acadelink.com',     ?, 'Trần Văn Bình',      '2025-03-05 08:00:00'),
        (9,  'sv_chi',      'chi.sv@acadelink.com',      ?, 'Lê Thị Chi',         '2025-03-10 09:00:00'),
        (10, 'sv_dung',     'dung.sv@acadelink.com',     ?, 'Phạm Văn Dũng',      '2025-03-15 10:00:00'),
        (11, 'sv_em',       'em.sv@acadelink.com',       ?, 'Hoàng Thị Em',       '2025-04-01 07:00:00'),
        (12, 'sv_phong',    'phong.sv@acadelink.com',    ?, 'Vũ Văn Phong',       '2025-04-05 08:00:00'),
        (13, 'sv_giang',    'giang.sv@acadelink.com',    ?, 'Đặng Thị Giang',     '2025-04-10 09:00:00'),
        (14, 'sv_hung',     'hung.sv@acadelink.com',     ?, 'Bùi Văn Hùng',       '2025-04-15 10:00:00'),
        (15, 'sv_huyen',    'huyen.sv@acadelink.com',    ?, 'Ngô Thị Huyền',      '2025-05-01 07:00:00'),
        (16, 'sv_khanh',    'khanh.sv@acadelink.com',    ?, 'Đinh Văn Khánh',     '2025-05-10 08:00:00'),
        (17, 'sv_linh',     'linh.sv@acadelink.com',     ?, 'Trương Thị Linh',    '2025-06-01 09:00:00'),
        (18, 'sv_manh',     'manh.sv@acadelink.com',     ?, 'Phan Văn Mạnh',      '2025-06-15 10:00:00'),
        (19, 'sv_ngoc',     'ngoc.sv@acadelink.com',     ?, 'Lý Thị Ngọc',        '2025-07-01 07:00:00'),
        (20, 'sv_phuong',   'phuong.sv@acadelink.com',   ?, 'Cao Thị Phương',     '2025-07-20 08:00:00')
    `, Array(20).fill(password));
    console.log('✅ 20 users (1 admin, 5 instructors, 14 students)');

    // ==================== USER ROLES ====================
    await db.query(`
      INSERT IGNORE INTO user_roles (user_id, role) VALUES
        (1,  'admin'),
        (2,  'instructor'),
        (3,  'instructor'),
        (4,  'instructor'),
        (5,  'instructor'),
        (6,  'instructor'),
        (7,  'student'),
        (8,  'student'),
        (9,  'student'),
        (10, 'student'),
        (11, 'student'),
        (12, 'student'),
        (13, 'student'),
        (14, 'student'),
        (15, 'student'),
        (16, 'student'),
        (17, 'student'),
        (18, 'student'),
        (19, 'student'),
        (20, 'student')
    `);
    console.log('✅ User roles');

    // ==================== CATEGORIES ====================
    await db.query(`
      INSERT IGNORE INTO categories (id, category_name, description) VALUES
        (1, 'Lập trình Web',       'HTML, CSS, JavaScript, React, Node.js và các framework web'),
        (2, 'Khoa học dữ liệu',    'Python, Machine Learning, Deep Learning và phân tích dữ liệu'),
        (3, 'Thiết kế UI/UX',      'Figma, Adobe XD, nguyên lý thiết kế và trải nghiệm người dùng'),
        (4, 'Kinh doanh & Khởi nghiệp', 'Kỹ năng kinh doanh, quản lý và khởi nghiệp'),
        (5, 'Marketing số',        'SEO, Google Ads, Facebook Ads và chiến lược marketing online'),
        (6, 'Ngoại ngữ',           'Tiếng Anh, Tiếng Nhật, Tiếng Hàn cho người đi làm')
    `);
    console.log('✅ 6 categories');

    // ==================== COURSES ====================
    await db.query(`
      INSERT IGNORE INTO courses (id, instructor_id, category_id, title, description, price, thumbnail_url, created_at) VALUES
        (1,  2, 1, 'JavaScript từ Zero đến Hero',
          'Khóa học toàn diện về JavaScript hiện đại: ES6+, async/await, DOM, API. Phù hợp cho người mới bắt đầu lập trình web.',
          499000, 'https://picsum.photos/seed/js101/640/360', '2025-02-01 00:00:00'),

        (2,  2, 1, 'React.js - Xây dựng ứng dụng thực tế',
          'Học React từ cơ bản đến nâng cao: Hooks, Context, Redux, React Query. Dự án thực tế cuối khóa.',
          799000, 'https://picsum.photos/seed/react202/640/360', '2025-02-15 00:00:00'),

        (3,  2, 1, 'Node.js & Express API Development',
          'Xây dựng REST API chuyên nghiệp với Node.js, Express, MySQL. Tích hợp JWT, upload file, deploy lên VPS.',
          699000, 'https://picsum.photos/seed/node303/640/360', '2025-03-01 00:00:00'),

        (4,  3, 2, 'Python cho Data Science',
          'Học Python, NumPy, Pandas, Matplotlib từ đầu. Phân tích và trực quan hóa dữ liệu thực tế.',
          599000, 'https://picsum.photos/seed/python404/640/360', '2025-02-10 00:00:00'),

        (5,  3, 2, 'Machine Learning cơ bản đến nâng cao',
          'Thuật toán ML: Linear Regression, Decision Tree, SVM, Neural Networks. Thực hành với scikit-learn.',
          999000, 'https://picsum.photos/seed/ml505/640/360', '2025-03-05 00:00:00'),

        (6,  3, 2, 'SQL & Database Design',
          'Thiết kế cơ sở dữ liệu, tối ưu truy vấn, stored procedures. MySQL và PostgreSQL thực chiến.',
          449000, 'https://picsum.photos/seed/sql606/640/360', '2025-04-01 00:00:00'),

        (7,  4, 3, 'Thiết kế UI/UX với Figma',
          'Học Figma từ cơ bản: wireframe, prototype, design system, auto-layout. Portfolio thực tế sau khóa học.',
          649000, 'https://picsum.photos/seed/figma707/640/360', '2025-02-20 00:00:00'),

        (8,  4, 3, 'UX Research & User Testing',
          'Phương pháp nghiên cứu người dùng: phỏng vấn, survey, usability testing. Phân tích hành vi người dùng.',
          549000, 'https://picsum.photos/seed/ux808/640/360', '2025-03-10 00:00:00'),

        (9,  4, 1, 'CSS nâng cao & Tailwind CSS',
          'Flexbox, Grid, animation, responsive design. Xây dựng UI đẹp với Tailwind CSS và component library.',
          399000, 'https://picsum.photos/seed/css909/640/360', '2025-04-10 00:00:00'),

        (10, 5, 4, 'Khởi nghiệp từ A đến Z',
          'Từ ý tưởng đến sản phẩm: Business Model Canvas, MVP, gọi vốn, xây dựng team. Chia sẻ từ founder thực tế.',
          1299000, 'https://picsum.photos/seed/startup1010/640/360', '2025-03-15 00:00:00'),

        (11, 5, 4, 'Quản lý dự án theo Agile/Scrum',
          'Phương pháp Agile, Scrum ceremonies, sprint planning, Jira. Áp dụng vào dự án phần mềm thực tế.',
          749000, 'https://picsum.photos/seed/agile1111/640/360', '2025-04-05 00:00:00'),

        (12, 5, 5, 'Digital Marketing toàn diện',
          'SEO, Google Ads, Facebook Ads, Email Marketing, Content Strategy. Chạy chiến dịch thực tế với ngân sách thật.',
          899000, 'https://picsum.photos/seed/marketing1212/640/360', '2025-04-20 00:00:00'),

        (13, 6, 5, 'SEO từ cơ bản đến chuyên sâu',
          'On-page, Off-page, Technical SEO. Công cụ: Ahrefs, SEMrush, Google Search Console. Case study thực tế.',
          699000, 'https://picsum.photos/seed/seo1313/640/360', '2025-03-20 00:00:00'),

        (14, 6, 6, 'Tiếng Anh giao tiếp cho dân IT',
          'Từ vựng chuyên ngành, kỹ năng họp online, viết email, thuyết trình bằng tiếng Anh. Luyện nói với AI.',
          549000, 'https://picsum.photos/seed/english1414/640/360', '2025-04-15 00:00:00'),

        (15, 6, 6, 'Tiếng Nhật N5-N4 cho người mới',
          'Hiragana, Katakana, Kanji cơ bản. Hội thoại hàng ngày, ngữ pháp N5-N4. Luyện thi JLPT.',
          799000, 'https://picsum.photos/seed/japanese1515/640/360', '2025-05-01 00:00:00')
    `);
    console.log('✅ 15 courses (3 per instructor)');

    // ==================== LESSONS ====================
    // Delete before re-insert so seed is idempotent
    await db.query('DELETE FROM lessons WHERE course_id BETWEEN 1 AND 15');
    await db.query(`
      INSERT INTO lessons (course_id, title, content, \`order\`) VALUES
        -- ── Course 1: JavaScript từ Zero đến Hero (15 bài) ──
        (1, 'Giới thiệu JavaScript & thiết lập môi trường',    'Cài đặt VS Code, Node.js, browser DevTools. JavaScript là gì và chạy ở đâu?', 1),
        (1, 'Biến, kiểu dữ liệu & toán tử',                   'var/let/const, string/number/boolean/null/undefined, toán tử số học & so sánh.', 2),
        (1, 'Cấu trúc điều kiện & vòng lặp',                  'if/else, switch, for, while, do-while, break/continue.', 3),
        (1, 'Hàm & Scope',                                     'Function declaration, expression, arrow function, scope, hoisting.', 4),
        (1, 'Mảng (Array) & các phương thức',                  'map, filter, reduce, find, forEach, spread operator.', 5),
        (1, 'Object & Destructuring',                          'Object literal, shorthand, computed property, destructuring, rest params.', 6),
        (1, 'DOM Manipulation',                                'querySelector, createElement, addEventListener, thao tác class/style.', 7),
        (1, 'Sự kiện (Events) & Event Delegation',             'Bubbling, capturing, preventDefault, stopPropagation.', 8),
        (1, 'Promise & Async/Await',                           'Callback hell, Promise chain, async/await, try/catch.', 9),
        (1, 'Fetch API & làm việc với REST API',               'GET/POST/PUT/DELETE, JSON parse, xử lý lỗi HTTP.', 10),
        (1, 'ES6+ Modules',                                    'import/export, default vs named export, dynamic import.', 11),
        (1, 'Closure & Higher-Order Function',                  'Closure thực tế, currying, function factory.', 12),
        (1, 'Xử lý lỗi & Debugging',                          'try/catch/finally, custom Error, Chrome DevTools debugger.', 13),
        (1, 'localStorage & sessionStorage',                   'Lưu dữ liệu trên trình duyệt, JSON serialize/parse.', 14),
        (1, 'Dự án cuối khóa: Todo App',                      'Xây dựng ứng dụng quản lý công việc hoàn chỉnh với JS thuần.', 15),

        -- ── Course 2: React.js (12 bài) ──
        (2, 'Tại sao dùng React? Cài đặt Vite',               'SPA, Virtual DOM, so sánh React/Vue/Angular, tạo project với Vite.', 1),
        (2, 'JSX & Function Components',                       'Cú pháp JSX, props, children, render list với key.', 2),
        (2, 'useState — Quản lý state cục bộ',                 'State là gì, immutability, re-render, state với object/array.', 3),
        (2, 'useEffect & Side Effects',                        'Dependency array, cleanup function, gọi API khi mount.', 4),
        (2, 'Component Lifecycle & Conditional Rendering',     'Early return, ternary, short-circuit &&.', 5),
        (2, 'React Router v6',                                 'BrowserRouter, Route, Link, useNavigate, useParams, Outlet.', 6),
        (2, 'Context API & useContext',                        'Tạo context, provider, tránh prop drilling.', 7),
        (2, 'useReducer & quản lý state phức tạp',             'Reducer pattern, dispatch, so sánh với useState.', 8),
        (2, 'Custom Hooks',                                    'Tách logic tái sử dụng: useFetch, useLocalStorage, useDebounce.', 9),
        (2, 'React Query — Gọi API chuyên nghiệp',             'useQuery, useMutation, caching, refetch, optimistic update.', 10),
        (2, 'Tối ưu hiệu năng',                               'React.memo, useMemo, useCallback, lazy loading, Suspense.', 11),
        (2, 'Dự án cuối khóa: E-commerce mini',               'Giỏ hàng, xác thực, gọi API thật, deploy lên Vercel.', 12),

        -- ── Course 3: Node.js & Express (10 bài) ──
        (3, 'Node.js & npm ecosystem',                         'Event loop, non-blocking I/O, CommonJS modules, npm scripts.', 1),
        (3, 'Express.js cơ bản',                               'Router, middleware, request/response lifecycle.', 2),
        (3, 'RESTful API Design',                              'Nguyên tắc REST, status code, versioning, tài liệu API.', 3),
        (3, 'Kết nối MySQL với mysql2',                        'Pool, parameterized query, xử lý lỗi DB.', 4),
        (3, 'Validation & Error Handling',                     'express-validator, custom middleware, chuẩn hóa response lỗi.', 5),
        (3, 'JWT Authentication',                              'Đăng ký/đăng nhập, bcrypt, access token, refresh token.', 6),
        (3, 'Upload file với Multer',                          'Upload ảnh, giới hạn kích thước, lưu trên server/Cloudinary.', 7),
        (3, 'Testing API với Jest & Supertest',                'Unit test, integration test, mock database.', 8),
        (3, 'Deploy lên VPS',                                  'PM2, Nginx reverse proxy, SSL Let\'s Encrypt, CI/CD cơ bản.', 9),
        (3, 'Dự án cuối khóa: Blog API',                      'CRUD bài viết, bình luận, phân quyền, pagination.', 10),

        -- ── Course 4: Python cho Data Science (10 bài) ──
        (4, 'Python cơ bản cho Data Science',                  'Cài Anaconda, Jupyter. Cú pháp Python, list/dict/set.', 1),
        (4, 'NumPy — Tính toán số học',                        'ndarray, indexing, broadcasting, linear algebra.', 2),
        (4, 'Pandas — Xử lý dữ liệu bảng',                    'DataFrame, Series, đọc CSV/Excel, lọc, groupby, merge.', 3),
        (4, 'Làm sạch dữ liệu (Data Cleaning)',               'Missing values, duplicates, outliers, chuẩn hóa kiểu dữ liệu.', 4),
        (4, 'Matplotlib — Biểu đồ cơ bản',                    'Line, bar, scatter, histogram, pie chart, subplots.', 5),
        (4, 'Seaborn — Biểu đồ thống kê',                     'heatmap, boxplot, violin, pairplot, FacetGrid.', 6),
        (4, 'Phân tích thống kê mô tả',                       'Mean, median, std, correlation, percentile.', 7),
        (4, 'Exploratory Data Analysis (EDA)',                  'Quy trình EDA thực tế với dataset Titanic.', 8),
        (4, 'Giới thiệu Scikit-learn',                         'Pipeline, train/test split, cross-validation, metrics.', 9),
        (4, 'Dự án: Phân tích doanh số bán hàng',              'EDA → insight → báo cáo trực quan hoàn chỉnh.', 10),

        -- ── Course 5: Machine Learning (12 bài) ──
        (5, 'Tổng quan Machine Learning',                      'Supervised/Unsupervised/Reinforcement, workflow ML.', 1),
        (5, 'Chuẩn bị dữ liệu',                               'Feature engineering, encoding, scaling, imbalanced data.', 2),
        (5, 'Linear Regression',                               'OLS, cost function, gradient descent, polynomial regression.', 3),
        (5, 'Logistic Regression & Phân loại',                 'Sigmoid, decision boundary, multiclass, ROC-AUC.', 4),
        (5, 'Decision Tree',                                   'Gini/Entropy, pruning, visualization, overfitting.', 5),
        (5, 'Random Forest & Ensemble',                        'Bagging, boosting, XGBoost, feature importance.', 6),
        (5, 'Support Vector Machine',                          'Kernel trick, margin, C parameter, SVM cho text.', 7),
        (5, 'K-Means Clustering',                              'Elbow method, silhouette score, ứng dụng phân nhóm khách hàng.', 8),
        (5, 'Neural Networks cơ bản',                          'Perceptron, activation functions, backpropagation.', 9),
        (5, 'Deep Learning với Keras',                         'Sequential model, CNN, LSTM, transfer learning.', 10),
        (5, 'Đánh giá & tối ưu mô hình',                      'Cross-validation, hyperparameter tuning, Grid Search.', 11),
        (5, 'Dự án: Dự đoán giá nhà',                         'End-to-end ML pipeline, model serving với FastAPI.', 12),

        -- ── Course 6: SQL & Database Design (8 bài) ──
        (6, 'Cơ sở dữ liệu quan hệ & MySQL',                  'Khái niệm RDBMS, cài MySQL, MySQL Workbench.', 1),
        (6, 'DDL — Tạo và quản lý bảng',                      'CREATE, ALTER, DROP, kiểu dữ liệu, constraints.', 2),
        (6, 'DML — Thao tác dữ liệu',                         'INSERT, UPDATE, DELETE, TRUNCATE, transaction.', 3),
        (6, 'SELECT nâng cao',                                 'JOIN (INNER/LEFT/RIGHT), subquery, UNION, EXISTS.', 4),
        (6, 'Hàm tổng hợp & GROUP BY',                        'COUNT, SUM, AVG, MIN, MAX, HAVING, ROLLUP.', 5),
        (6, 'Index & tối ưu truy vấn',                        'B-tree index, EXPLAIN, slow query, composite index.', 6),
        (6, 'Stored Procedure & Trigger',                      'Viết SP, gọi SP từ ứng dụng, trigger tự động.', 7),
        (6, 'Thiết kế ERD & Chuẩn hóa',                       '1NF/2NF/3NF, vẽ ERD, thiết kế schema thực tế.', 8),

        -- ── Course 7: Thiết kế UI/UX với Figma (10 bài) ──
        (7, 'Tổng quan UI/UX & Design Thinking',              'Sự khác biệt UI và UX, 5 bước Design Thinking.', 1),
        (7, 'Làm quen Figma',                                  'Giao diện, frames, layers, shapes, text, auto-layout.', 2),
        (7, 'Màu sắc & Typography',                            'Color theory, font pairing, type scale, contrast WCAG.', 3),
        (7, 'Wireframe & User Flow',                           'Lo-fi wireframe, sitemap, user journey map.', 4),
        (7, 'Components & Variants',                           'Tạo component, props, variant, instance swap.', 5),
        (7, 'Design System',                                   'Design tokens, shared styles, icon library, documentation.', 6),
        (7, 'Responsive Design',                               'Grid 12 cột, breakpoints, thiết kế mobile-first.', 7),
        (7, 'Prototyping & Micro-animation',                   'Interactive prototype, smart animate, overlay.', 8),
        (7, 'Handoff cho Developer',                           'Inspect panel, dev mode, export assets, spacing spec.', 9),
        (7, 'Dự án: Thiết kế app di động',                    'Thiết kế hoàn chỉnh 10 màn hình, prototype có thể click.', 10),

        -- ── Course 8: UX Research & User Testing (7 bài) ──
        (8, 'UX Research là gì & tại sao cần?',               'Phân biệt qualitative/quantitative, vị trí trong design process.', 1),
        (8, 'Phỏng vấn người dùng',                           'Chuẩn bị câu hỏi, kỹ thuật lắng nghe, phân tích insight.', 2),
        (8, 'Survey & Bảng câu hỏi',                          'Thiết kế câu hỏi hiệu quả, Google Form, Likert scale.', 3),
        (8, 'Usability Testing',                               'Moderated/unmoderated testing, think-aloud protocol, ghi chép.', 4),
        (8, 'Phân tích hành vi người dùng',                    'Heatmap, session recording, funnel analysis với Hotjar.', 5),
        (8, 'Tổng hợp & trình bày Research',                  'Affinity diagram, persona, user journey, báo cáo insight.', 6),
        (8, 'A/B Testing & Đo lường',                         'Thiết kế thí nghiệm, statistical significance, kết luận.', 7),

        -- ── Course 9: CSS nâng cao & Tailwind CSS (8 bài) ──
        (9, 'CSS Selectors & Specificity',                     'Pseudo-class, pseudo-element, cascade, specificity wars.', 1),
        (9, 'Flexbox toàn tập',                                'Container/item properties, căn chỉnh, wrap, order.', 2),
        (9, 'CSS Grid Layout',                                 'Grid template, area, implicit grid, minmax, auto-fill.', 3),
        (9, 'Responsive Design & Media Queries',               'Mobile-first, breakpoints, fluid typography, clamp().', 4),
        (9, 'CSS Animation & Transition',                      'Keyframes, timing function, transform, will-change.', 5),
        (9, 'CSS Variables & Theming',                         'Custom properties, dark mode, design tokens.', 6),
        (9, 'Tailwind CSS từ đầu',                             'Utility-first, config file, JIT mode, custom utilities.', 7),
        (9, 'Xây dựng UI Component với Tailwind',              'Card, navbar, modal, form đẹp, dark mode toggle.', 8),

        -- ── Course 10: Khởi nghiệp từ A đến Z (10 bài) ──
        (10, 'Tư duy khởi nghiệp',                             'Mindset founder, fail fast, growth mindset, story thực tế.', 1),
        (10, 'Tìm & validate ý tưởng',                         'Problem interview, PMF, Jobs-to-be-Done framework.', 2),
        (10, 'Business Model Canvas',                          '9 khối BMC, revenue streams, cost structure, value prop.', 3),
        (10, 'Xây dựng MVP',                                   'No-code tools, landing page test, concierge MVP.', 4),
        (10, 'Phân tích thị trường & cạnh tranh',              'TAM/SAM/SOM, Porter 5 forces, USP.', 5),
        (10, 'Marketing tăng trưởng (Growth Hacking)',          'Viral loop, referral, product-led growth.', 6),
        (10, 'Xây dựng team & văn hóa công ty',               'Hiring, vesting, equity split, OKR.', 7),
        (10, 'Tài chính cơ bản cho Founder',                   'P&L, cash flow, runway, unit economics, LTV/CAC.', 8),
        (10, 'Gọi vốn & Pitch Deck',                           'Các vòng gọi vốn, term sheet, chuẩn bị deck 12 slide.', 9),
        (10, 'Demo Day & Next Steps',                          'Pitch thực tế, phản hồi từ mentor, lộ trình sau demo day.', 10),

        -- ── Course 11: Quản lý dự án Agile/Scrum (8 bài) ──
        (11, 'Tại sao cần Agile?',                             'Waterfall vs Agile, Agile Manifesto, 12 nguyên tắc.', 1),
        (11, 'Scrum Framework',                                'Roles: PO/SM/Dev Team, artifacts, ceremonies.', 2),
        (11, 'User Story & Product Backlog',                   'Viết user story, story point, backlog refinement.', 3),
        (11, 'Sprint Planning & Sprint Goal',                  'Chọn backlog items, definition of done, capacity planning.', 4),
        (11, 'Daily Standup & Sprint Review',                  'Format standup hiệu quả, demo sprint, stakeholder feedback.', 5),
        (11, 'Sprint Retrospective',                           'Start/Stop/Continue, blameless retro, action items.', 6),
        (11, 'Công cụ: Jira & Trello',                         'Tạo board, epic, sprint, burndown chart, velocity.', 7),
        (11, 'Scaling Agile: SAFe & LeSS cơ bản',             'Khi nào scale, PI Planning, ART.', 8),

        -- ── Course 12: Digital Marketing toàn diện (12 bài) ──
        (12, 'Tổng quan Digital Marketing',                    'Hệ sinh thái online, TOFU/MOFU/BOFU, customer journey.', 1),
        (12, 'Nghiên cứu & xây dựng Persona',                  'Target audience, buyer persona, market research.', 2),
        (12, 'Content Marketing',                              'Content strategy, blog, pillar page, editorial calendar.', 3),
        (12, 'SEO cơ bản cho Marketer',                        'Keyword research, on-page, link building, GSC.', 4),
        (12, 'Google Ads — Search & Display',                  'Campaign structure, bidding, Quality Score, remarketing.', 5),
        (12, 'Facebook & Instagram Ads',                       'Business Manager, audience, ad format, pixel, ROAS.', 6),
        (12, 'Email Marketing',                                'Mailchimp, segmentation, automation flow, A/B test subject.', 7),
        (12, 'Social Media Marketing',                         'Content lịch đăng, viral formula, KOL/UGC, TikTok.', 8),
        (12, 'Analytics & Đo lường',                           'GA4, UTM, conversion tracking, báo cáo dashboard.', 9),
        (12, 'Marketing Automation',                           'Funnel tự động, lead nurturing, HubSpot cơ bản.', 10),
        (12, 'Thực chiến: Lập kế hoạch chiến dịch',            'Brief, timeline, ngân sách, KPI, báo cáo kết quả.', 11),
        (12, 'Dự án: Chạy chiến dịch thực tế',                'Setup Google Ads + Facebook Ads ngân sách thật $50.', 12),

        -- ── Course 13: SEO từ cơ bản đến chuyên sâu (10 bài) ──
        (13, 'SEO là gì & cách Google hoạt động',              'Crawling, indexing, ranking algorithm, E-E-A-T.', 1),
        (13, 'Nghiên cứu từ khóa (Keyword Research)',          'Search intent, long-tail, Ahrefs, SEMrush, KGR.', 2),
        (13, 'On-page SEO',                                    'Title tag, meta desc, H1-H6, URL slug, image alt.', 3),
        (13, 'Content SEO',                                    'Pillar-cluster, content depth, LSI keywords, schema Article.', 4),
        (13, 'Technical SEO',                                  'Core Web Vitals, mobile-friendly, canonical, hreflang.', 5),
        (13, 'Site speed & PageSpeed',                         'LCP/FID/CLS, lazy load, compression, CDN, caching.', 6),
        (13, 'Off-page & Link Building',                       'DA/PA, guest post, HARO, toxic links, disavow.', 7),
        (13, 'Local SEO',                                      'Google Business Profile, local citations, review management.', 8),
        (13, 'Phân tích & báo cáo SEO',                        'Google Search Console, GA4, rank tracking, báo cáo client.', 9),
        (13, 'Case Study: Tăng traffic thực tế',               'Phân tích site thật, lập kế hoạch, thực thi và đo kết quả.', 10),

        -- ── Course 14: Tiếng Anh giao tiếp cho dân IT (10 bài) ──
        (14, 'Phát âm & Intonation cho IT',                    'Phiên âm IPA, word stress, kỹ thuật nói rõ ràng.', 1),
        (14, 'Từ vựng chuyên ngành IT cơ bản',                 '200 từ vựng IT thông dụng: deploy, repository, pipeline...', 2),
        (14, 'Đọc hiểu tài liệu kỹ thuật',                     'Đọc README, API docs, Stack Overflow nhanh và hiểu.', 3),
        (14, 'Viết email & Slack chuyên nghiệp',               'Email cập nhật tiến độ, báo lỗi, yêu cầu review code.', 4),
        (14, 'Họp online bằng tiếng Anh',                      'Mở đầu, đồng ý/phản đối lịch sự, tóm tắt cuộc họp.', 5),
        (14, 'Thuyết trình & Demo kỹ thuật',                   'Cấu trúc thuyết trình, ngôn ngữ demo, Q&A.', 6),
        (14, 'Code Review & Technical Discussion',              'Nhận xét code, giải thích quyết định kỹ thuật.', 7),
        (14, 'Phỏng vấn kỹ thuật bằng tiếng Anh',              'Tell me about yourself, behavioral questions, STAR method.', 8),
        (14, 'Viết CV & LinkedIn bằng tiếng Anh',              'Action verbs, quantify achievements, profile optimization.', 9),
        (14, 'Luyện nói với AI & thực hành',                   'Conversation practice, shadowing technique, final assessment.', 10),

        -- ── Course 15: Tiếng Nhật N5-N4 (15 bài) ──
        (15, 'Hiragana — Bảng chữ cái đầu tiên',              '46 ký tự Hiragana, cách đọc, luyện viết tay.', 1),
        (15, 'Katakana — Chữ cho từ ngoại lai',               '46 ký tự Katakana, đọc tên nước ngoài, thực hành.', 2),
        (15, 'Kanji N5 cơ bản (phần 1)',                       '50 Kanji đầu tiên: 日本語、人、山、川... nghĩa và âm đọc.', 3),
        (15, 'Kanji N5 cơ bản (phần 2)',                       '50 Kanji tiếp theo: 時間、学校、食べる... dùng trong câu.', 4),
        (15, 'Ngữ pháp N5 — Câu cơ bản',                      'AはBです, AはBじゃない, câu hỏi với か.', 5),
        (15, 'Ngữ pháp N5 — Động từ & Thì',                   'Nhóm động từ 1/2/3, thì hiện tại/quá khứ, ます/ません.', 6),
        (15, 'Ngữ pháp N5 — Trợ từ',                          'は, が, を, に, で, へ, と, も, の — dùng đúng chỗ.', 7),
        (15, 'Hội thoại hàng ngày N5',                         'Chào hỏi, mua sắm, hỏi đường, đặt đồ ăn.', 8),
        (15, 'Ngữ pháp N4 — Te-form',                         'Cách chia て形, te-iru, te-mo ii, te-wa ikemasen.', 9),
        (15, 'Ngữ pháp N4 — Conditional',                      'たら、ば、なら, điều kiện có điều kiện.', 10),
        (15, 'Kanji N4 (phần 1)',                              '80 Kanji N4: 仕事、会社、電話、医者... thực hành đọc.', 11),
        (15, 'Kanji N4 (phần 2)',                              '80 Kanji N4 tiếp theo: đọc văn bản ngắn có Kanji.', 12),
        (15, 'Luyện nghe N5-N4',                               'Nghe hội thoại tốc độ thật, shadowing, ghi chép.', 13),
        (15, 'Luyện đọc — Đoạn văn ngắn N4',                   'Đọc hiểu email, tin nhắn, biển báo bằng tiếng Nhật.', 14),
        (15, 'Ôn thi JLPT N5-N4 & Mock Test',                 'Cấu trúc đề thi, chiến thuật làm bài, mock test tổng ôn.', 15)
    `);
    console.log('✅ 150 lessons cho tất cả 15 khóa học (5-15 bài/khóa)');

    // ==================== ENROLLMENTS ====================
    await db.query(`
      INSERT IGNORE INTO enrollments (user_id, course_id, status, enrolled_at) VALUES
        -- sv_an (7)
        (7,  1,  'approved',  '2025-03-10 08:00:00'),
        (7,  2,  'approved',  '2025-03-15 09:00:00'),
        (7,  4,  'pending',   '2025-04-01 10:00:00'),
        (7,  7,  'rejected',  '2025-04-05 11:00:00'),

        -- sv_binh (8)
        (8,  1,  'approved',  '2025-03-12 08:00:00'),
        (8,  3,  'approved',  '2025-03-20 09:00:00'),
        (8,  5,  'pending',   '2025-04-10 10:00:00'),
        (8,  10, 'approved',  '2025-04-15 11:00:00'),

        -- sv_chi (9)
        (9,  2,  'approved',  '2025-03-18 08:00:00'),
        (9,  4,  'approved',  '2025-03-25 09:00:00'),
        (9,  6,  'approved',  '2025-04-02 10:00:00'),
        (9,  13, 'pending',   '2025-04-20 11:00:00'),

        -- sv_dung (10)
        (10, 1,  'approved',  '2025-04-01 08:00:00'),
        (10, 7,  'approved',  '2025-04-05 09:00:00'),
        (10, 12, 'pending',   '2025-04-25 10:00:00'),

        -- sv_em (11)
        (11, 4,  'approved',  '2025-04-05 08:00:00'),
        (11, 5,  'approved',  '2025-04-10 09:00:00'),
        (11, 14, 'approved',  '2025-04-15 10:00:00'),

        -- sv_phong (12)
        (12, 2,  'approved',  '2025-04-08 08:00:00'),
        (12, 9,  'pending',   '2025-04-12 09:00:00'),
        (12, 11, 'approved',  '2025-04-20 10:00:00'),

        -- sv_giang (13)
        (13, 3,  'approved',  '2025-04-10 08:00:00'),
        (13, 6,  'approved',  '2025-04-15 09:00:00'),
        (13, 15, 'pending',   '2025-05-01 10:00:00'),
        (13, 10, 'rejected',  '2025-05-05 11:00:00'),

        -- sv_hung (14)
        (14, 1,  'approved',  '2025-04-12 08:00:00'),
        (14, 13, 'approved',  '2025-04-18 09:00:00'),
        (14, 14, 'pending',   '2025-05-10 10:00:00'),

        -- sv_huyen (15)
        (15, 7,  'approved',  '2025-05-01 08:00:00'),
        (15, 8,  'approved',  '2025-05-05 09:00:00'),
        (15, 12, 'approved',  '2025-05-10 10:00:00'),

        -- sv_khanh (16)
        (16, 2,  'approved',  '2025-05-10 08:00:00'),
        (16, 5,  'pending',   '2025-05-15 09:00:00'),
        (16, 11, 'approved',  '2025-05-20 10:00:00'),

        -- sv_linh (17)
        (17, 4,  'approved',  '2025-06-01 08:00:00'),
        (17, 6,  'pending',   '2025-06-05 09:00:00'),
        (17, 15, 'approved',  '2025-06-10 10:00:00'),

        -- sv_manh (18)
        (18, 1,  'pending',   '2025-06-15 08:00:00'),
        (18, 10, 'approved',  '2025-06-20 09:00:00'),

        -- sv_ngoc (19)
        (19, 7,  'approved',  '2025-07-01 08:00:00'),
        (19, 9,  'approved',  '2025-07-05 09:00:00'),
        (19, 14, 'pending',   '2025-07-10 10:00:00'),

        -- sv_phuong (20)
        (20, 3,  'approved',  '2025-07-20 08:00:00'),
        (20, 12, 'pending',   '2025-07-25 09:00:00'),
        (20, 13, 'approved',  '2025-07-28 10:00:00')
    `);
    console.log('✅ ~45 enrollments (mixed: approved/pending/rejected)');

    console.log('\n🎉 Demo data seeded successfully!\n');
    console.log('📋 Tài khoản test:');
    console.log('   Admin:      admin@acadelink.com     / Password123@');
    console.log('   Giảng viên: minh.gv@acadelink.com  / Password123@  (3 khóa học)');
    console.log('   Giảng viên: lan.gv@acadelink.com   / Password123@  (3 khóa học)');
    console.log('   Học viên:   an.sv@acadelink.com    / Password123@');
    console.log('   Học viên:   binh.sv@acadelink.com  / Password123@');
    console.log('\n📊 Thống kê:');
    console.log('   - 20 users (1 admin, 5 giảng viên, 14 học viên)');
    console.log('   - 6 danh mục');
    console.log('   - 15 khóa học');
    console.log('   - 150 bài học (5–15 bài/khóa, đầy đủ 15 khóa)');
    console.log('   - ~45 enrollments (approved/pending/rejected)');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seedDemo();
