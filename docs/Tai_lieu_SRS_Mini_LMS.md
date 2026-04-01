# TÀI LIỆU ĐẶC TẢ YÊU CẦU (SRS) - MINI LMS WEB

## I. Tổng quan dự án (Project Overview)
* **Mục tiêu**: Xây dựng một nền tảng bán và cung cấp khóa học trực tuyến quy mô nhỏ - ACADELINK.
* **Hệ thống**: Gồm 3 phần: Learning Portal (Giao diện học), Instructor Dashboard (Giao diện giảng viên), Admin Dashboard (Giao diện quản trị).
* **Đối tượng sử dụng (Actors)**:
    * Guest: Khách vãng lai (chưa đăng nhập).
    * Student: Học viên (role: student) - Mua và học khóa học.
    * Instructor: Giảng viên (role: instructor) - Tạo và bán khóa học.
    * Admin: Quản trị viên (role: admin) - Quản lý toàn hệ thống.
* **Multi-Role**: Một user có thể có nhiều role đồng thời (vừa là Student vừa là Instructor).

## II. Yêu cầu chức năng (Functional Requirements)

### 1. Hệ thống Học viên (Learning Portal)
* **Xác thực tài khoản (Auth)**: Đăng ký, Đăng nhập / Đăng xuất (Sử dụng JWT để xác thực).
* **Trang chủ (Homepage)**: Hiển thị Banner quảng cáo và danh sách Khóa học nổi bật / Mới nhất.
* **Duyệt khóa học (Course Browsing)**: Xem danh sách toàn bộ khóa học, lọc theo Danh mục.
* **Chi tiết khóa học (Course Detail)**: Hiển thị Thumbnail, Tên, Giá, Mô tả và Curriculum.
* **Đăng ký mua khóa học (Checkout)**: Điền form thông tin và xác nhận ghi danh (mô phỏng thanh toán).
* **Khu vực Học tập (My Courses & Learning Area)**: Xem danh sách khóa học đã đăng ký và xem nội dung Video/Text.

### 2. Hệ thống Giảng viên (Instructor Dashboard)
* **Đăng ký trở thành Instructor**: Student có thể đăng ký thêm role Instructor.
* **Quản lý Khóa học của tôi**: Thêm, Sửa, Xóa khóa học do mình tạo.
* **Quản lý Bài học**: Thêm, Sửa, Xóa bài học vào khóa học của mình.
* **Quản lý Ghi danh**: Xem và duyệt học viên đăng ký khóa học của mình.
* **Dashboard thống kê**: Xem số lượng học viên, doanh thu.

### 3. Hệ thống Quản trị (Admin Dashboard)
* **Xác thực Admin**: Đăng nhập trang quản trị với role = admin.
* **Quản lý Danh mục (Category Management)**: Thêm, Sửa, Xóa danh mục khóa học.
* **Quản lý Toàn bộ Khóa học**: Thêm, Sửa, Xóa tất cả khóa học trong hệ thống.
* **Quản lý Toàn bộ Bài học**: Thêm, Sửa, Xóa tất cả bài học trong hệ thống.
* **Quản lý Users**: Xem danh sách user, phân quyền role.
* **Quản lý Toàn bộ Ghi danh**: Xem và duyệt tất cả enrollment trong hệ thống.

## III. Yêu cầu phi chức năng (Non-Functional Requirements)
* **UI/UX**: Giao diện Responsive (PC & Mobile).
* **Data Validation**: Validate tất cả các form (email, giá >= 0, không bỏ trống).
* **Bảo mật**: 
    * Sử dụng JWT Token đính kèm request header cho các API bảo mật.
    * Password được hash bằng bcrypt với salt rounds = 10.
    * Phân quyền rõ ràng: Admin toàn quyền, Instructor chỉ quản lý dữ liệu của mình.
* **Performance**: API response time < 500ms cho các query thông thường.
* **Scalability**: Thiết kế database có index để hỗ trợ mở rộng sau này.

## IV. Công nghệ sử dụng (Technology Stack)

### 4.1. Backend
* **Runtime**: Node.js (v18+)
* **Framework**: Express.js
* **Database**: MySQL (v8.0+)
* **ORM/Query**: mysql2 package (raw SQL queries)
* **Authentication**: 
    * bcrypt (password hashing, salt rounds = 10)
    * jsonwebtoken (JWT token generation & verification)
