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
* **Hiển thị danh sách**: Truy cập "/instructor/courses" -> Hiển thị chỉ các khóa học có instructor_id = current user.
* **Tạo khóa học thành công**: Click "Tạo khóa học mới" -> Điền đầy đủ thông tin -> Click "Lưu" -> Tạo record với instructor_id = current user -> Hiển thị thông báo "Tạo khóa học thành công" -> Danh sách cập nhật.
* **Tạo khóa học thất bại**: Bỏ trống trường hoặc giá < 0 -> Hiển thị lỗi tương ứng.
* **Sửa khóa học thành công**: Click "Sửa" -> Form load thông tin -> Sửa -> Click "Lưu" -> Cập nhật database -> Thông báo thành công.
* **Xóa khóa học thành công**: Click "Xóa" -> Confirm -> Xóa khóa học và các bài học, enrollment liên quan -> Thông báo thành công.
* **Không có quyền**: User không có role instructor -> Truy cập URL này -> Chuyển hướng hoặc lỗi 403.
* **Không thấy khóa học của người khác**: Instructor A không thấy khóa học của Instructor B trong danh sách.
