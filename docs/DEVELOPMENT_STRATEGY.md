# CHIẾN LƯỢC PHÁT TRIỂN ACADELINK

## CÂU HỎI: NÊN CODE BE TRƯỚC HAY FE TRƯỚC?

### 🎯 KHUYẾN NGHỊ: **CODE BE TRƯỚC** (Backend-First Approach)

---

## LÝ DO NÊN CODE BE TRƯỚC

### ✅ **1. Backend là nền tảng của hệ thống**
- Database schema đã rõ ràng (ERD đã có)
- Business logic phức tạp (authentication, authorization, enrollment workflow)
- API endpoints đã được định nghĩa chi tiết trong User Stories
- Frontend phụ thuộc vào API → Nếu API chưa có, FE chỉ code mock data

### ✅ **2. Test và debug dễ dàng hơn**
- Dùng Postman/Thunder Client test API ngay
- Không cần UI để verify logic
- Phát hiện lỗi business logic sớm
- Đảm bảo security (JWT, bcrypt) hoạt động đúng

### ✅ **3. Phân chia công việc hiệu quả**
- Nếu làm team: 1 người code BE, người khác có thể code FE song song (dùng mock API)
- Nếu làm 1 mình: BE xong → FE chỉ việc gọi API, không phải sửa logic

### ✅ **4. Tránh refactor nhiều lần**
- Nếu code FE trước với mock data → Khi BE xong phải sửa lại FE
- Nếu code BE trước → FE chỉ cần integrate, ít sửa

### ✅ **5. Phù hợp với dự án ACADELINK**
- Có nhiều business logic phức tạp:
  - Multi-role system (1 user nhiều role)
  - Enrollment workflow (pending → approved/rejected)
  - Instructor chỉ thấy dữ liệu của mình (WHERE instructor_id = user_id)
  - JWT authentication với refresh token
- Logic này nên được xử lý và test ở BE trước

---

## ROADMAP PHÁT TRIỂN (BACKEND-FIRST)

### 📌 **PHASE 1: SETUP & DATABASE (1-2 ngày)**

#### 1.1. Setup Backend
```bash
# Tạo project Node.js + Express
npm init -y
npm install express mysql2 bcrypt jsonwebtoken dotenv cors
npm install --save-dev nodemon

# Cấu trúc thư mục
BE/
├── src/
│   ├── config/
│   │   └── database.js       # Kết nối MySQL
│   ├── middleware/
│   │   ├── auth.js           # Verify JWT
│   │   └── checkRole.js      # Kiểm tra role
│   ├── routes/
│   │   ├── auth.js           # Login, Register
│   │   ├── courses.js        # CRUD courses
│   │   ├── lessons.js        # CRUD lessons
│   │   └── enrollments.js    # CRUD enrollments
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   └── ...
│   └── app.js                # Main app
├── .env                      # SECRET_KEY, DB config
└── package.json
```

#### 1.2. Tạo Database
```sql
-- Chạy file ERD_ACADELINK.sql để tạo tables
-- Thêm dữ liệu mẫu (seed data)
```

---

### 📌 **PHASE 2: AUTHENTICATION (2-3 ngày)**

#### 2.1. Implement Register (US-001)
- POST /api/auth/register
- Validate input (email format, password length)
- Hash password bằng bcrypt (salt rounds = 10)
- INSERT vào bảng Users
- INSERT role 'student' vào bảng UserRoles
- Test bằng Postman

#### 2.2. Implement Login (US-002, US-009)
- POST /api/auth/login
- Query user by email
- bcrypt.compare() password
- Query UserRoles để lấy roles
- Tạo JWT token (payload: user_id, email, roles, exp)
- Test bằng Postman

#### 2.3. Implement Middleware
- auth.js: Verify JWT token
- checkRole.js: Kiểm tra role (admin, instructor, student)
- Test với Postman (gửi token trong header)

---

### 📌 **PHASE 3: GUEST & STUDENT FEATURES (3-4 ngày)**

#### 3.1. Guest APIs (US-003, US-004, US-005)
- GET /api/courses (list all courses)
- GET /api/courses/:id (course detail)
- GET /api/categories (list categories)
- Không cần authentication

#### 3.2. Student APIs (US-006, US-007, US-008)
- POST /api/enrollments (đăng ký khóa học) - Cần auth
- GET /api/my-courses (khóa học đã đăng ký) - Cần auth
- GET /api/courses/:id/lessons (xem bài học) - Cần auth + enrollment approved

---

### 📌 **PHASE 4: ADMIN FEATURES (2-3 ngày)**

#### 4.1. Admin APIs (US-010, US-011, US-012, US-013)
- Categories CRUD: GET, POST, PUT, DELETE /api/admin/categories
- Courses CRUD: GET, POST, PUT, DELETE /api/admin/courses
- Lessons CRUD: GET, POST, PUT, DELETE /api/admin/lessons
- Enrollments: GET, PUT /api/admin/enrollments (approve/reject)
- Middleware: checkRole(['admin'])

---

### 📌 **PHASE 5: INSTRUCTOR FEATURES (3-4 ngày)**

#### 5.1. Instructor APIs (US-014, US-015, US-016, US-017)
- POST /api/instructor/become (student → instructor)
- Courses CRUD: GET, POST, PUT, DELETE /api/instructor/courses
  - WHERE instructor_id = req.user.user_id
- Lessons CRUD: GET, POST, PUT, DELETE /api/instructor/lessons
  - WHERE course_id IN (SELECT id FROM Courses WHERE instructor_id = req.user.user_id)
