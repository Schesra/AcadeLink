# USER STORY 10: QUẢN LÝ DANH MỤC (ADMIN)

## 1. Thông tin chung (Card)
* **Đối tượng**: Là một quản trị viên (Admin).
* **Hành động**: Tôi muốn thêm, sửa, xóa danh mục khóa học.
* **Mục tiêu**: Để tổ chức và phân loại các khóa học trong hệ thống.

## 2. Tóm tắt (Summary)
Cung cấp giao diện quản lý danh mục khóa học cho Admin trong hệ thống ACADELINK với đầy đủ chức năng CRUD (Create, Read, Update, Delete), giúp tổ chức và phân loại khóa học hiệu quả.

## 3. Phạm vi (Scope)
### Trong phạm vi (In-scope):
* Hiển thị trang danh sách tất cả danh mục dưới dạng bảng (table).
* Mỗi row hiển thị: ID, Tên danh mục, Số khóa học, Actions (Sửa/Xóa).
* Nút "Thêm danh mục mới" để mở form thêm danh mục.
* Form thêm danh mục: Nhập tên danh mục -> Submit -> Lưu vào database.
* Form sửa danh mục: Load thông tin danh mục hiện tại -> Cho phép chỉnh sửa -> Submit -> Cập nhật database.
* Chức năng xóa danh mục: Click "Xóa" -> Hiển thị confirm dialog -> Xác nhận -> Xóa khỏi database.
* Validate: Tên danh mục không được bỏ trống.
* Hiển thị thông báo thành công/lỗi sau mỗi thao tác.

### Ngoài phạm vi (Out of Scope):
* Tìm kiếm danh mục.
* Sắp xếp danh mục.
* Phân trang (pagination).
* Upload icon/hình ảnh cho danh mục.
* Danh mục con (nested categories).
* Kiểm tra danh mục có khóa học trước khi xóa (sẽ xử lý trong phase sau nếu cần).

## 4. Điều kiện & Quy tắc (Rules)
* **Kích hoạt (Trigger)**: Admin click menu "Quản lý Danh mục" trong Admin Dashboard hoặc truy cập "/admin/categories".
* **Điều kiện tiên quyết (Pre-condition)**:
    * Admin phải đã đăng nhập với role = "admin".
    * Thiết bị phải có kết nối Internet.
* **Quy tắc kinh doanh & Thông báo lỗi**:
    * Tên danh mục không được bỏ trống.
    * Tên danh mục không được trùng lặp (optional - có thể bỏ qua nếu không yêu cầu).
    * Khi xóa danh mục, nếu có khóa học thuộc danh mục đó -> Hiển thị cảnh báo "Danh mục này có X khóa học. Bạn có chắc muốn xóa?" (hoặc không cho xóa).
    * Số khóa học được tính bằng COUNT từ bảng Courses.

## 5. Thiết kế giao diện (Screen Design & Description)
Giao diện quản lý danh mục:
1. **Admin Layout**:
    * Sidebar bên trái: Menu điều hướng (Dashboard, Danh mục, Khóa học, Bài học, Ghi danh, Đăng xuất).
    * Main content bên phải: Nội dung trang quản lý.
2. **Page Title**: "Quản lý Danh mục".
3. **Action Bar**:
    * Nút "Thêm danh mục mới" (primary button).
4. **Categories Table**:
    * Columns: ID | Tên danh mục | Số khóa học | Thao tác
    * Actions: Icon/button "Sửa" và "Xóa" cho mỗi row.
5. **Add/Edit Modal hoặc Form**:
    * Tiêu đề: "Thêm danh mục mới" hoặc "Sửa danh mục".
    * Trường nhập: Tên danh mục (text input, required).
    * Nút "Lưu" và "Hủy".
6. **Delete Confirmation Dialog**:
    * Text: "Bạn có chắc muốn xóa danh mục '[Tên danh mục]'?"
    * Nút "Xác nhận" và "Hủy".

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)

1. Trang phải hiển thị bảng (table) với tất cả danh mục, query: SELECT id, category_name, (SELECT COUNT(*) FROM Courses WHERE category_id = Categories.id) as course_count FROM Categories ORDER BY id DESC.

2. Bảng phải có các cột: ID, Tên danh mục, Số khóa học, Thao tác (Actions).

3. Nút "Thêm danh mục mới" phải mở modal hoặc form với trường: Tên danh mục (text, required).

4. Validation: Tên danh mục không được để trống, tối thiểu 2 ký tự, tối đa 255 ký tự.

5. Khi thêm danh mục, thực hiện: INSERT INTO Categories (category_name, created_at) VALUES (:name, NOW()). API: POST /api/admin/categories với body { category_name }.

6. Nút "Sửa" phải load thông tin danh mục hiện tại vào form: SELECT * FROM Categories WHERE id = :id.

7. Khi sửa danh mục, thực hiện: UPDATE Categories SET category_name = :name, updated_at = NOW() WHERE id = :id. API: PUT /api/admin/categories/:id với body { category_name }.

8. Nút "Xóa" phải hiển thị confirm dialog với text: "Bạn có chắc muốn xóa danh mục '[Tên danh mục]'?"

9. Khi xóa, thực hiện: DELETE FROM Categories WHERE id = :id. API: DELETE /api/admin/categories/:id.

10. Nếu danh mục có khóa học (course_count > 0), có thể hiển thị cảnh báo trong confirm dialog: "Danh mục này có X khóa học. Bạn có chắc muốn xóa?"

11. Sau mỗi thao tác (thêm/sửa/xóa) thành công, hiển thị toast notification và refresh danh sách.

12. Tất cả API endpoints phải yêu cầu JWT token với role 'admin'.