* **Security**: 
    * cors (Cross-Origin Resource Sharing)
    * dotenv (Environment variables management)
* **Development Tools**:
    * nodemon (Auto-restart server)
    * Postman/Thunder Client (API testing)

### 4.2. Frontend
* **Library**: React (v18+)
* **Build Tool**: Vite
* **Routing**: React Router DOM (v6+)
* **HTTP Client**: Axios
* **State Management**: React Context API (AuthContext)
* **Styling**: CSS Modules / Tailwind CSS (tùy chọn)
* **UI Components**: Custom components hoặc Material-UI/Ant Design (tùy chọn)

### 4.3. Database Management
* **DBMS**: MySQL Workbench / DBeaver
* **Migration**: Manual SQL scripts
* **Backup**: mysqldump

### 4.4. Version Control & Deployment
* **Version Control**: Git + GitHub
* **Backend Deployment**: Heroku / Railway / Render (tùy chọn)
* **Frontend Deployment**: Vercel / Netlify (tùy chọn)
* **Database Hosting**: PlanetScale / Railway MySQL (tùy chọn)

### 4.5. Development Approach
* **Strategy**: Backend-First Development
* **API Architecture**: RESTful API
* **API Documentation**: Postman Collection
* **Testing**: Manual testing với Postman (Backend), Browser testing (Frontend)

## V. Thiết kế Cơ sở dữ liệu (Database Schema)

### 5.1. Bảng Users
* **id**: INT, Primary Key, Auto Increment
* **username**: VARCHAR(50), Unique, Not Null
* **email**: VARCHAR(100), Unique, Not Null
* **password_hash**: VARCHAR(255), Not Null (bcrypt hashed)
* **full_name**: VARCHAR(100)
* **created_at**: TIMESTAMP, Default CURRENT_TIMESTAMP
* **updated_at**: TIMESTAMP, Default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

### 5.2. Bảng UserRoles (Multi-role support)
* **id**: INT, Primary Key, Auto Increment
* **user_id**: INT, Foreign Key → Users.id, Not Null
* **role**: ENUM('student', 'instructor', 'admin'), Not Null
* **created_at**: TIMESTAMP, Default CURRENT_TIMESTAMP
* **Unique Key**: (user_id, role)

### 5.3. Bảng RefreshTokens (JWT Authentication)
* **id**: INT, Primary Key, Auto Increment
* **user_id**: INT, Foreign Key → Users.id, Not Null
* **token**: VARCHAR(500), Unique, Not Null
* **expires_at**: TIMESTAMP, Not Null
* **created_at**: TIMESTAMP, Default CURRENT_TIMESTAMP

### 5.4. Bảng Categories
* **id**: INT, Primary Key, Auto Increment
* **category_name**: VARCHAR(100), Unique, Not Null
* **description**: TEXT
* **created_at**: TIMESTAMP, Default CURRENT_TIMESTAMP
* **updated_at**: TIMESTAMP, Default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

### 5.5. Bảng Courses
* **id**: INT, Primary Key, Auto Increment
* **instructor_id**: INT, Foreign Key → Users.id, Not Null
* **category_id**: INT, Foreign Key → Categories.id, Not Null
* **title**: VARCHAR(255), Not Null
* **description**: TEXT
* **price**: DECIMAL(10,2), Not Null, Default 0.00
* **thumbnail_url**: VARCHAR(500)
* **created_at**: TIMESTAMP, Default CURRENT_TIMESTAMP
* **updated_at**: TIMESTAMP, Default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

### 5.6. Bảng Lessons
* **id**: INT, Primary Key, Auto Increment
* **course_id**: INT, Foreign Key → Courses.id, Not Null
* **title**: VARCHAR(255), Not Null
* **content**: TEXT
* **video_url**: VARCHAR(500)
* **order**: INT, Not Null, Default 1
* **created_at**: TIMESTAMP, Default CURRENT_TIMESTAMP
* **updated_at**: TIMESTAMP, Default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

