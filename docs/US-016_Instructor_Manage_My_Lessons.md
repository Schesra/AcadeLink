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
* **Hiển thị danh sách**: Truy cập trang -> Hiển thị chỉ bài học của các khóa học có instructor_id = current user.
* **Thêm bài học thành công**: Chọn khóa học của mình -> Điền thông tin -> Click "Lưu" -> Tạo record -> Thông báo thành công.
* **Thêm bài học thất bại**: Bỏ trống trường bắt buộc hoặc thứ tự <= 0 -> Hiển thị lỗi.
* **Sửa bài học thành công**: Click "Sửa" -> Form load -> Sửa -> Lưu -> Cập nhật -> Thông báo thành công.
* **Xóa bài học thành công**: Click "Xóa" -> Confirm -> Xóa -> Thông báo thành công.
* **Dropdown khóa học**: Chỉ hiển thị khóa học có instructor_id = current user.
* **Không có quyền**: User không có role instructor -> Chuyển hướng hoặc lỗi 403.
* **Không thấy bài học của người khác**: Instructor A không thấy bài học của khóa học do Instructor B tạo.
