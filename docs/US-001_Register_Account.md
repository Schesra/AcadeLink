# USER STORY 1: ĐĂNG KÝ TÀI KHOẢN

## 1. Thông tin chung (Card)
* **Đối tượng**: Là một người dùng muốn trở thành học viên.
* **Hành động**: Tôi muốn đăng ký tài khoản mới trong hệ thống.
* **Mục tiêu**: Để có thể đăng nhập và đăng ký các khóa học trực tuyến.

## 2. Tóm tắt (Summary)
Cho phép người dùng tạo tài khoản mới trong hệ thống ACADELINK bằng cách cung cấp thông tin cá nhân (tên, email, mật khẩu) để trở thành học viên (Student) và có thể đăng ký các khóa học.

## 3. Phạm vi (Scope)
### Trong phạm vi (In-scope):
* Hiển thị trang đăng ký với các trường: Họ tên, Email, Mật khẩu, Xác nhận mật khẩu.
* Validate dữ liệu đầu vào (email hợp lệ, mật khẩu đủ mạnh, không bỏ trống).
* Kiểm tra email đã tồn tại trong hệ thống.
* Mã hóa mật khẩu trước khi lưu vào database.
* Tạo tài khoản với role mặc định là "student".
* Hiển thị thông báo thành công và chuyển hướng đến trang đăng nhập.
* Hiển thị thông báo lỗi nếu đăng ký thất bại.

### Ngoài phạm vi (Out of Scope):
* Xác thực email qua link kích hoạt.
* Đăng ký qua mạng xã hội (Google, Facebook).
* Đăng ký tài khoản Admin (Admin được tạo trực tiếp trong database).
* Upload ảnh đại diện khi đăng ký.

## 4. Điều kiện & Quy tắc (Rules)
* **Kích hoạt (Trigger)**: Người dùng truy cập vào trang đăng ký hoặc click "Đăng ký" từ trang đăng nhập hoặc từ header khi chưa đăng nhập.
* **Điều kiện tiên quyết (Pre-condition)**:
    * Thiết bị phải có kết nối Internet.
    * Hệ thống đang hoạt động và có thể truy cập.
    * Người dùng chưa có tài khoản trong hệ thống.
* **Quy tắc kinh doanh & Thông báo lỗi**:
    * Email phải đúng định dạng (có @ và domain hợp lệ).
    * Mật khẩu tối thiểu 6 ký tự.
    * Mật khẩu và Xác nhận mật khẩu phải khớp nhau.
    * Email không được trùng với tài khoản đã tồn tại.
    * Nếu email đã tồn tại, hiển thị: "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập."
    * Nếu validation thất bại, hiển thị lỗi cụ thể cho từng trường.

## 5. Thiết kế giao diện (Screen Design & Description)
Giao diện đăng ký bao gồm:
1. **Form đăng ký**:
    * Tiêu đề: "Đăng Ký Tài Khoản".
    * Các trường nhập liệu:
        - Họ và tên (text input, required)
        - Email (email input, required)
        - Mật khẩu (password input, required)
        - Xác nhận mật khẩu (password input, required)
    * Nút "Đăng Ký" (hiển thị "Đang xử lý..." khi submit).
    * Liên kết "Đã có tài khoản? Đăng nhập ngay" ở phía dưới.
2. **Responsive**: Form hiển thị tốt trên cả PC và Mobile.

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)

1. Form đăng ký phải bao gồm các trường: Họ và tên, Email, Mật khẩu, Xác nhận mật khẩu.

2. Tất cả các trường đều bắt buộc phải nhập (required), không được để trống.

3. Email phải đúng định dạng (có @ và domain hợp lệ).

4. Mật khẩu phải có tối thiểu 6 ký tự.

5. Trường "Xác nhận mật khẩu" phải khớp với trường "Mật khẩu".

6. Hệ thống phải kiểm tra email đã tồn tại trong database trước khi tạo tài khoản.

7. **Mật khẩu phải được hash bằng thuật toán bcrypt** với salt rounds = 10 trước khi lưu vào database. Không được lưu mật khẩu dạng plain text.

8. Khi tạo tài khoản thành công, hệ thống tự động tạo record trong bảng UserRoles với role = "student".

9. Sau khi đăng ký thành công, hiển thị thông báo "Đăng ký thành công!" và chuyển hướng đến trang đăng nhập.

10. Các trường bắt buộc không được để trống (Data Validation).
