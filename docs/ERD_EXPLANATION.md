# GIẢI THÍCH ERD - ACADELINK

## 1. TỔNG QUAN
ERD (Entity Relationship Diagram) của ACADELINK gồm **7 bảng chính**, được thiết kế để hỗ trợ hệ thống LMS với multi-role (một user có thể vừa là student vừa là instructor).

---

## 2. CÁC BẢNG VÀ CHỨC NĂNG

### 📌 **Bảng 1: users** (Người dùng)
**Mục đích**: Lưu thông tin tài khoản người dùng.

**Các trường quan trọng**:
- `id`: Mã định danh duy nhất (Primary Key)
- `username`: Tên đăng nhập (unique)
- `email`: Email (unique)
- `password_hash`: Mật khẩu đã mã hóa bằng bcrypt (KHÔNG lưu plain text)
- `full_name`: Họ tên đầy đủ
- `created_at`, `updated_at`: Thời gian tạo/cập nhật

**Lưu ý**: Bảng này KHÔNG có trường `role` vì hệ thống hỗ trợ multi-role (một user nhiều role).

---

### 📌 **Bảng 2: user_roles** (Vai trò người dùng)
**Mục đích**: Quản lý vai trò của từng user (multi-role system).

**Các trường quan trọng**:
- `id`: Primary Key
- `user_id`: Tham chiếu đến bảng `users` (Foreign Key)
- `role`: Vai trò (student, instructor, admin)
- `created_at`: Thời gian gán role

**Ví dụ thực tế**:
```
user_id | role
--------|----------
1       | student
1       | instructor  <- User 1 vừa là student vừa là instructor
2       | admin
```

**Quan hệ**: 
- `user_roles.user_id > users.id` (Many-to-One: Nhiều role thuộc về 1 user)

---

### 📌 **Bảng 3: refresh_tokens** (Token xác thực)
**Mục đích**: Lưu JWT refresh token để duy trì phiên đăng nhập.

**Các trường quan trọng**:
- `id`: Primary Key
- `user_id`: User sở hữu token (Foreign Key)
- `token`: Refresh token string (unique)
- `expires_at`: Thời gian hết hạn
- `created_at`: Thời gian tạo

**Cách hoạt động**:
1. User đăng nhập → Hệ thống tạo Access Token (15 phút) + Refresh Token (7 ngày)
2. Access Token hết hạn → Dùng Refresh Token để lấy Access Token mới
3. Refresh Token hết hạn → User phải đăng nhập lại

**Quan hệ**: 
- `refresh_tokens.user_id > users.id` (Many-to-One: 1 user có thể có nhiều token từ nhiều thiết bị)

---

### 📌 **Bảng 4: categories** (Danh mục khóa học)
**Mục đích**: Phân loại khóa học theo chủ đề.

**Các trường quan trọng**:
- `id`: Primary Key
- `category_name`: Tên danh mục (unique) - VD: "Lập trình", "Thiết kế", "Marketing"
- `description`: Mô tả danh mục
- `created_at`, `updated_at`: Thời gian tạo/cập nhật

**Ví dụ**:
```
id | category_name
---|---------------
1  | Lập trình Web
2  | Thiết kế UI/UX
3  | Marketing Online
```

---

### 📌 **Bảng 5: courses** (Khóa học)
**Mục đích**: Lưu thông tin các khóa học do instructor tạo ra.

**Các trường quan trọng**:
- `id`: Primary Key
- `instructor_id`: Instructor tạo khóa học (Foreign Key → users.id)
- `category_id`: Danh mục khóa học (Foreign Key → categories.id)
- `title`: Tên khóa học
- `description`: Mô tả chi tiết
- `price`: Giá khóa học (decimal)
- `thumbnail_url`: Link ảnh thumbnail
- `created_at`, `updated_at`: Thời gian tạo/cập nhật

**Quan hệ**:
- `courses.instructor_id > users.id` (Many-to-One: 1 instructor tạo nhiều khóa học)
- `courses.category_id > categories.id` (Many-to-One: 1 category có nhiều khóa học)

**Ví dụ**:
```
id | instructor_id | category_id | title                  | price
---|---------------|-------------|------------------------|-------
1  | 5             | 1           | React từ Zero đến Hero | 299000
2  | 5             | 1           | Node.js Backend        | 399000
```

---

### 📌 **Bảng 6: lessons** (Bài học)
**Mục đích**: Lưu các bài học trong mỗi khóa học.

**Các trường quan trọng**:
- `id`: Primary Key
- `course_id`: Khóa học chứa bài học (Foreign Key → courses.id)
- `title`: Tên bài học
- `content`: Nội dung text bài học
- `video_url`: Link video bài học
- `order`: Thứ tự bài học (1, 2, 3...)
- `created_at`, `updated_at`: Thời gian tạo/cập nhật

**Quan hệ**:
- `lessons.course_id > courses.id` (Many-to-One: 1 khóa học có nhiều bài học)

**Ví dụ**:
```
id | course_id | title                    | order
---|-----------|--------------------------|-------
1  | 1         | Giới thiệu React         | 1
2  | 1         | JSX và Components        | 2
3  | 1         | State và Props           | 3
```

---

