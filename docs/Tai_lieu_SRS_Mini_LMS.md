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
* **Bảo mật**: Sử dụng JWT Token đính kèm request header cho các API bảo mật.

## IV. Gợi ý Thiết kế Cơ sở dữ liệu (Database Schema)
* **Bảng Users**: id, name, email, password, created_at.
* **Bảng UserRoles**: id, user_id, role (student/instructor/admin).
* **Bảng Categories**: id, category_name.
* **Bảng Courses**: id, instructor_id, title, price, description, thumbnail_url, category_id, created_at.
* **Bảng Lessons**: id, course_id, title, video_url, content, order.
* **Bảng Enrollments**: id, student_id, course_id, status, created_at.
