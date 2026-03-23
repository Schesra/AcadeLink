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
* **Hiển thị danh sách**: Truy cập "/admin/lessons" -> Hiển thị bảng với tất cả bài học trong hệ thống.
* **Thêm bài học thành công**: Click "Thêm bài học mới" -> Chọn bất kỳ khóa học nào, nhập tên "Bài 1: Giới thiệu", video URL, thứ tự 1 -> Click "Lưu" -> Tạo record mới -> Hiển thị thông báo "Thêm bài học thành công" -> Danh sách cập nhật.
* **Thêm bài học thất bại - Bỏ trống**: Để trống Tên bài học hoặc không chọn Khóa học -> Click "Lưu" -> Hiển thị lỗi "Vui lòng điền đầy đủ thông tin bắt buộc."
* **Thêm bài học thất bại - Thứ tự không hợp lệ**: Nhập thứ tự = 0 hoặc âm -> Click "Lưu" -> Hiển thị lỗi "Thứ tự phải là số dương."
* **Sửa bài học thành công**: Click "Sửa" ở row bài học -> Form load với thông tin hiện tại -> Sửa tên và video URL -> Click "Lưu" -> Cập nhật database -> Hiển thị thông báo "Cập nhật thành công" -> Bảng cập nhật thông tin mới.
* **Xóa bài học thành công**: Click "Xóa" -> Confirm dialog -> Click "Xác nhận" -> Xóa khỏi database -> Hiển thị thông báo "Xóa thành công" -> Bài học biến mất khỏi bảng.
* **Hủy xóa**: Click "Xóa" -> Confirm dialog -> Click "Hủy" -> Không xóa.
* **Dropdown khóa học**: Form thêm/sửa -> Dropdown khóa học hiển thị tất cả khóa học trong hệ thống.
* **Không có quyền**: User không có role admin -> Truy cập URL này -> Chuyển hướng hoặc hiển thị lỗi 403.