### 5.7. Bảng Enrollments
* **id**: INT, Primary Key, Auto Increment
* **user_id**: INT, Foreign Key → Users.id, Not Null
* **course_id**: INT, Foreign Key → Courses.id, Not Null
* **status**: ENUM('pending', 'approved', 'rejected'), Default 'pending'
* **enrolled_at**: TIMESTAMP, Default CURRENT_TIMESTAMP
* **updated_at**: TIMESTAMP, Default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
* **Unique Key**: (user_id, course_id)

### 5.8. Relationships
* Users (1) ----< (N) UserRoles
* Users (1) ----< (N) RefreshTokens
* Users (1) ----< (N) Courses (as instructor)
* Users (1) ----< (N) Enrollments (as student)
* Categories (1) ----< (N) Courses
* Courses (1) ----< (N) Lessons
* Courses (1) ----< (N) Enrollments

### 5.9. Indexes (Performance Optimization)
* UserRoles: INDEX(user_id), INDEX(role)
* RefreshTokens: INDEX(user_id), INDEX(token)
* Courses: INDEX(instructor_id), INDEX(category_id)
* Lessons: INDEX(course_id), INDEX(course_id, order)
* Enrollments: INDEX(user_id), INDEX(course_id), INDEX(status)


## VI. API Endpoints Overview

### 6.1. Authentication APIs
* **POST** /api/auth/register - Đăng ký tài khoản mới
* **POST** /api/auth/login - Đăng nhập (Student/Instructor)
* **POST** /api/admin/login - Đăng nhập Admin
* **POST** /api/auth/logout - Đăng xuất (xóa refresh token)

### 6.2. Guest APIs (Public - No Auth Required)
* **GET** /api/courses - Lấy danh sách tất cả khóa học
* **GET** /api/courses/:id - Lấy chi tiết khóa học
* **GET** /api/categories - Lấy danh sách danh mục

### 6.3. Student APIs (Auth Required - Role: student)
* **POST** /api/enrollments - Đăng ký khóa học
* **GET** /api/my-courses - Lấy danh sách khóa học đã đăng ký
* **GET** /api/courses/:id/lessons - Lấy danh sách bài học (nếu đã enroll)

### 6.4. Instructor APIs (Auth Required - Role: instructor)
* **POST** /api/instructor/become - Đăng ký trở thành instructor
* **GET** /api/instructor/courses - Lấy khóa học của tôi
* **POST** /api/instructor/courses - Tạo khóa học mới
* **PUT** /api/instructor/courses/:id - Sửa khóa học của tôi
* **DELETE** /api/instructor/courses/:id - Xóa khóa học của tôi
* **GET** /api/instructor/lessons - Lấy bài học của tôi
* **POST** /api/instructor/lessons - Tạo bài học mới
* **PUT** /api/instructor/lessons/:id - Sửa bài học của tôi
* **DELETE** /api/instructor/lessons/:id - Xóa bài học của tôi
* **GET** /api/instructor/enrollments - Lấy enrollment của khóa học tôi tạo
* **PUT** /api/instructor/enrollments/:id/approve - Duyệt enrollment
* **PUT** /api/instructor/enrollments/:id/reject - Từ chối enrollment

### 6.5. Admin APIs (Auth Required - Role: admin)
* **GET** /api/admin/categories - Lấy tất cả danh mục
* **POST** /api/admin/categories - Tạo danh mục mới
* **PUT** /api/admin/categories/:id - Sửa danh mục
* **DELETE** /api/admin/categories/:id - Xóa danh mục
* **GET** /api/admin/courses - Lấy tất cả khóa học
* **POST** /api/admin/courses - Tạo khóa học mới
* **PUT** /api/admin/courses/:id - Sửa khóa học
* **DELETE** /api/admin/courses/:id - Xóa khóa học
* **GET** /api/admin/lessons - Lấy tất cả bài học
* **POST** /api/admin/lessons - Tạo bài học mới
* **PUT** /api/admin/lessons/:id - Sửa bài học
* **DELETE** /api/admin/lessons/:id - Xóa bài học
* **GET** /api/admin/enrollments - Lấy tất cả enrollment
* **PUT** /api/admin/enrollments/:id - Cập nhật enrollment
* **GET** /api/admin/users - Lấy danh sách users
* **PUT** /api/admin/users/:id/roles - Cập nhật roles của user