### 📌 **Bảng 7: enrollments** (Ghi danh)
**Mục đích**: Quản lý việc student đăng ký vào khóa học.

**Các trường quan trọng**:
- `id`: Primary Key
- `user_id`: Student đăng ký (Foreign Key → users.id)
- `course_id`: Khóa học được đăng ký (Foreign Key → courses.id)
- `status`: Trạng thái (pending, approved, rejected)
- `enrolled_at`: Thời gian đăng ký
- `updated_at`: Thời gian cập nhật trạng thái

**Quan hệ**:
- `enrollments.user_id > users.id` (Many-to-One: 1 student đăng ký nhiều khóa học)
- `enrollments.course_id > courses.id` (Many-to-One: 1 khóa học có nhiều enrollment)

**Workflow**:
1. Student click "Đăng ký khóa học" → Tạo record với `status = 'pending'`
2. Instructor duyệt → Cập nhật `status = 'approved'` → Student có thể học
3. Instructor từ chối → Cập nhật `status = 'rejected'` → Student không thể học

**Ví dụ**:
```
id | user_id | course_id | status   | enrolled_at
---|---------|-----------|----------|-------------
1  | 10      | 1         | approved | 2026-03-20
2  | 11      | 1         | pending  | 2026-03-25
3  | 12      | 1         | rejected | 2026-03-24
```

---

## 3. QUAN HỆ GIỮA CÁC BẢNG

### Sơ đồ quan hệ:
```
users (1) ----< (N) user_roles
users (1) ----< (N) refresh_tokens
users (1) ----< (N) courses (as instructor)
users (1) ----< (N) enrollments (as student)

categories (1) ----< (N) courses

courses (1) ----< (N) lessons
courses (1) ----< (N) enrollments
```

### Giải thích ký hiệu:
- `(1) ----< (N)`: Quan hệ One-to-Many (1 bên trái có nhiều bên phải)
- `>`: Mũi tên chỉ từ Foreign Key về Primary Key

---

## 4. ĐIỂM NỔI BẬT CỦA THIẾT KẾ

### ✅ **Multi-Role System**
- Tách bảng `user_roles` riêng → 1 user có thể có nhiều role
- Ví dụ: User vừa là student (học khóa học) vừa là instructor (bán khóa học)

### ✅ **JWT Authentication**
- Bảng `refresh_tokens` lưu refresh token
- Hỗ trợ đăng nhập nhiều thiết bị (1 user nhiều token)
- Tự động xóa token khi user đăng xuất

### ✅ **Security**
- Password được hash bằng bcrypt (salt rounds = 10)
- Không lưu plain text password
- JWT token có thời gian hết hạn

### ✅ **Phân quyền rõ ràng**
- Admin: Toàn quyền quản lý tất cả
- Instructor: Chỉ quản lý khóa học/bài học/enrollment của mình (WHERE instructor_id = user_id)
- Student: Chỉ xem khóa học đã được approve

### ✅ **Enrollment Workflow**
- Student đăng ký → Pending
- Instructor duyệt → Approved (học được) hoặc Rejected (không học được)
- Tránh spam enrollment

---

## 5. CÂU HỎI GIẢNG VIÊN CÓ THỂ HỎI

### ❓ **Tại sao tách bảng user_roles riêng?**
**Trả lời**: Để hỗ trợ multi-role. Nếu lưu role trong bảng users (1 trường), 1 user chỉ có 1 role. Tách riêng cho phép 1 user có nhiều role đồng thời (vừa student vừa instructor).

### ❓ **Tại sao cần bảng refresh_tokens?**
**Trả lời**: 
- Access Token có thời gian ngắn (15 phút) để bảo mật
- Refresh Token có thời gian dài (7 ngày) để user không phải đăng nhập liên tục
- Lưu database để có thể thu hồi token khi cần (logout, đổi password)

### ❓ **Tại sao enrollment có status thay vì tự động approve?**
**Trả lời**: 
- Instructor cần kiểm soát ai được học khóa học của mình
- Tránh spam enrollment
- Có thể mở rộng thêm logic thanh toán sau này (pending → paid → approved)

### ❓ **Nếu xóa user thì sao?**
**Trả lời**: 
- Cascade delete: Xóa user → Tự động xóa user_roles, refresh_tokens, enrollments
- Courses và Lessons cũng bị xóa (vì instructor bị xóa)
- Đây là thiết kế hợp lý vì không nên giữ dữ liệu của user đã xóa

### ❓ **Tại sao lessons có trường order?**
**Trả lời**: 
- Để sắp xếp thứ tự bài học (Bài 1, Bài 2, Bài 3...)
- Student học theo trình tự logic
- Instructor có thể sắp xếp lại thứ tự dễ dàng

---

## 6. KẾT LUẬN

ERD này được thiết kế:
- ✅ Đầy đủ chức năng cho hệ thống LMS
- ✅ Hỗ trợ multi-role linh hoạt
- ✅ Bảo mật cao (bcrypt + JWT)
- ✅ Phân quyền rõ ràng
- ✅ Dễ mở rộng sau này (thêm payment, rating, comments...)
- ✅ Tuân thủ chuẩn thiết kế database (normalization, foreign keys, indexes)
