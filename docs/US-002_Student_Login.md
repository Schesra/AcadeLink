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

* **Luồng hoạt động JWT Token**:
    1. **Đăng nhập**:
       - Client gửi POST /auth/login với { email, password }
       - Server tìm user trong database theo email
       - Server so sánh password bằng bcrypt.compare(password, hashedPassword)
       - Nếu đúng -> Server query bảng UserRoles để lấy danh sách roles của user
       - Server tạo JWT token với payload: { user_id, email, roles: ["student", "instructor"], exp: Date.now() + 7days }
       - Server ký token bằng SECRET_KEY (lưu trong .env)
       - Server trả về: { token: "eyJhbGc...", user: { id, name, email, roles } }
       - Client lưu token vào localStorage.setItem("token", token)
    
    2. **Gọi API bảo mật**:
       - Client gửi request với header: Authorization: Bearer <token>
       - Server middleware verify token:
         + Lấy token từ header
         + jwt.verify(token, SECRET_KEY) -> Nếu sai signature hoặc hết hạn -> Trả về 401 Unauthorized
         + Extract payload: { user_id, email, roles, exp }
         + Gắn user info vào request: req.user = { user_id, email, roles }
       - Controller xử lý request với req.user
    
    3. **Phân quyền**:
       - Middleware kiểm tra roles: if (!req.user.roles.includes('instructor')) -> 403 Forbidden
       - Instructor chỉ truy cập dữ liệu có instructor_id = req.user.user_id
       - Admin có thể truy cập tất cả dữ liệu
    
    4. **Token hết hạn**:
       - Client gọi API -> Server trả về 401 Unauthorized
       - Client xóa token khỏi localStorage
       - Client chuyển hướng đến trang đăng nhập
       - Hiển thị thông báo: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."

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

1. Form đăng nhập phải bao gồm các trường: Email và Mật khẩu.

2. Phải có nút "Tiếp tục với tư cách khách" để người dùng có thể duyệt web mà không cần đăng nhập.

3. Tất cả các trường đều bắt buộc phải nhập (required).

4. Email phải đúng định dạng (có @ và domain hợp lệ).

5. **Hệ thống phải xác thực mật khẩu bằng cách so sánh password đã hash trong database với password user nhập vào** (sử dụng bcrypt.compare()).

6. **Khi đăng nhập thành công, hệ thống tạo JWT token** với cấu trúc:
   - Header: { alg: "HS256", typ: "JWT" }
   - Payload: { user_id, email, roles: ["student", "instructor"], exp }
   - Signature: HMACSHA256(header + payload, SECRET_KEY)

7. **JWT token phải có thời gian hết hạn (exp)** được set trong payload, ví dụ: 7 ngày (604800 giây).

8. JWT token phải được lưu vào localStorage của client với key "token" hoặc httpOnly cookie.

9. Sau khi đăng nhập thành công, chuyển hướng đến trang chủ "/" và header hiển thị tên user.

10. **Mỗi request đến API bảo mật phải gửi JWT token trong header**: Authorization: Bearer <token>

11. **Server phải verify JWT token** trước khi xử lý request: kiểm tra signature, kiểm tra exp (chưa hết hạn), extract user_id và roles từ payload.

12. Khi click "Tiếp tục với tư cách khách", chuyển đến trang chủ mà không cần đăng nhập (không có token).
