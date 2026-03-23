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
* **Hiển thị danh sách**: Truy cập "/admin/categories" -> Hiển thị bảng với tất cả danh mục, đúng thông tin ID, Tên, Số khóa học.
* **Thêm danh mục thành công**: Click "Thêm danh mục mới" -> Nhập tên "Lập trình" -> Click "Lưu" -> Tạo record mới trong database -> Hiển thị thông báo "Thêm danh mục thành công" -> Danh sách cập nhật với danh mục mới.
* **Thêm danh mục thất bại**: Để trống tên danh mục -> Click "Lưu" -> Hiển thị lỗi "Tên danh mục không được bỏ trống".
* **Sửa danh mục thành công**: Click "Sửa" ở row danh mục "Lập trình" -> Form load với tên "Lập trình" -> Sửa thành "Lập trình Web" -> Click "Lưu" -> Cập nhật database -> Hiển thị thông báo "Cập nhật thành công" -> Bảng cập nhật tên mới.
* **Xóa danh mục thành công**: Click "Xóa" ở row danh mục "Test" -> Hiển thị confirm dialog -> Click "Xác nhận" -> Xóa khỏi database -> Hiển thị thông báo "Xóa thành công" -> Danh mục biến mất khỏi bảng.
* **Hủy xóa**: Click "Xóa" -> Hiển thị confirm dialog -> Click "Hủy" -> Không xóa, dialog đóng.
* **Không có quyền**: User với role = "student" truy cập URL này -> Chuyển hướng đến trang chủ hoặc hiển thị lỗi 403.