## VII. Quy trình phát triển (Development Workflow)

### 7.1. Phase 1: Backend Development (16 ngày)
1. **Setup & Database** (2 ngày)
   - Cài đặt Node.js, Express, MySQL
   - Tạo database schema từ ERD
   - Setup project structure
   - Cấu hình environment variables

2. **Authentication Module** (3 ngày)
   - Implement Register API
   - Implement Login API (Student/Admin)
   - Implement JWT middleware
   - Implement role-based authorization
   - Test với Postman

3. **Guest & Student Module** (4 ngày)
   - Implement Course APIs (list, detail)
   - Implement Category APIs
   - Implement Enrollment APIs
   - Implement My Courses APIs
   - Test với Postman

4. **Admin Module** (3 ngày)
   - Implement Category CRUD
   - Implement Course CRUD (all courses)
   - Implement Lesson CRUD (all lessons)
   - Implement Enrollment management
   - Test với Postman

5. **Instructor Module** (4 ngày)
   - Implement Become Instructor API
   - Implement My Courses CRUD
   - Implement My Lessons CRUD
   - Implement My Enrollments management
   - Test với Postman

### 7.2. Phase 2: Frontend Development (10 ngày)
1. **Setup & Auth Pages** (2 ngày)
   - Setup React + Vite
   - Create AuthContext
   - Implement Register page
   - Implement Login page
   - Setup Axios interceptor

2. **Guest Pages** (3 ngày)
   - Implement Homepage
   - Implement Course List page
   - Implement Course Detail page
   - Implement Header/Footer components

3. **Student Pages** (2 ngày)
   - Implement My Courses page
   - Implement Learning page
   - Implement Enrollment flow

4. **Admin Dashboard** (2 ngày)
   - Implement Admin layout
   - Implement Category management
   - Implement Course management
   - Implement Lesson management

5. **Instructor Dashboard** (2 ngày)
   - Implement Instructor layout
   - Implement My Courses management
   - Implement My Lessons management
   - Implement My Enrollments management

### 7.3. Phase 3: Integration & Testing (4 ngày)
1. **Integration** (2 ngày)
   - Connect Frontend với Backend APIs
   - Fix CORS issues
   - Handle error responses
   - Implement loading states

2. **Testing & Bug Fixes** (2 ngày)
   - Test toàn bộ user flows
   - Fix bugs
   - Optimize performance
   - Prepare for deployment

## VIII. Tiêu chí hoàn thành (Definition of Done)

### 8.1. Backend
- ✅ Tất cả API endpoints hoạt động đúng
- ✅ JWT authentication & authorization hoạt động
- ✅ Password được hash bằng bcrypt
- ✅ Phân quyền đúng (Admin, Instructor, Student)
- ✅ Instructor chỉ thấy dữ liệu của mình
- ✅ Validation đầy đủ cho tất cả input
- ✅ Error handling đầy đủ
- ✅ Test bằng Postman thành công

### 8.2. Frontend
- ✅ Tất cả pages render đúng
- ✅ Responsive trên PC và Mobile
- ✅ Form validation hoạt động
- ✅ Loading states hiển thị đúng
- ✅ Error messages hiển thị rõ ràng
- ✅ Navigation hoạt động mượt mà
- ✅ JWT token được lưu và gửi đúng

### 8.3. Integration
- ✅ Frontend gọi Backend APIs thành công
- ✅ CORS được cấu hình đúng
- ✅ Toàn bộ user flows hoạt động end-to-end
- ✅ Không có lỗi console
- ✅ Performance chấp nhận được

## IX. Tài liệu tham khảo (References)
* **ERD**: docs/ERD_ACADELINK.dbml, docs/ERD_ACADELINK.sql
* **User Stories**: docs/US-001 đến US-017
* **JWT & Security**: docs/ERD_JWT_RefreshTokens.md, docs/BCRYPT_HASHING_EXPLANATION.md
* **Development Strategy**: docs/DEVELOPMENT_STRATEGY.md
* **Roadmap**: docs/ROADMAP_Mini_LMS.md

---

**Ngày cập nhật**: 27/03/2026  
**Phiên bản**: 2.0  
**Trạng thái**: Ready for Development
