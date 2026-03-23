# USER STORY 2: ĐĂNG NHẬP STUDENT

## 1. Thông tin chung (Card)
* **Đối tượng**: Là một học viên đã có tài khoản.
* **Hành động**: Tôi muốn đăng nhập vào hệ thống bằng email và mật khẩu.
* **Mục tiêu**: Để có thể đăng ký mua khóa học, xem các khóa học đã đăng ký và học tập.

## 2. Tóm tắt (Summary)
Cho phép học viên đã có tài khoản đăng nhập an toàn vào hệ thống ACADELINK bằng email và mật khẩu để truy cập đầy đủ các chức năng: đăng ký mua khóa học, xem khóa học đã đăng ký, và học tập.

## 3. Phạm vi (Scope)
### Trong phạm vi (In-scope):
* Hiển thị trang đăng nhập với các trường Email và Mật khẩu.
* Nút "Tiếp tục với tư cách khách" để người dùng có thể duyệt web mà không cần đăng nhập.
* Xác thực thông tin đăng nhập với database.
* Tạo JWT token khi đăng nhập thành công.
* Lưu JWT token vào localStorage/cookie.
* Chuyển hướng đến trang chủ sau khi đăng nhập thành công.
* Hiển thị thông báo lỗi nếu thông tin đăng nhập không chính xác.
* Hiển thị trạng thái loading trong khi xử lý.
* Cung cấp liên kết đến trang đăng ký.

### Ngoài phạm vi (Out of Scope):
* Chức năng "Quên mật khẩu".
* Hộp kiểm "Ghi nhớ đăng nhập".
* Đăng nhập qua mạng xã hội.
* Xác thực đa yếu tố (MFA).
* Đăng nhập của Admin (được xử lý trong User Story riêng).

## 4. Điều kiện & Quy tắc (Rules)
* **Kích hoạt (Trigger)**: Người dùng truy cập vào trang đăng nhập hoặc click "Đăng nhập" từ header, hoặc khi cố gắng truy cập chức năng yêu cầu đăng nhập (như đăng ký mua khóa học).
* **Điều kiện tiên quyết (Pre-condition)**:
    * Học viên phải có tài khoản đã đăng ký.
    * Thiết bị phải có kết nối Internet.
    * Hệ thống đang hoạt động và có thể truy cập.
* **Quy tắc kinh doanh & Thông báo lỗi**:
    * Email và mật khẩu phải khớp với bản ghi trong database.
    * Nếu sai thông tin, hiển thị: "Email hoặc mật khẩu không chính xác. Vui lòng thử lại."
    * JWT token có thời gian hết hạn (ví dụ: 7 ngày).
    * Hệ thống phải phân biệt role "student" và "admin" để chuyển hướng đúng trang.

## 5. Thiết kế giao diện (Screen Design & Description)
Giao diện đăng nhập bao gồm:
1. **Form đăng nhập**:
    * Tiêu đề: "Đăng Nhập".
    * Các trường nhập liệu:
        - Email (email input, required)
        - Mật khẩu (password input, required)
    * Nút "Đăng Nhập" (hiển thị "Đang đăng nhập..." khi xử lý).
    * Nút "Tiếp tục với tư cách khách" (secondary button) - Click -> Chuyển đến trang chủ mà không cần đăng nhập.
    * Liên kết "Chưa có tài khoản? Đăng ký ngay" ở phía dưới.
2. **Responsive**: Form hiển thị tốt trên cả PC và Mobile.

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)
* **Thành công**: Nhập đúng email và mật khẩu -> Tạo JWT token -> Lưu token -> Chuyển hướng đến trang chủ "/" -> Header hiển thị tên user và nút "Đăng xuất".
* **Thất bại**: Nhập sai email hoặc mật khẩu -> Hiển thị thông báo lỗi màu đỏ "Email hoặc mật khẩu không chính xác".
* **Bỏ trống**: Để trống email hoặc mật khẩu -> Hiển thị lỗi "Vui lòng điền đầy đủ thông tin".
* **Email không hợp lệ**: Nhập email sai định dạng -> Hiển thị lỗi "Email không hợp lệ".
* **Đăng ký**: Click "Đăng ký ngay" -> Chuyển hướng đến trang đăng ký "/register".
* **Tiếp tục với tư cách khách**: Click "Tiếp tục với tư cách khách" -> Chuyển đến trang chủ "/" -> Header hiển thị "Đăng nhập/Đăng ký" (không có thông tin user).
* **Token hết hạn**: Khi token hết hạn -> Tự động đăng xuất và chuyển về trang đăng nhập.
