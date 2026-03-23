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
* **Hiển thị danh sách**: Truy cập "/instructor/enrollments" -> Hiển thị chỉ enrollment của khóa học có instructor_id = current user.
* **Lọc theo trạng thái**: Click tab "Chờ duyệt" -> Chỉ hiển thị enrollment pending.
* **Lọc theo khóa học**: Chọn khóa học từ dropdown -> Chỉ hiển thị enrollment của khóa học đó.
* **Duyệt enrollment thành công**: Click "Duyệt" -> Confirm -> Cập nhật status = "approved" -> Thông báo "Duyệt thành công" -> Badge chuyển màu xanh.
* **Từ chối enrollment thành công**: Click "Từ chối" -> Confirm -> Cập nhật status = "rejected" -> Thông báo "Đã từ chối" -> Badge chuyển màu đỏ.
* **Hủy duyệt/từ chối**: Click "Duyệt/Từ chối" -> Confirm -> Click "Hủy" -> Không cập nhật.
* **Enrollment đã duyệt/từ chối**: Không hiển thị actions.
* **Không có enrollment**: Chưa có enrollment nào -> Hiển thị "Chưa có yêu cầu ghi danh nào."
* **Không có quyền**: User không có role instructor -> Chuyển hướng hoặc lỗi 403.
* **Không thấy enrollment của người khác**: Instructor A không thấy enrollment của khóa học do Instructor B tạo.
