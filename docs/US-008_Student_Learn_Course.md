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
* **Truy cập thành công**: Student có enrollment approved -> Truy cập "/courses/:id/learn" -> Hiển thị trang học với sidebar và nội dung bài học đầu tiên.
* **Chưa đăng ký**: Student chưa đăng ký khóa học -> Truy cập URL này -> Chuyển hướng đến "/courses/:id" với thông báo lỗi.
* **Chờ duyệt**: Student có enrollment pending -> Truy cập URL này -> Hiển thị thông báo "Đăng ký đang chờ duyệt" và không cho xem nội dung.
* **Bị từ chối**: Student có enrollment rejected -> Hiển thị thông báo "Đăng ký đã bị từ chối".
* **Click bài học**: Click vào bài học thứ 3 trong sidebar -> Nội dung main content chuyển sang bài học thứ 3 -> Bài học thứ 3 được highlight trong sidebar.
* **Hiển thị video**: Bài học có video_url -> Hiển thị video player với video từ URL đó.
* **Hiển thị text**: Bài học có content -> Hiển thị nội dung text dưới video (hoặc thay video nếu không có video).
* **Quay lại**: Click "Quay lại" -> Chuyển đến "/my-courses".
* **Chưa đăng nhập**: Truy cập URL này khi chưa đăng nhập -> Chuyển hướng đến "/login".
* **Responsive**: Truy cập từ mobile -> Sidebar có thể toggle, main content responsive.
