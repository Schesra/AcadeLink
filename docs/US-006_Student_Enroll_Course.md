# USER STORY 6: ĐĂNG KÝ MUA KHÓA HỌC (STUDENT)

## 1. Thông tin chung (Card)
* **Đối tượng**: Là một học viên đã đăng nhập.
* **Hành động**: Tôi muốn đăng ký mua một khóa học.
* **Mục tiêu**: Để có thể truy cập và học nội dung của khóa học sau khi được duyệt.

## 2. Tóm tắt (Summary)
Cho phép học viên điền form thông tin đăng ký khóa học (mô phỏng thanh toán) và gửi yêu cầu ghi danh vào hệ thống ACADELINK. Yêu cầu sẽ được lưu vào database với trạng thái "pending" và chờ Admin duyệt.

## 3. Phạm vi (Scope)
### Trong phạm vi (In-scope):
* Hiển thị trang form đăng ký với thông tin khóa học (Tên, Giá).
* Form nhập thông tin: Họ tên, Email, Số điện thoại, Ghi chú (optional).
* Tự động điền sẵn Họ tên và Email từ thông tin user đã đăng nhập.
* Validate dữ liệu đầu vào (không bỏ trống các trường bắt buộc, số điện thoại hợp lệ).
* Nút "Xác nhận đăng ký" để submit form.
* Lưu thông tin vào bảng Enrollments với status = "pending".
* Hiển thị thông báo thành công và chuyển hướng đến trang "Khóa học của tôi".
* Hiển thị thông báo lỗi nếu đăng ký thất bại.

### Ngoài phạm vi (Out of Scope):
* Tích hợp cổng thanh toán thực (VNPay, Momo, Stripe).
* Xử lý thanh toán và xác nhận giao dịch.
* Gửi email xác nhận đăng ký.
* Kiểm tra giới hạn số lượng học viên.
* Áp dụng mã giảm giá/coupon.

## 4. Điều kiện & Quy tắc (Rules)
* **Kích hoạt (Trigger)**: Student click "Đăng ký khóa học" từ trang chi tiết khóa học.
* **Điều kiện tiên quyết (Pre-condition)**:
    * Student phải đã đăng nhập.
    * Student chưa đăng ký khóa học này trước đó.
    * Khóa học phải tồn tại trong database.
* **Quy tắc kinh doanh & Thông báo lỗi**:
    * Một Student chỉ có thể đăng ký một khóa học một lần duy nhất.
    * Nếu Student đã đăng ký khóa học (bất kể status), hiển thị: "Bạn đã đăng ký khóa học này rồi."
    * Số điện thoại phải có định dạng hợp lệ (10-11 số).
    * Email phải đúng định dạng.
    * Enrollment được tạo với status = "pending" và created_at = thời gian hiện tại.

## 5. Thiết kế giao diện (Screen Design & Description)
Giao diện form đăng ký khóa học:
1. **Header**: Giống các trang khác.
2. **Page Title**: "Đăng ký khóa học".
3. **Course Info Section**:
    * Hiển thị Thumbnail nhỏ, Tên khóa học, Giá.
4. **Enrollment Form**:
    * Các trường nhập liệu:
        - Họ và tên (text, required, auto-fill từ user info)
        - Email (email, required, auto-fill từ user info)
        - Số điện thoại (tel, required)
        - Ghi chú (textarea, optional)
    * Nút "Xác nhận đăng ký" (hiển thị "Đang xử lý..." khi submit).
    * Nút "Hủy" để quay lại trang chi tiết khóa học.
5. **Footer**: Giống các trang khác.

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)

1. Form đăng ký khóa học phải hiển thị thông tin khóa học: Thumbnail nhỏ, Tên khóa học, Giá.

2. Form phải bao gồm các trường: Họ và tên (text, required), Email (email, required), Số điện thoại (tel, required), Ghi chú (textarea, optional).

3. Trường "Họ và tên" và "Email" phải được tự động điền sẵn từ thông tin user đã đăng nhập (lấy từ JWT token payload hoặc API GET /api/users/me).

4. Validation: Họ tên không được để trống, Email phải đúng định dạng, Số điện thoại phải có 10-11 chữ số.

5. Trước khi submit, phải kiểm tra xem Student đã đăng ký khóa học này chưa: SELECT * FROM Enrollments WHERE student_id = :user_id AND course_id = :course_id. Nếu đã tồn tại -> Hiển thị lỗi "Bạn đã đăng ký khóa học này rồi" và không cho submit.

6. Khi submit thành công, thực hiện INSERT INTO Enrollments (student_id, course_id, status, created_at) VALUES (:user_id, :course_id, 'pending', NOW()).

7. Sau khi tạo enrollment thành công, hiển thị thông báo "Đăng ký thành công! Vui lòng chờ Admin/Instructor duyệt." và chuyển hướng đến "/my-courses".

8. API endpoint: POST /api/enrollments với body { course_id, phone, note }.

9. Nút "Hủy" phải chuyển hướng về trang chi tiết khóa học "/courses/:id".

10. Nếu user chưa đăng nhập (không có JWT token), tự động chuyển hướng đến "/login".
