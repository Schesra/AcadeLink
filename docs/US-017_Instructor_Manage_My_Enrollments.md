# USER STORY 17: QUẢN LÝ GHI DANH CỦA TÔI (INSTRUCTOR)

## 1. Thông tin chung (Card)
* **Đối tượng**: Là một giảng viên (Instructor).
* **Hành động**: Tôi muốn xem danh sách ghi danh và duyệt/từ chối học viên đăng ký khóa học của tôi.
* **Mục tiêu**: Để kiểm soát quyền truy cập khóa học và cho phép học viên vào học các khóa học mà tôi tạo ra.

## 2. Tóm tắt (Summary)
Cung cấp giao diện quản lý enrollment cho Instructor, hiển thị danh sách yêu cầu ghi danh vào các khóa học do Instructor tạo, và cho phép duyệt/từ chối enrollment.

## 3. Phạm vi (Scope)
### Trong phạm vi (In-scope):
* Hiển thị danh sách enrollment của các khóa học có instructor_id = current user.
* Mỗi row hiển thị: ID, Tên học viên, Email, Khóa học, Trạng thái, Ngày đăng ký, Actions.
* Badge màu sắc cho trạng thái (Pending/Approved/Rejected).
* Actions cho enrollment pending: Nút "Duyệt" và "Từ chối".
* Hiển thị confirm dialog trước khi duyệt/từ chối.
* Hiển thị thông báo thành công sau khi cập nhật.
* Lọc enrollment theo trạng thái (All/Pending/Approved/Rejected).
* Lọc enrollment theo khóa học (dropdown).

### Ngoài phạm vi (Out of Scope):
* Tìm kiếm enrollment theo tên học viên.
* Sắp xếp enrollment.
* Phân trang.
* Xóa enrollment.
* Gửi email thông báo cho học viên.
* Xem chi tiết thông tin enrollment.
* Thống kê số lượng enrollment.

## 4. Điều kiện & Quy tắc (Rules)
* **Kích hoạt (Trigger)**: Instructor click menu "Ghi danh" trong Instructor Dashboard hoặc truy cập "/instructor/enrollments".
* **Điều kiện tiên quyết (Pre-condition)**:
    * User phải có role "instructor".
    * Instructor phải có ít nhất một khóa học.
    * Thiết bị phải có kết nối Internet.
* **Quy tắc kinh doanh & Thông báo lỗi**:
    * Instructor chỉ thấy enrollment của các khóa học có instructor_id = current user.
    * Chỉ enrollment có status = "pending" mới có thể duyệt/từ chối.
    * Khi duyệt -> Cập nhật status = "approved" -> Học viên có thể vào học.
    * Khi từ chối -> Cập nhật status = "rejected" -> Học viên không thể vào học.
    * Enrollment được sắp xếp theo created_at DESC.

## 5. Thiết kế giao diện (Screen Design & Description)
Giao diện quản lý ghi danh:
1. **Instructor Layout**: Sidebar + Main content.
2. **Page Title**: "Quản lý Ghi danh".
3. **Filter Bar**:
    * Tabs: "Tất cả" | "Chờ duyệt" | "Đã duyệt" | "Từ chối"
    * Dropdown: Lọc theo khóa học (chỉ khóa học của mình).
4. **Enrollments Table**:
    * Columns: ID | Học viên | Email | Khóa học | Trạng thái | Ngày đăng ký | Thao tác
    * Trạng thái: Badge màu sắc.
    * Actions (chỉ cho pending): Nút "Duyệt" và "Từ chối".
5. **Confirmation Dialog**:
    * "Bạn có chắc muốn duyệt/từ chối yêu cầu ghi danh này?"
    * Nút "Xác nhận" và "Hủy".

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)

1. Trang phải hiển thị bảng với các enrollment thuộc khóa học do Instructor tạo, query: SELECT e.*, u.username, u.email, c.title as course_title FROM Enrollments e JOIN Users u ON e.user_id = u.id JOIN Courses c ON e.course_id = c.id WHERE c.instructor_id = :user_id ORDER BY e.created_at DESC.

2. Bảng phải có các cột: ID, Học viên (username), Email, Khóa học, Trạng thái (badge màu sắc), Ngày đăng ký, Thao tác.

3. Badge trạng thái phải có màu sắc:
   - Pending: màu vàng/cam (warning)
   - Approved: màu xanh lá (success)
   - Rejected: màu đỏ (danger)

4. Hiển thị tổng số enrollment: "Tổng số ghi danh: X".

5. Filter Bar phải có:
   - Tabs: "Tất cả" | "Chờ duyệt" | "Đã duyệt" | "Từ chối"
   - Dropdown "Lọc theo khóa học": Load từ SELECT id, title FROM Courses WHERE instructor_id = :user_id ORDER BY title

6. Khi click tab "Chờ duyệt": Query thêm WHERE e.status = 'pending'.

7. Khi click tab "Đã duyệt": Query thêm WHERE e.status = 'approved'.

8. Khi click tab "Từ chối": Query thêm WHERE e.status = 'rejected'.

9. Khi chọn khóa học từ dropdown: Query thêm WHERE e.course_id = :course_id.

10. Nút "Duyệt" và "Từ chối" chỉ hiển thị cho enrollment có status = 'pending'.

11. Khi click "Duyệt": Hiển thị confirm dialog "Bạn có chắc muốn duyệt yêu cầu ghi danh của [username] vào khóa học [course_title]?"

12. Khi xác nhận duyệt: UPDATE Enrollments SET status = 'approved', updated_at = NOW() WHERE id = :id AND course_id IN (SELECT id FROM Courses WHERE instructor_id = :user_id) AND status = 'pending'. API: PUT /api/instructor/enrollments/:id/approve.

13. Khi click "Từ chối": Hiển thị confirm dialog "Bạn có chắc muốn từ chối yêu cầu ghi danh của [username] vào khóa học [course_title]?"

14. Khi xác nhận từ chối: UPDATE Enrollments SET status = 'rejected', updated_at = NOW() WHERE id = :id AND course_id IN (SELECT id FROM Courses WHERE instructor_id = :user_id) AND status = 'pending'. API: PUT /api/instructor/enrollments/:id/reject.

15. Sau khi duyệt/từ chối thành công: Hiển thị thông báo "Duyệt thành công" hoặc "Đã từ chối", badge cập nhật màu sắc, nút "Duyệt/Từ chối" biến mất.

16. Enrollment có status = 'approved' hoặc 'rejected' không hiển thị nút actions.

17. Instructor không được thấy hoặc cập nhật enrollment của khóa học do Instructor khác tạo (WHERE c.instructor_id = :user_id trong mọi query).

18. API endpoints phải yêu cầu JWT token với role 'instructor'.

19. Nếu chưa có enrollment nào, hiển thị: "Chưa có yêu cầu ghi danh nào."

20. Validation: Chỉ cho phép cập nhật enrollment có status = 'pending'. Nếu status khác -> Lỗi 400 "Không thể cập nhật enrollment đã được xử lý".
