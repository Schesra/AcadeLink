# USER STORY 7: XEM KHÓA HỌC CỦA TÔI (STUDENT)

## 1. Thông tin chung (Card)
* **Đối tượng**: Là một học viên đã đăng nhập.
* **Hành động**: Tôi muốn xem danh sách các khóa học mà tôi đã đăng ký.
* **Mục tiêu**: Để theo dõi trạng thái đăng ký và truy cập vào các khóa học đã được duyệt.

## 2. Tóm tắt (Summary)
Hiển thị trang danh sách các khóa học mà học viên đã đăng ký trong hệ thống ACADELINK, bao gồm thông tin về trạng thái duyệt (pending/approved/rejected) và cho phép truy cập vào khóa học đã được duyệt.

## 3. Phạm vi (Scope)
### Trong phạm vi (In-scope):
* Hiển thị danh sách các khóa học đã đăng ký của học viên hiện tại.
* Mỗi card khóa học hiển thị: Thumbnail, Tên, Trạng thái (pending/approved/rejected).
* Badge màu sắc khác nhau cho từng trạng thái:
    - Pending: Màu vàng/cam - "Chờ duyệt"
    - Approved: Màu xanh - "Đã duyệt"
    - Rejected: Màu đỏ - "Từ chối"
* Nút "Vào học" chỉ hiển thị với khóa học có status = "approved".
* Click "Vào học" -> Chuyển đến trang học khóa học.
* Nếu chưa có khóa học nào -> Hiển thị thông báo và link đến trang danh sách khóa học.
* Responsive trên PC và Mobile.

### Ngoài phạm vi (Out of Scope):
* Hiển thị tiến độ học tập (% hoàn thành).
* Lọc khóa học theo trạng thái.
* Hủy đăng ký khóa học.
* Hiển thị ngày đăng ký.
* Sắp xếp khóa học.

## 4. Điều kiện & Quy tắc (Rules)
* **Kích hoạt (Trigger)**: Student click vào menu "Khóa học của tôi" hoặc truy cập URL "/my-courses".
* **Điều kiện tiên quyết (Pre-condition)**:
    * Student phải đã đăng nhập.
    * Thiết bị phải có kết nối Internet.
* **Quy tắc kinh doanh & Thông báo lỗi**:
    * Chỉ hiển thị các khóa học mà user_id = current user.
    * Khóa học được lấy từ bảng Enrollments join với bảng Courses.
    * Nếu chưa đăng ký khóa học nào, hiển thị: "Bạn chưa đăng ký khóa học nào. Khám phá các khóa học ngay!"
    * Chỉ khóa học có status = "approved" mới cho phép vào học.

## 5. Thiết kế giao diện (Screen Design & Description)
Giao diện "Khóa học của tôi":
1. **Header**: Giống các trang khác, menu "Khóa học của tôi" được highlight.
2. **Page Title**: "Khóa học của tôi".
3. **Course List**:
    * Grid layout 2-3 cột (PC), 1 cột (Mobile).
    * Mỗi card hiển thị:
        - Thumbnail khóa học.
        - Tên khóa học.
        - Badge trạng thái (Chờ duyệt/Đã duyệt/Từ chối).
        - Nút "Vào học" (chỉ hiển thị nếu status = approved).
4. **Empty State**:
    * Icon hoặc illustration.
    * Text: "Bạn chưa đăng ký khóa học nào".
    * Button: "Khám phá khóa học" -> Link đến "/courses".
5. **Footer**: Giống các trang khác.

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)

1. Trang phải hiển thị danh sách các khóa học mà Student đã đăng ký, lấy từ query: SELECT c.*, e.status, e.created_at as enrolled_at FROM Courses c JOIN Enrollments e ON c.id = e.course_id WHERE e.student_id = :user_id ORDER BY e.created_at DESC.

2. Mỗi card khóa học phải hiển thị: Thumbnail, Tên khóa học, Badge trạng thái (màu sắc khác nhau).

3. Badge trạng thái phải hiển thị theo status:
   - status = 'pending': Badge màu vàng/cam với text "Chờ duyệt"
   - status = 'approved': Badge màu xanh với text "Đã duyệt"
   - status = 'rejected': Badge màu đỏ với text "Từ chối"

4. Nút "Vào học" chỉ hiển thị khi status = 'approved'. Click nút -> Chuyển đến "/courses/:id/learn".

5. Nếu Student chưa đăng ký khóa học nào (query trả về empty), hiển thị empty state với:
   - Icon hoặc illustration
   - Text: "Bạn chưa đăng ký khóa học nào"
   - Button "Khám phá khóa học" -> Link đến "/courses"

6. API endpoint: GET /api/my-courses (yêu cầu JWT token trong header).

7. Middleware phải verify JWT token và lấy user_id từ payload để query enrollments.

8. Nếu user chưa đăng nhập (không có token hoặc token hết hạn), chuyển hướng đến "/login".

9. Giao diện phải responsive: grid 2-3 cột (PC), 1 cột (mobile).
