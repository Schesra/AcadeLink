# USER STORY 11: QUẢN LÝ KHÓA HỌC (ADMIN)

## 1. Thông tin chung (Card)
* **Đối tượng**: Là một quản trị viên (Admin).
* **Hành động**: Tôi muốn thêm, sửa, xóa tất cả khóa học trong hệ thống.
* **Mục tiêu**: Để quản lý và kiểm soát toàn bộ nội dung khóa học trên nền tảng ACADELINK.

## 2. Tóm tắt (Summary)
Cung cấp giao diện quản lý toàn bộ khóa học cho Admin trong hệ thống ACADELINK với đầy đủ chức năng CRUD. Admin có quyền cao nhất, có thể tạo, xem, sửa, xóa bất kỳ khóa học nào trong hệ thống.

## 3. Phạm vi (Scope)
### Trong phạm vi (In-scope):
* Hiển thị trang danh sách tất cả khóa học trong hệ thống.
* Mỗi row hiển thị: ID, Thumbnail, Tên khóa học, Giá, Danh mục, Giảng viên, Số học viên, Actions (Sửa/Xóa).
* Nút "Thêm khóa học mới" để tạo khóa học (Admin có thể tạo khóa học và gán cho Instructor).
* Form thêm khóa học với các trường: Tên, Giá, Mô tả, Thumbnail URL, Danh mục, Giảng viên (dropdown chọn Instructor).
* Form sửa khóa học: Load thông tin hiện tại -> Cho phép chỉnh sửa tất cả thông tin (bao gồm cả thay đổi Instructor) -> Submit -> Cập nhật database.
* Chức năng xóa khóa học: Click "Xóa" -> Confirm dialog -> Xóa khỏi database.
* Validate: Tất cả trường bắt buộc không được bỏ trống, giá >= 0.
* Hiển thị thông báo thành công/lỗi sau mỗi thao tác.
* Tìm kiếm khóa học theo tên.
* Lọc khóa học theo Instructor.

### Ngoài phạm vi (Out of Scope):
* Upload file ảnh thumbnail (chỉ nhập URL).
* Sắp xếp khóa học.
* Phân trang (pagination).
* Quản lý bài học trực tiếp từ trang này (có User Story riêng).
* Thống kê chi tiết về khóa học.

## 4. Điều kiện & Quy tắc (Rules)
* **Kích hoạt (Trigger)**: Admin click menu "Quản lý Khóa học" trong Admin Dashboard hoặc truy cập "/admin/courses".
* **Điều kiện tiên quyết (Pre-condition)**:
    * Admin phải đã đăng nhập với role = "admin".
    * Hệ thống phải có ít nhất một danh mục để chọn.
    * Thiết bị phải có kết nối Internet.
* **Quy tắc kinh doanh & Thông báo lỗi**:
    * Admin có quyền cao nhất, có thể tạo, xem, sửa, xóa tất cả khóa học.
    * Admin có thể thay đổi instructor_id của khóa học (gán lại cho Instructor khác).
    * Khi tạo khóa học mới, Admin phải chọn Instructor từ dropdown (danh sách users có role instructor).
    * Tất cả các trường đều bắt buộc (required).
    * Giá phải là số và >= 0. Nếu giá < 0 -> Hiển thị lỗi "Giá không được âm."
    * Thumbnail URL phải là URL hợp lệ.
    * Danh mục phải được chọn từ dropdown.
    * Khi xóa khóa học, tất cả bài học và enrollment liên quan cũng bị xóa -> Hiển thị cảnh báo rõ ràng.

## 5. Thiết kế giao diện (Screen Design & Description)
Giao diện quản lý khóa học:
1. **Admin Layout**: Sidebar + Main content.
2. **Page Title**: "Quản lý Khóa học".
3. **Action Bar**:
    * Nút "Thêm khóa học mới" (primary button).
