# USER STORY 14: ĐĂNG KÝ TRỞ THÀNH GIẢNG VIÊN (STUDENT)

## 1. Thông tin chung (Card)
* **Đối tượng**: Là một học viên đã đăng nhập.
* **Hành động**: Tôi muốn đăng ký thêm vai trò giảng viên (Instructor).
* **Mục tiêu**: Để có thể tạo và bán khóa học trên nền tảng ACADELINK.

## 2. Tóm tắt (Summary)
Cho phép học viên đăng ký thêm role "instructor" vào tài khoản của mình, từ đó có thể truy cập Instructor Dashboard để tạo và quản lý khóa học.

## 3. Phạm vi (Scope)
### Trong phạm vi (In-scope):
* Hiển thị trang/form đăng ký trở thành giảng viên.
* Form nhập thông tin: Lý do muốn trở thành giảng viên, Kinh nghiệm (optional).
* Nút "Đăng ký" để submit yêu cầu.
* Tự động thêm role "instructor" vào bảng UserRoles cho user hiện tại.
* Hiển thị thông báo thành công.
* Sau khi đăng ký thành công, header hiển thị thêm link "Instructor Dashboard".
* User có thể switch giữa Student mode và Instructor mode.

### Ngoài phạm vi (Out of Scope):
* Xét duyệt yêu cầu trở thành Instructor (tự động approve).
* Upload chứng chỉ/bằng cấp.
* Ký hợp đồng điện tử.
* Phí đăng ký trở thành Instructor.
* Xác minh danh tính.

## 4. Điều kiện & Quy tắc (Rules)
* **Kích hoạt (Trigger)**: Student click "Trở thành giảng viên" từ menu hoặc footer.
* **Điều kiện tiên quyết (Pre-condition)**:
    * User phải đã đăng nhập với role "student".
    * User chưa có role "instructor".
    * Thiết bị phải có kết nối Internet.
* **Quy tắc kinh doanh & Thông báo lỗi**:
    * Một user chỉ có thể đăng ký role "instructor" một lần.
    * Nếu user đã có role "instructor" -> Hiển thị thông báo "Bạn đã là giảng viên rồi" và chuyển đến Instructor Dashboard.
    * Sau khi thêm role, user vẫn giữ role "student" (multi-role).
    * Không cần Admin duyệt, tự động approve.

## 5. Thiết kế giao diện (Screen Design & Description)
Giao diện đăng ký trở thành giảng viên:
1. **Header**: Giống các trang khác.
2. **Page Title**: "Trở thành Giảng viên".
3. **Introduction Section**:
    * Mô tả lợi ích khi trở thành giảng viên.
    * Các bước để tạo khóa học.
4. **Registration Form**:
    * Trường nhập liệu:
        - Lý do muốn trở thành giảng viên (textarea, optional)
        - Kinh nghiệm giảng dạy (textarea, optional)
    * Nút "Đăng ký ngay" (primary button).
5. **Footer**: Giống các trang khác.

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)
* **Thành công**: Student chưa có role instructor -> Điền form (hoặc bỏ qua) -> Click "Đăng ký ngay" -> Thêm record vào bảng UserRoles (user_id, role="instructor") -> Hiển thị thông báo "Chúc mừng! Bạn đã trở thành giảng viên" -> Header hiển thị thêm link "Instructor Dashboard".
* **Đã là Instructor**: Student đã có role instructor -> Truy cập trang này -> Hiển thị thông báo "Bạn đã là giảng viên" -> Chuyển đến "/instructor/dashboard".
* **Chưa đăng nhập**: Truy cập trang này khi chưa đăng nhập -> Chuyển hướng đến "/login".
* **Switch mode**: Sau khi có role instructor -> Header có dropdown để switch giữa "Student" và "Instructor" mode.
* **Instructor Dashboard**: Click "Instructor Dashboard" -> Chuyển đến "/instructor/dashboard" với menu quản lý khóa học, bài học, enrollment.