- Enrollments: GET, PUT /api/instructor/enrollments (approve/reject)
  - WHERE course_id IN (SELECT id FROM Courses WHERE instructor_id = req.user.user_id)

---

### 📌 **PHASE 6: FRONTEND (7-10 ngày)**

#### 6.1. Setup Frontend
```bash
# React + Vite
npm create vite@latest FE -- --template react
cd FE
npm install axios react-router-dom

# Cấu trúc
FE/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── CourseCard.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── CourseDetail.jsx
│   │   ├── MyCourses.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── InstructorDashboard.jsx
│   ├── services/
│   │   └── api.js          # Axios instance với interceptor
│   ├── context/
│   │   └── AuthContext.jsx # Quản lý user state
│   └── App.jsx
```

#### 6.2. Implement Pages theo thứ tự
1. **Guest pages** (3 ngày):
   - Home, CourseList, CourseDetail
   - Gọi API: GET /api/courses, GET /api/courses/:id
   
2. **Auth pages** (2 ngày):
   - Register, Login
   - Gọi API: POST /api/auth/register, POST /api/auth/login
   - Lưu token vào localStorage
   
3. **Student pages** (2 ngày):
   - MyCourses, LearnCourse
   - Gọi API: GET /api/my-courses, POST /api/enrollments
   
4. **Admin pages** (2 ngày):
   - AdminDashboard, ManageCategories, ManageCourses, ManageLessons
   - Gọi API: /api/admin/*
   
5. **Instructor pages** (2 ngày):
   - InstructorDashboard, MyCourses, MyLessons, MyEnrollments
   - Gọi API: /api/instructor/*

---

## SO SÁNH 2 CÁCH TIẾP CẬN

### ❌ **Frontend-First (KHÔNG khuyến nghị)**

**Ưu điểm**:
- Thấy UI ngay, dễ demo
- Phù hợp với dự án đơn giản (todo list, blog cá nhân)

**Nhược điểm**:
- Phải code mock data → Lãng phí thời gian
- Khi BE xong phải refactor FE nhiều
- Không test được business logic thực tế
- Khó phát hiện lỗi logic sớm
- Không phù hợp với dự án phức tạp như ACADELINK

### ✅ **Backend-First (KHUYẾN NGHỊ)**

**Ưu điểm**:
- Business logic được test kỹ trước
- API endpoints rõ ràng → FE dễ integrate
- Phát hiện lỗi sớm
- Ít refactor hơn
- Phù hợp với dự án có logic phức tạp

**Nhược điểm**:
- Không thấy UI ngay (nhưng có thể demo bằng Postman)
- Cần kiến thức về API testing

---

## TIMELINE DỰ KIẾN (1 NGƯỜI)

| Phase | Nội dung | Thời gian | Tổng cộng |
|-------|----------|-----------|-----------|
| 1 | Setup + Database | 1-2 ngày | 2 ngày |
| 2 | Authentication | 2-3 ngày | 5 ngày |
| 3 | Guest & Student APIs | 3-4 ngày | 9 ngày |
| 4 | Admin APIs | 2-3 ngày | 12 ngày |
| 5 | Instructor APIs | 3-4 ngày | 16 ngày |
| 6 | Frontend | 7-10 ngày | 26 ngày |
| 7 | Testing & Bug fixes | 3-4 ngày | 30 ngày |

**Tổng cộng: ~30 ngày (1 tháng)** - Phù hợp với deadline 30/04

---

## CÁCH LÀM VIỆC HIỆU QUẢ

### 🔥 **Nếu làm 1 mình**:
1. Code BE hoàn chỉnh trước (Phase 1-5: ~16 ngày)
2. Test kỹ bằng Postman
3. Code FE sau (Phase 6: ~10 ngày)
4. Integrate và test tổng thể

### 🔥 **Nếu làm team (2 người)**:
1. **Người 1**: Code BE (Phase 1-5)
2. **Người 2**: 
   - Đợi Phase 2 xong (có API login/register) → Code FE auth pages
   - Đợi Phase 3 xong (có API courses) → Code FE guest/student pages
   - Song song với BE, tiết kiệm thời gian

---

## CÔNG CỤ HỖ TRỢ

### Backend Testing:
- **Postman** hoặc **Thunder Client** (VS Code extension)
- Tạo collection cho từng module (Auth, Courses, Lessons...)
- Lưu environment variables (token, base_url)

### Database Management:
- **MySQL Workbench** hoặc **DBeaver**
- Xem dữ liệu, chạy query test

### Version Control:
- **Git**: Commit sau mỗi feature hoàn thành
- Branch strategy: main, develop, feature/auth, feature/courses...

---

## KẾT LUẬN

### 🎯 **Khuyến nghị cuối cùng: CODE BE TRƯỚC**

**Lý do chính**:
1. ✅ ACADELINK có business logic phức tạp (multi-role, enrollment workflow, phân quyền)
2. ✅ ERD và API endpoints đã rõ ràng trong User Stories
3. ✅ Test và debug BE dễ hơn (dùng Postman)
4. ✅ FE chỉ việc gọi API, không phải lo logic
5. ✅ Ít refactor hơn, tiết kiệm thời gian

**Bắt đầu từ đâu**:
1. Setup project BE + Database (1 ngày)
2. Code Authentication (Register + Login) (2 ngày)
3. Test bằng Postman → Nếu OK → Tiếp tục các API khác

**Câu nói nhớ**: "Backend là móng nhà, Frontend là trang trí. Móng vững thì nhà mới đẹp!"
