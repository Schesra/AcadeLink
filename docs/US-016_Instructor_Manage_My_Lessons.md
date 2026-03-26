# USER STORY 16: QUẢN LÝ BÀI HỌC CỦA TÔI (INSTRUCTOR)

## 1. Thông tin chung (Card)
* **Đối tượng**: Là một giảng viên (Instructor).
* **Hành động**: Tôi muốn thêm, sửa, xóa bài học vào các khóa học của tôi.
* **Mục tiêu**: Để xây dựng nội dung chi tiết cho các khóa học mà tôi tạo ra.

## 2. Tóm tắt (Summary)
Cung cấp giao diện quản lý bài học cho Instructor với đầy đủ chức năng CRUD, chỉ áp dụng cho các bài học thuộc khóa học do chính Instructor đó tạo ra.

## 3. Phạm vi (Scope)
### Trong phạm vi (In-scope):
* Hiển thị trang danh sách bài học của các khóa học do Instructor tạo.
* Mỗi row hiển thị: ID, Tên bài học, Khóa học, Thứ tự, Actions (Sửa/Xóa).
* Nút "Thêm bài học mới" để mở form thêm bài học.
* Form thêm bài học với các trường: Khóa học (dropdown chỉ khóa học của mình), Tên, Video URL, Nội dung, Thứ tự.
* Form sửa bài học: Load thông tin -> Chỉnh sửa -> Submit -> Cập nhật.
* Chức năng xóa bài học: Click "Xóa" -> Confirm -> Xóa.
* Validate: Tên bài học và Khóa học bắt buộc, Thứ tự phải > 0.
* Hiển thị thông báo thành công/lỗi.
* Instructor chỉ thấy bài học của khóa học mình tạo.

### Ngoài phạm vi (Out of Scope):
* Upload file video (chỉ nhập URL).
* Rich text editor cho nội dung.
* Drag & drop sắp xếp thứ tự.
* Xem trước video/nội dung.
* Tìm kiếm, lọc, sắp xếp.
* Phân trang.

## 4. Điều kiện & Quy tắc (Rules)
* **Kích hoạt (Trigger)**: Instructor click "Quản lý bài học" từ trang chi tiết khóa học hoặc từ menu Instructor Dashboard.
* **Điều kiện tiên quyết (Pre-condition)**:
    * User phải có role "instructor".
    * Instructor phải có ít nhất một khóa học.
    * Thiết bị phải có kết nối Internet.
* **Quy tắc kinh doanh & Thông báo lỗi**:
    * Instructor chỉ có thể thêm bài học vào khóa học của mình (instructor_id = current user).
    * Dropdown "Khóa học" chỉ hiển thị các khóa học có instructor_id = current user.
    * Tên bài học và Khóa học là bắt buộc.
    * Video URL và Nội dung là optional.
    * Thứ tự phải là số nguyên dương >= 1.

## 5. Thiết kế giao diện (Screen Design & Description)
Giao diện quản lý bài học:
1. **Instructor Layout**: Sidebar + Main content.
2. **Page Title**: "Quản lý Bài học".
3. **Filter (Optional)**: Dropdown để lọc bài học theo khóa học.
4. **Action Bar**:
    * Nút "Thêm bài học mới" (primary button).
5. **Lessons Table**:
    * Columns: ID | Tên bài học | Khóa học | Thứ tự | Thao tác
    * Actions: "Sửa" và "Xóa".
6. **Add/Edit Form**:
    * Tiêu đề: "Thêm bài học mới" hoặc "Sửa bài học".
    * Các trường: Khóa học (dropdown), Tên, Video URL, Nội dung (textarea), Thứ tự.
    * Nút "Lưu" và "Hủy".
7. **Delete Confirmation Dialog**.

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)

1. Trang phải hiển thị bảng với các bài học thuộc khóa học do Instructor tạo, query: SELECT l.*, c.title as course_title FROM Lessons l JOIN Courses c ON l.course_id = c.id WHERE c.instructor_id = :user_id ORDER BY c.id, l.order ASC.

2. Bảng phải có các cột: ID, Tên bài học, Khóa học, Thứ tự, Thao tác.

3. Hiển thị tổng số bài học: "Bạn có X bài học".

4. Nút "Thêm bài học mới" phải mở form với các trường:
   - Khóa học (select dropdown, required) - Load từ: SELECT id, title FROM Courses WHERE instructor_id = :user_id ORDER BY title
   - Tên bài học (text, required, max 255 chars)
   - Video URL (text, optional, URL format)
   - Nội dung (textarea, optional)
   - Thứ tự (number, required, min 1)

5. Validation: Tên bài học và Khóa học bắt buộc không được để trống, Thứ tự phải >= 1, Video URL (nếu có) phải là URL hợp lệ.

6. Khi tạo bài học: INSERT INTO Lessons (course_id, title, video_url, content, order, created_at) VALUES (:course_id, :title, :video_url, :content, :order, NOW()). API: POST /api/instructor/lessons.

7. Phải validate course_id thuộc về Instructor: SELECT id FROM Courses WHERE id = :course_id AND instructor_id = :user_id. Nếu không tìm thấy -> Lỗi 403 "Bạn không có quyền thêm bài học vào khóa học này".

8. Nút "Sửa" chỉ hiển thị cho bài học thuộc khóa học của Instructor. Load thông tin: SELECT l.* FROM Lessons l JOIN Courses c ON l.course_id = c.id WHERE l.id = :id AND c.instructor_id = :user_id.

9. Khi sửa: UPDATE Lessons SET course_id = :course_id, title = :title, video_url = :video_url, content = :content, order = :order, updated_at = NOW() WHERE id = :id AND course_id IN (SELECT id FROM Courses WHERE instructor_id = :user_id). API: PUT /api/instructor/lessons/:id.

10. Nút "Xóa" phải hiển thị confirm dialog: "Bạn có chắc muốn xóa bài học '[Tên]'?"

11. Khi xóa: DELETE FROM Lessons WHERE id = :id AND course_id IN (SELECT id FROM Courses WHERE instructor_id = :user_id). API: DELETE /api/instructor/lessons/:id.

12. Instructor không được thấy hoặc sửa bài học của khóa học do Instructor khác tạo (WHERE c.instructor_id = :user_id trong mọi query).

13. API endpoints phải yêu cầu JWT token với role 'instructor'.

14. Dropdown "Khóa học" trong form chỉ hiển thị khóa học có instructor_id = user_id từ JWT token payload.

15. Nếu Instructor chưa có khóa học nào, hiển thị thông báo: "Bạn chưa có khóa học nào. Vui lòng tạo khóa học trước khi thêm bài học." và ẩn nút "Thêm bài học mới".
