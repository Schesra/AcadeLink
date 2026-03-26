# USER STORY 15: QUẢN LÝ KHÓA HỌC CỦA TÔI (INSTRUCTOR)

## 1. Thông tin chung (Card)
* **Đối tượng**: Là một giảng viên (Instructor).
* **Hành động**: Tôi muốn thêm, sửa, xóa các khóa học do tôi tạo ra.
* **Mục tiêu**: Để quản lý nội dung khóa học và bán khóa học trên nền tảng ACADELINK.

## 2. Tóm tắt (Summary)
Cung cấp giao diện quản lý khóa học cho Instructor với đầy đủ chức năng CRUD, chỉ áp dụng cho các khóa học do chính Instructor đó tạo ra (instructor_id = current user).

## 3. Phạm vi (Scope)
### Trong phạm vi (In-scope):
* Hiển thị trang danh sách các khóa học do Instructor tạo (instructor_id = current user).
* Mỗi row hiển thị: ID, Thumbnail, Tên khóa học, Giá, Danh mục, Số học viên, Actions (Sửa/Xóa).
* Nút "Tạo khóa học mới" để mở form thêm khóa học.
* Form thêm khóa học với các trường: Tên, Giá, Mô tả, Thumbnail URL, Danh mục.
* Form sửa khóa học: Load thông tin hiện tại -> Cho phép chỉnh sửa -> Submit -> Cập nhật database.
* Chức năng xóa khóa học: Click "Xóa" -> Confirm dialog -> Xóa khỏi database.
* Validate: Tất cả trường bắt buộc, giá >= 0.
* Hiển thị thông báo thành công/lỗi sau mỗi thao tác.
* Instructor chỉ thấy và quản lý khóa học của mình.

### Ngoài phạm vi (Out of Scope):
* Upload file ảnh thumbnail (chỉ nhập URL).
* Xem khóa học của Instructor khác.
* Sao chép (duplicate) khóa học.
* Tìm kiếm, lọc, sắp xếp khóa học.
* Phân trang.
* Thống kê doanh thu chi tiết.

## 4. Điều kiện & Quy tắc (Rules)
* **Kích hoạt (Trigger)**: Instructor click menu "Khóa học của tôi" trong Instructor Dashboard hoặc truy cập "/instructor/courses".
* **Điều kiện tiên quyết (Pre-condition)**:
    * User phải đã đăng nhập và có role "instructor".
    * Hệ thống phải có ít nhất một danh mục.
    * Thiết bị phải có kết nối Internet.
* **Quy tắc kinh doanh & Thông báo lỗi**:
    * Instructor chỉ có thể xem và quản lý khóa học có instructor_id = current user_id.
    * Khi tạo khóa học mới, tự động set instructor_id = current user_id.
    * Tất cả các trường đều bắt buộc.
    * Giá phải >= 0.
    * Thumbnail URL phải là URL hợp lệ.
    * Số học viên = COUNT enrollments với course_id tương ứng.

## 5. Thiết kế giao diện (Screen Design & Description)
Giao diện quản lý khóa học của Instructor:
1. **Instructor Layout**: Sidebar với menu (Dashboard, Khóa học của tôi, Ghi danh, Đăng xuất).
2. **Page Title**: "Khóa học của tôi".
3. **Action Bar**:
    * Nút "Tạo khóa học mới" (primary button).
    * Hiển thị tổng số khóa học: "Bạn có X khóa học".
4. **Courses Table**:
    * Columns: ID | Thumbnail | Tên khóa học | Giá | Danh mục | Số học viên | Thao tác
    * Actions: Icon/button "Sửa" và "Xóa".
5. **Add/Edit Form (Modal hoặc trang riêng)**:
    * Tiêu đề: "Tạo khóa học mới" hoặc "Sửa khóa học".
    * Các trường: Tên, Giá, Mô tả, Thumbnail URL, Danh mục (dropdown).
    * Nút "Lưu" và "Hủy".
6. **Delete Confirmation Dialog**:
    * Text: "Bạn có chắc muốn xóa khóa học '[Tên]'? Tất cả bài học và enrollment sẽ bị xóa."
    * Nút "Xác nhận" và "Hủy".

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)

1. Trang phải hiển thị bảng với các khóa học do Instructor tạo, query: SELECT c.*, cat.category_name, (SELECT COUNT(*) FROM Enrollments WHERE course_id = c.id) as student_count FROM Courses c JOIN Categories cat ON c.category_id = cat.id WHERE c.instructor_id = :user_id ORDER BY c.created_at DESC.

2. Bảng phải có các cột: ID, Thumbnail, Tên khóa học, Giá, Danh mục, Số học viên, Thao tác.

3. Hiển thị tổng số khóa học: "Bạn có X khóa học".

4. Nút "Tạo khóa học mới" phải mở form với các trường:
   - Tên khóa học (text, required, max 255 chars)
   - Giá (number, required, min 0)
   - Mô tả (textarea, required)
   - Thumbnail URL (text, required, URL format)
   - Danh mục (select dropdown, required) - Load từ: SELECT id, category_name FROM Categories

5. Validation: Tất cả trường bắt buộc không được để trống, giá >= 0, thumbnail_url phải là URL hợp lệ.

6. Khi tạo khóa học: INSERT INTO Courses (instructor_id, category_id, title, price, description, thumbnail_url, created_at) VALUES (:user_id, :category_id, :title, :price, :description, :thumbnail_url, NOW()). API: POST /api/instructor/courses.

7. instructor_id phải tự động được set = user_id từ JWT token payload.

8. Nút "Sửa" chỉ hiển thị cho khóa học có instructor_id = user_id. Load thông tin: SELECT * FROM Courses WHERE id = :id AND instructor_id = :user_id.

9. Khi sửa: UPDATE Courses SET category_id = :category_id, title = :title, price = :price, description = :description, thumbnail_url = :thumbnail_url, updated_at = NOW() WHERE id = :id AND instructor_id = :user_id. API: PUT /api/instructor/courses/:id.

10. Nút "Xóa" phải hiển thị confirm dialog: "Bạn có chắc muốn xóa khóa học '[Tên]'? Tất cả bài học và enrollment sẽ bị xóa."

11. Khi xóa: DELETE FROM Courses WHERE id = :id AND instructor_id = :user_id. API: DELETE /api/instructor/courses/:id.

12. Instructor không được thấy hoặc sửa khóa học của Instructor khác (WHERE instructor_id = :user_id trong mọi query).

13. API endpoints phải yêu cầu JWT token với role 'instructor'.
