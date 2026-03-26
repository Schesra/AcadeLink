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

1. Trang phải hiển thị bảng với tất cả enrollment, query: SELECT e.*, u.name as student_name, u.email, c.title as course_title FROM Enrollments e JOIN Users u ON e.student_id = u.id JOIN Courses c ON e.course_id = c.id ORDER BY e.created_at DESC.

2. Bảng phải có các cột: ID, Học viên, Email, Khóa học, Trạng thái (badge), Ngày đăng ký, Thao tác.

3. Phải có tabs để lọc theo trạng thái: "Tất cả", "Chờ duyệt" (pending), "Đã duyệt" (approved), "Từ chối" (rejected).

4. Click tab "Chờ duyệt" -> Query: WHERE status = 'pending'.

5. Badge trạng thái phải có màu sắc:
   - pending: background vàng/cam, text "Chờ duyệt"
   - approved: background xanh, text "Đã duyệt"
   - rejected: background đỏ, text "Từ chối"

6. Cột "Thao tác" chỉ hiển thị nút "Duyệt" và "Từ chối" khi status = 'pending'.

7. Nút "Duyệt" phải hiển thị confirm dialog: "Bạn có chắc muốn duyệt yêu cầu ghi danh này?"

8. Khi duyệt: UPDATE Enrollments SET status = 'approved', updated_at = NOW() WHERE id = :id. API: PUT /api/admin/enrollments/:id/approve.

9. Nút "Từ chối" phải hiển thị confirm dialog: "Bạn có chắc muốn từ chối yêu cầu ghi danh này?"

10. Khi từ chối: UPDATE Enrollments SET status = 'rejected', updated_at = NOW() WHERE id = :id. API: PUT /api/admin/enrollments/:id/reject.

11. Sau khi cập nhật status thành công, badge phải tự động cập nhật màu sắc và text, nút "Duyệt"/"Từ chối" phải biến mất.

12. Nếu chưa có enrollment nào, hiển thị empty state: "Chưa có yêu cầu ghi danh nào."

13. Tất cả API endpoints phải yêu cầu JWT token với role 'admin'.

