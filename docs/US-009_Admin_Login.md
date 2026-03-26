# USER STORY 9: ĐĂNG NHẬP ADMIN

## 1. Thông tin chung (Card)
* **Đối tượng**: Là một quản trị viên (Admin).
* **Hành động**: Tôi muốn đăng nhập vào hệ thống quản trị.
* **Mục tiêu**: Để truy cập Admin Dashboard và quản lý toàn bộ hệ thống ACADELINK (users, danh mục, tất cả khóa học, enrollment).

## 2. Tóm tắt (Summary)
Cho phép Admin đăng nhập an toàn vào hệ thống ACADELINK bằng email và mật khẩu, xác thực qua JWT với role = "admin", và chuyển hướng đến trang Admin Dashboard.

## 3. Phạm vi (Scope)
### Trong phạm vi (In-scope):
* Hiển thị trang đăng nhập Admin riêng biệt (URL: /admin/login).
* Form đăng nhập với Email và Mật khẩu.
* Xác thực thông tin đăng nhập với database.
* Kiểm tra role của user phải là "admin".
* Tạo JWT token với payload chứa user_id và role.
* Lưu JWT token vào localStorage/cookie.
* Chuyển hướng đến Admin Dashboard (/admin/dashboard) sau khi đăng nhập thành công.
* Hiển thị thông báo lỗi nếu thông tin sai hoặc không có quyền admin.
* Hiển thị trạng thái loading khi xử lý.

### Ngoài phạm vi (Out of Scope):
* Chức năng "Quên mật khẩu" cho Admin.
* Đăng ký tài khoản Admin (Admin được tạo trực tiếp trong database).
* Xác thực đa yếu tố (MFA).
* Đăng nhập qua mạng xã hội.

## 4. Điều kiện & Quy tắc (Rules)
* **Kích hoạt (Trigger)**: Admin truy cập vào URL "/admin/login" hoặc click link "Admin" từ footer.
* **Điều kiện tiên quyết (Pre-condition)**:
    * Admin phải có tài khoản với role = "admin" trong database.
    * Thiết bị phải có kết nối Internet.
    * Hệ thống đang hoạt động.
* **Quy tắc kinh doanh & Thông báo lỗi**:
    * Email và mật khẩu phải khớp với bản ghi trong database.
    * User phải có role = "admin", nếu role = "student" -> Hiển thị lỗi "Bạn không có quyền truy cập trang quản trị."
    * Nếu sai email hoặc mật khẩu -> Hiển thị: "Email hoặc mật khẩu không chính xác."
    * JWT token có thời gian hết hạn (ví dụ: 7 ngày).
    * Sau khi đăng nhập, tất cả các trang admin phải kiểm tra JWT token và role.

## 5. Thiết kế giao diện (Screen Design & Description)
Giao diện đăng nhập Admin:
1. **Layout đơn giản**:
    * Không có header/footer phức tạp.
    * Form đăng nhập ở giữa màn hình.
2. **Form đăng nhập**:
    * Logo hoặc text "Admin Login".
    * Tiêu đề: "Đăng nhập quản trị".
    * Các trường nhập liệu:
        - Email (email input, required)
        - Mật khẩu (password input, required)
    * Nút "Đăng nhập" (hiển thị "Đang đăng nhập..." khi xử lý).
3. **Styling**: Có thể khác biệt với trang đăng nhập Student để phân biệt rõ ràng.

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)

1. Form đăng nhập Admin phải bao gồm các trường: Email (email, required) và Mật khẩu (password, required).

2. Validation: Email phải đúng định dạng, không được để trống các trường bắt buộc.

3. Xác thực đăng nhập: Query database SELECT id, email, password_hash, full_name FROM Users WHERE email = :email.

4. **Password verification phải sử dụng bcrypt.compare()**:
   - Lấy password_hash từ database (đã được hash bằng bcrypt với salt rounds = 10)
   - So sánh: bcrypt.compare(inputPassword, storedPasswordHash)
   - Nếu true → Tiếp tục kiểm tra role
   - Nếu false → Trả về lỗi 401 "Email hoặc mật khẩu không chính xác"

5. KHÔNG BAO GIỜ so sánh plain text password trực tiếp (inputPassword === storedPassword là SAI).

6. Sau khi xác thực password thành công, query bảng UserRoles: SELECT role FROM UserRoles WHERE user_id = :user_id.

7. Kiểm tra roles array phải chứa 'admin'. Nếu không có role 'admin', trả về lỗi 403 với message "Bạn không có quyền truy cập trang quản trị."

8. Nếu có role 'admin', tạo JWT token với payload: { user_id, email, roles: [...], exp: Date.now() + 7days }.

9. Server trả về response: { token: "eyJhbGc...", user: { id, name, email, roles } }.

10. Client lưu token vào localStorage.setItem("admin_token", token).

11. Sau khi đăng nhập thành công, chuyển hướng đến "/admin/dashboard".

12. API endpoint: POST /api/admin/login với body { email, password }.

13. Tất cả các route /admin/* phải có middleware kiểm tra: JWT token hợp lệ và roles.includes('admin'). Nếu không -> 401 hoặc 403.

14. Nếu Admin đã đăng nhập (có token hợp lệ), truy cập "/admin/login" phải tự động chuyển đến "/admin/dashboard".

15. Nếu email không tồn tại trong database → Trả về lỗi 401 "Email hoặc mật khẩu không chính xác" (không tiết lộ email có tồn tại hay không để bảo mật).
