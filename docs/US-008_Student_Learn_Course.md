# USER STORY 8: HỌC KHÓA HỌC (STUDENT)

## 1. Thông tin chung (Card)
* **Đối tượng**: Là một học viên đã đăng ký và được duyệt khóa học.
* **Hành động**: Tôi muốn xem nội dung video/text của các bài học trong khóa học.
* **Mục tiêu**: Để học tập và hoàn thành khóa học đã đăng ký.

## 2. Tóm tắt (Summary)
Hiển thị trang học khóa học trong hệ thống ACADELINK với danh sách bài học bên trái và nội dung video/text bên phải, cho phép học viên đã được duyệt truy cập và xem toàn bộ nội dung khóa học.

## 3. Phạm vi (Scope)
### Trong phạm vi (In-scope):
* Kiểm tra quyền truy cập: Chỉ Student có enrollment với status = "approved" mới được vào học.
* Hiển thị sidebar danh sách bài học (Lesson list) với tên và thứ tự.
* Hiển thị nội dung bài học hiện tại ở khu vực chính:
    - Nếu bài học có video_url -> Hiển thị video player (embed YouTube hoặc video HTML5).
    - Nếu bài học có content (text) -> Hiển thị nội dung text.
* Click vào bài học trong sidebar -> Chuyển sang xem bài học đó.
* Hiển thị tên khóa học và tên bài học đang xem.
* Nút "Quay lại" để về trang "Khóa học của tôi".
* Responsive: Sidebar có thể toggle (ẩn/hiện) trên mobile.

### Ngoài phạm vi (Out of Scope):
* Tracking tiến độ học tập (đánh dấu bài học đã xem).
* Nút "Bài tiếp theo" / "Bài trước".
* Tải xuống tài liệu bài học.
* Bình luận/thảo luận trong bài học.
* Quiz/bài tập.
* Chứng chỉ hoàn thành khóa học.

## 4. Điều kiện & Quy tắc (Rules)
* **Kích hoạt (Trigger)**: Student click "Vào học" từ trang "Khóa học của tôi" hoặc truy cập URL "/courses/:id/learn".
* **Điều kiện tiên quyết (Pre-condition)**:
    * Student phải đã đăng nhập.
    * Student phải có enrollment cho khóa học này với status = "approved".
    * Khóa học phải có ít nhất một bài học.
* **Quy tắc kinh doanh & Thông báo lỗi**:
    * Nếu Student chưa đăng ký khóa học -> Chuyển hướng đến trang chi tiết khóa học với thông báo "Bạn chưa đăng ký khóa học này."
    * Nếu enrollment có status = "pending" -> Hiển thị thông báo "Đăng ký của bạn đang chờ duyệt. Vui lòng quay lại sau."
    * Nếu enrollment có status = "rejected" -> Hiển thị thông báo "Đăng ký của bạn đã bị từ chối."
    * Mặc định hiển thị bài học đầu tiên (order = 1) khi vào trang.
    * Danh sách bài học được sắp xếp theo thứ tự (order ASC).

## 5. Thiết kế giao diện (Screen Design & Description)
Giao diện trang học khóa học:
1. **Header**: Đơn giản hơn, chỉ có Logo và tên khóa học, nút "Quay lại".
2. **Layout 2 cột**:
    * **Sidebar bên trái (30%)**:
        - Tiêu đề: "Nội dung khóa học".
        - Danh sách bài học dạng list:
            + Số thứ tự.
            + Tên bài học.
            + Highlight bài học đang xem.
        - Toggle button để ẩn/hiện sidebar (mobile).
    * **Main content bên phải (70%)**:
        - Tên bài học đang xem (H2).
        - Video player (nếu có video_url):
            + Embed YouTube iframe hoặc HTML5 video tag.
        - Nội dung text (nếu có content):
            + Hiển thị dưới dạng HTML hoặc markdown.
3. **Responsive**:
    * Mobile: Sidebar có thể toggle, main content chiếm full width khi sidebar ẩn.

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)

1. Trước khi hiển thị nội dung, phải kiểm tra quyền truy cập: SELECT status FROM Enrollments WHERE student_id = :user_id AND course_id = :course_id. Chỉ cho phép truy cập nếu status = 'approved'.

2. Nếu enrollment không tồn tại, chuyển hướng đến "/courses/:id" với thông báo "Bạn chưa đăng ký khóa học này."

3. Nếu status = 'pending', hiển thị thông báo "Đăng ký của bạn đang chờ duyệt. Vui lòng quay lại sau." và không cho xem nội dung.

4. Nếu status = 'rejected', hiển thị thông báo "Đăng ký của bạn đã bị từ chối." và không cho xem nội dung.

5. Layout phải có 2 phần: Sidebar bên trái (30% width) và Main content bên phải (70% width).

6. Sidebar phải hiển thị danh sách tất cả bài học của khóa học, query: SELECT * FROM Lessons WHERE course_id = :course_id ORDER BY order ASC.

7. Mỗi bài học trong sidebar hiển thị: Số thứ tự (order), Tên bài học. Bài học đang xem phải được highlight (background color khác).

8. Mặc định khi vào trang, hiển thị bài học đầu tiên (order = 1 hoặc MIN(order)).

9. Main content phải hiển thị: Tên bài học (H2), Video player (nếu video_url không NULL), Nội dung text (nếu content không NULL).

10. Video player: Nếu video_url là YouTube link -> Dùng iframe embed. Nếu là direct video URL -> Dùng HTML5 <video> tag.

11. Click vào bài học trong sidebar phải cập nhật URL thành "/courses/:id/learn?lesson=:lesson_id" và load nội dung bài học đó.

12. Nút "Quay lại" phải chuyển hướng về "/my-courses".

13. Trên mobile, sidebar phải có thể toggle (ẩn/hiện) bằng button hamburger menu.

14. API endpoint: GET /api/courses/:id/lessons (yêu cầu JWT token, kiểm tra enrollment approved).
