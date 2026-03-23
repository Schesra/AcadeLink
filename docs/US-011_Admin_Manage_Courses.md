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
* **Hiển thị danh sách**: Truy cập "/admin/courses" -> Hiển thị bảng với tất cả khóa học trong hệ thống.
* **Tìm kiếm**: Nhập tên khóa học vào ô tìm kiếm -> Danh sách lọc theo tên.
* **Lọc theo Instructor**: Chọn Instructor từ dropdown -> Chỉ hiển thị khóa học của Instructor đó.
* **Thêm khóa học thành công**: Click "Thêm khóa học mới" -> Điền đầy đủ thông tin và chọn Instructor -> Click "Lưu" -> Tạo record với instructor_id = Instructor đã chọn -> Hiển thị thông báo "Thêm khóa học thành công" -> Danh sách cập nhật.
* **Thêm khóa học thất bại**: Bỏ trống trường hoặc giá < 0 -> Hiển thị lỗi tương ứng.
* **Sửa khóa học thành công**: Click "Sửa" -> Form load với thông tin hiện tại -> Có thể sửa tất cả thông tin (bao gồm cả thay đổi Instructor) -> Click "Lưu" -> Cập nhật database -> Hiển thị thông báo "Cập nhật thành công" -> Bảng cập nhật.
* **Xóa khóa học thành công**: Click "Xóa" -> Confirm dialog với cảnh báo -> Click "Xác nhận" -> Xóa khóa học và dữ liệu liên quan -> Hiển thị thông báo "Xóa thành công" -> Khóa học biến mất.
* **Hủy xóa**: Click "Xóa" -> Confirm dialog -> Click "Hủy" -> Không xóa.
* **Dropdown Instructor**: Form thêm/sửa -> Dropdown Giảng viên hiển thị tất cả users có role instructor.
* **Không có quyền**: User không có role admin -> Truy cập URL này -> Chuyển hướng hoặc hiển thị lỗi 403.
