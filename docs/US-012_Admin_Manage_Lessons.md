# USER STORY 12: QUẢN LÝ BÀI HỌC (ADMIN)

## 1. Thông tin chung (Card)
* **Đối tượng**: Là một quản trị viên (Admin).
* **Hành động**: Tôi muốn thêm, sửa, xóa tất cả bài học trong hệ thống.
* **Mục tiêu**: Để quản lý và kiểm soát toàn bộ nội dung bài học trên nền tảng ACADELINK.

## 2. Tóm tắt (Summary)
Cung cấp giao diện quản lý tất cả bài học cho Admin trong hệ thống ACADELINK với đầy đủ chức năng CRUD. Admin có quyền cao nhất, có thể thêm, sửa, xóa bài học vào bất kỳ khóa học nào.

## 3. Phạm vi (Scope)
### Trong phạm vi (In-scope):
* Hiển thị trang danh sách tất cả bài học dưới dạng bảng (table).
* Mỗi row hiển thị: ID, Tên bài học, Khóa học, Thứ tự, Actions (Sửa/Xóa).
* Nút "Thêm bài học mới" để mở form thêm bài học.
* Form thêm bài học với các trường:
    - Khóa học (dropdown select, required)
    - Tên bài học (text, required)
    - Video URL (text, optional)
    - Nội dung (textarea, optional)
    - Thứ tự (number, required)
* Form sửa bài học: Load thông tin hiện tại -> Cho phép chỉnh sửa -> Submit -> Cập nhật database.
* Chức năng xóa bài học: Click "Xóa" -> Confirm dialog -> Xóa khỏi database.
* Validate: Tên bài học và Khóa học không được bỏ trống, Thứ tự phải là số dương.
* Hiển thị thông báo thành công/lỗi sau mỗi thao tác.

### Ngoài phạm vi (Out of Scope):
* Upload file video (chỉ nhập URL).
* Rich text editor cho nội dung (chỉ textarea đơn giản).
* Tìm kiếm bài học.
* Lọc bài học theo khóa học.
* Sắp xếp bài học.
* Phân trang (pagination).
* Drag & drop để sắp xếp thứ tự bài học.
* Xem trước video/nội dung.

## 4. Điều kiện & Quy tắc (Rules)
* **Kích hoạt (Trigger)**: Admin click menu "Quản lý Bài học" trong Admin Dashboard hoặc truy cập "/admin/lessons".
* **Điều kiện tiên quyết (Pre-condition)**:
    * Admin phải đã đăng nhập với role = "admin".
    * Hệ thống phải có ít nhất một khóa học để chọn.
    * Thiết bị phải có kết nối Internet.
* **Quy tắc kinh doanh & Thông báo lỗi**:
    * Admin có quyền cao nhất, có thể thêm bài học vào bất kỳ khóa học nào.
    * Dropdown "Khóa học" hiển thị tất cả khóa học trong hệ thống.
    * Tên bài học và Khóa học là bắt buộc.
    * Video URL và Nội dung là optional.
    * Thứ tự phải là số nguyên dương >= 1.
    * Admin có thể sửa/xóa bất kỳ bài học nào.

## 5. Thiết kế giao diện (Screen Design & Description)
Giao diện quản lý bài học:
1. **Admin Layout**: Sidebar + Main content.
2. **Page Title**: "Quản lý Bài học".
3. **Action Bar**:
    * Nút "Thêm bài học mới" (primary button).
4. **Lessons Table**:
    * Columns: ID | Tên bài học | Khóa học | Thứ tự | Thao tác
    * Actions: Icon/button "Sửa" và "Xóa".
5. **Add/Edit Form (Modal hoặc trang riêng)**:
    * Tiêu đề: "Thêm bài học mới" hoặc "Sửa bài học".
    * Các trường:
        - Khóa học (dropdown select, hiển thị tên khóa học)
        - Tên bài học (text input)
        - Video URL (text input, placeholder: "https://youtube.com/...")
        - Nội dung (textarea, placeholder: "Nội dung bài học...")
        - Thứ tự (number input, default: 1)
    * Nút "Lưu" và "Hủy".
6. **Delete Confirmation Dialog**:
    * Text: "Bạn có chắc muốn xóa bài học '[Tên bài học]'?"
    * Nút "Xác nhận" và "Hủy".

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)

1. Trang phải hiển thị bảng với tất cả bài học, query: SELECT l.*, c.title as course_title FROM Lessons l JOIN Courses c ON l.course_id = c.id ORDER BY l.created_at DESC.

2. Bảng phải có các cột: ID, Tên bài học, Khóa học, Thứ tự (order), Thao tác.

3. Nút "Thêm bài học mới" phải mở form với các trường:
   - Khóa học (select dropdown, required) - Load từ: SELECT id, title FROM Courses ORDER BY title ASC
   - Tên bài học (text, required, max 255 chars)
   - Video URL (text, optional, URL format)
   - Nội dung (textarea, optional)
   - Thứ tự (number, required, min 1)

4. Validation: Tên bài học và Khóa học không được để trống, Thứ tự phải là số nguyên >= 1.

5. Khi thêm bài học: INSERT INTO Lessons (course_id, title, video_url, content, order, created_at) VALUES (:course_id, :title, :video_url, :content, :order, NOW()). API: POST /api/admin/lessons.

6. Nút "Sửa" phải load thông tin bài học: SELECT * FROM Lessons WHERE id = :id.

7. Khi sửa bài học: UPDATE Lessons SET course_id = :course_id, title = :title, video_url = :video_url, content = :content, order = :order, updated_at = NOW() WHERE id = :id. API: PUT /api/admin/lessons/:id.

8. Admin có thể thay đổi course_id (chuyển bài học sang khóa học khác).

9. Nút "Xóa" phải hiển thị confirm dialog: "Bạn có chắc muốn xóa bài học '[Tên bài học]'?"

10. Khi xóa: DELETE FROM Lessons WHERE id = :id. API: DELETE /api/admin/lessons/:id.

11. Dropdown "Khóa học" phải hiển thị tất cả khóa học trong hệ thống (không giới hạn theo instructor).

12. Tất cả API endpoints phải yêu cầu JWT token với role 'admin'.