4. **Filter & Search Bar**:
    * Ô tìm kiếm theo tên khóa học.
    * Dropdown lọc theo Instructor.
5. **Courses Table**:
    * Columns: ID | Thumbnail | Tên khóa học | Giá | Danh mục | Giảng viên | Số học viên | Thao tác
    * Thumbnail hiển thị ảnh nhỏ (50x50px).
    * Giá hiển thị định dạng tiền tệ.
    * Giảng viên hiển thị tên Instructor.
    * Actions: Icon/button "Sửa" và "Xóa".
6. **Add/Edit Form (Modal hoặc trang riêng)**:
    * Tiêu đề: "Thêm khóa học mới" hoặc "Sửa khóa học".
    * Các trường:
        - Tên khóa học (text input, required)
        - Giá (number input, required)
        - Mô tả (textarea, required)
        - Thumbnail URL (text input, required)
        - Danh mục (dropdown select, required)
        - Giảng viên (dropdown select users có role instructor, required)
    * Nút "Lưu" và "Hủy".
7. **Delete Confirmation Dialog**:
    * Text: "Bạn có chắc muốn xóa khóa học '[Tên khóa học]'? Tất cả bài học và enrollment sẽ bị xóa."
    * Nút "Xác nhận" và "Hủy".

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)

1. Trang phải hiển thị bảng với tất cả khóa học, query: SELECT c.*, cat.category_name, u.name as instructor_name, (SELECT COUNT(*) FROM Enrollments WHERE course_id = c.id) as student_count FROM Courses c JOIN Categories cat ON c.category_id = cat.id JOIN Users u ON c.instructor_id = u.id ORDER BY c.created_at DESC.

2. Bảng phải có các cột: ID, Thumbnail (ảnh 50x50px), Tên khóa học, Giá, Danh mục, Giảng viên, Số học viên, Thao tác.

3. Phải có ô tìm kiếm (search input) để lọc khóa học theo tên: WHERE title LIKE '%:keyword%'.

4. Phải có dropdown lọc theo Instructor: WHERE instructor_id = :instructor_id.

5. Nút "Thêm khóa học mới" phải mở form với các trường:
   - Tên khóa học (text, required, max 255 chars)
   - Giá (number, required, min 0)
   - Mô tả (textarea, required)
   - Thumbnail URL (text, required, URL format)
   - Danh mục (select dropdown, required) - Load từ: SELECT id, category_name FROM Categories
   - Giảng viên (select dropdown, required) - Load từ: SELECT u.id, u.name FROM Users u JOIN UserRoles ur ON u.id = ur.user_id WHERE ur.role = 'instructor'

6. Validation: Tất cả trường bắt buộc không được để trống, giá >= 0, thumbnail_url phải là URL hợp lệ.

7. Khi thêm khóa học: INSERT INTO Courses (instructor_id, category_id, title, price, description, thumbnail_url, created_at) VALUES (:instructor_id, :category_id, :title, :price, :description, :thumbnail_url, NOW()). API: POST /api/admin/courses.

8. Nút "Sửa" phải load thông tin khóa học: SELECT * FROM Courses WHERE id = :id.

9. Khi sửa khóa học: UPDATE Courses SET instructor_id = :instructor_id, category_id = :category_id, title = :title, price = :price, description = :description, thumbnail_url = :thumbnail_url, updated_at = NOW() WHERE id = :id. API: PUT /api/admin/courses/:id.

10. Admin có thể thay đổi instructor_id (gán lại khóa học cho Instructor khác).

11. Nút "Xóa" phải hiển thị confirm dialog: "Bạn có chắc muốn xóa khóa học '[Tên]'? Tất cả bài học và enrollment sẽ bị xóa."

12. Khi xóa: DELETE FROM Courses WHERE id = :id (CASCADE sẽ tự động xóa Lessons và Enrollments). API: DELETE /api/admin/courses/:id.

13. Tất cả API endpoints phải yêu cầu JWT token với role 'admin'.
