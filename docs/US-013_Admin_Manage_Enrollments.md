# USER STORY 13: QUẢN LÝ GHI DANH (ADMIN)

## 1. Thông tin chung (Card)
* **Đối tượng**: Là một quản trị viên (Admin).
* **Hành động**: Tôi muốn xem và duyệt/từ chối tất cả yêu cầu ghi danh trong hệ thống.
* **Mục tiêu**: Để kiểm soát quyền truy cập khóa học và quản lý toàn bộ enrollment trên nền tảng ACADELINK.

## 2. Tóm tắt (Summary)
Cung cấp giao diện quản lý enrollment cho Admin trong hệ thống ACADELINK, hiển thị danh sách tất cả yêu cầu ghi danh với thông tin học viên, khóa học, trạng thái, và cho phép Admin cập nhật trạng thái (pending -> approved/rejected).

## 3. Phạm vi (Scope)
### Trong phạm vi (In-scope):
* Hiển thị trang danh sách tất cả enrollment dưới dạng bảng (table).
* Mỗi row hiển thị: ID, Tên học viên, Email, Khóa học, Trạng thái, Ngày đăng ký, Actions.
* Badge màu sắc cho trạng thái:
    - Pending: Màu vàng/cam
    - Approved: Màu xanh
    - Rejected: Màu đỏ
* Actions cho enrollment có status = "pending":
    - Nút "Duyệt" (Approve) -> Cập nhật status = "approved"
    - Nút "Từ chối" (Reject) -> Cập nhật status = "rejected"
* Enrollment đã duyệt hoặc từ chối không có actions (hoặc chỉ hiển thị status).
* Hiển thị confirm dialog trước khi duyệt/từ chối.
* Hiển thị thông báo thành công sau khi cập nhật.
* Lọc enrollment theo trạng thái (All/Pending/Approved/Rejected).

### Ngoài phạm vi (Out of Scope):
* Tìm kiếm enrollment theo tên học viên hoặc khóa học.
* Sắp xếp enrollment.
* Phân trang (pagination).
* Xóa enrollment.
* Gửi email thông báo cho học viên khi duyệt/từ chối.
* Xem chi tiết thông tin enrollment (số điện thoại, ghi chú).
* Thống kê số lượng enrollment theo trạng thái.

## 4. Điều kiện & Quy tắc (Rules)
* **Kích hoạt (Trigger)**: Admin click menu "Quản lý Ghi danh" trong Admin Dashboard hoặc truy cập "/admin/enrollments".
* **Điều kiện tiên quyết (Pre-condition)**:
    * Admin phải đã đăng nhập với role = "admin".
    * Thiết bị phải có kết nối Internet.
* **Quy tắc kinh doanh & Thông báo lỗi**:
    * Chỉ enrollment có status = "pending" mới có thể duyệt/từ chối.
    * Khi duyệt (approve) -> Cập nhật status = "approved" -> Học viên có thể vào học.
    * Khi từ chối (reject) -> Cập nhật status = "rejected" -> Học viên không thể vào học.
    * Enrollment được hiển thị theo thứ tự mới nhất trước (created_at DESC).
    * Dữ liệu được join từ bảng Enrollments, Users, và Courses.

## 5. Thiết kế giao diện (Screen Design & Description)
Giao diện quản lý ghi danh:
1. **Admin Layout**: Sidebar + Main content.
2. **Page Title**: "Quản lý Ghi danh".
3. **Filter Bar**:
    * Tabs hoặc buttons: "Tất cả" | "Chờ duyệt" | "Đã duyệt" | "Từ chối"
    * Click vào tab -> Lọc danh sách theo trạng thái.
4. **Enrollments Table**:
    * Columns: ID | Học viên | Email | Khóa học | Trạng thái | Ngày đăng ký | Thao tác
    * Trạng thái hiển thị dưới dạng badge màu sắc.
    * Ngày đăng ký hiển thị định dạng DD/MM/YYYY.
    * Actions (chỉ cho pending):
        - Nút "Duyệt" (màu xanh)
        - Nút "Từ chối" (màu đỏ)
5. **Confirmation Dialog**:
    * Khi click "Duyệt": "Bạn có chắc muốn duyệt yêu cầu ghi danh này?"
    * Khi click "Từ chối": "Bạn có chắc muốn từ chối yêu cầu ghi danh này?"
    * Nút "Xác nhận" và "Hủy".

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)
* **Hiển thị danh sách**: Truy cập "/admin/enrollments" -> Hiển thị bảng với tất cả enrollment, đúng thông tin Học viên, Email, Khóa học, Trạng thái, Ngày đăng ký.
* **Lọc theo trạng thái**: Click tab "Chờ duyệt" -> Chỉ hiển thị enrollment có status = "pending".
* **Duyệt enrollment thành công**: Click "Duyệt" ở row enrollment pending -> Confirm dialog -> Click "Xác nhận" -> Cập nhật status = "approved" trong database -> Hiển thị thông báo "Duyệt thành công" -> Badge chuyển sang màu xanh "Đã duyệt" -> Actions biến mất.
* **Từ chối enrollment thành công**: Click "Từ chối" ở row enrollment pending -> Confirm dialog -> Click "Xác nhận" -> Cập nhật status = "rejected" trong database -> Hiển thị thông báo "Đã từ chối" -> Badge chuyển sang màu đỏ "Từ chối" -> Actions biến mất.
* **Hủy duyệt/từ chối**: Click "Duyệt" hoặc "Từ chối" -> Confirm dialog -> Click "Hủy" -> Không cập nhật status.
* **Enrollment đã duyệt**: Row có status = "approved" -> Không hiển thị actions, chỉ hiển thị badge "Đã duyệt".
* **Enrollment đã từ chối**: Row có status = "rejected" -> Không hiển thị actions, chỉ hiển thị badge "Từ chối".
* **Không có enrollment**: Chưa có enrollment nào trong hệ thống -> Hiển thị "Chưa có yêu cầu ghi danh nào."
* **Không có quyền**: User với role = "student" truy cập URL này -> Chuyển hướng hoặc hiển thị lỗi 403.
* **Student được vào học**: Sau khi Admin duyệt enrollment -> Student truy cập "/courses/:id/learn" -> Có thể xem nội dung bài học.
