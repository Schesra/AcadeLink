# ROADMAP TRIỂN KHAI (Deadline chốt toàn bộ: 23:59 ngày 30/04)

## 1. Chuẩn bị (Từ nay đến 21/03)
* Hoàn thành khóa học trên web.
* Chuẩn bị sẵn một repo Github Public.

## 2. Các mốc triển khai chính

### Phase 1: Lên màn hình và luồng giao diện (22/03 - 31/03)
* **Learning Portal:** Dựng màn hình Trang chủ, Danh sách khóa học, Chi tiết khóa học, Form ghi danh, Lịch sử học tập, Màn hình xem Video bài giảng, Đăng nhập/Đăng ký.
* **Admin Dashboard:** Dựng màn hình Quản lý Danh mục, Quản lý Khóa học, Quản lý Bài học, Quản lý Ghi danh.
* **Yêu cầu:** Đầy đủ các màn hình theo SRS, đáp ứng tiêu chí UI/UX Responsive.

### Phase 2: Database, Xác thực & Chức năng Admin (01/04 - 14/04)
* Thiết kế Database theo schema trong SRS.
* **Xử lý Auth:** Đăng ký, Đăng nhập, Phân quyền chặn truy cập trang Admin.
* **Hoàn thiện luồng Admin:** Thêm/Sửa/Xóa Khóa học, Bài học, Danh mục.
* **Learning Portal:** Đổ dữ liệu Khóa học từ database ra hiển thị tại Trang chủ và Trang danh sách.

### Phase 3: Core hệ thống - Ghi danh & Học tập (15/04 - 23/04)
* **Luồng Ghi danh:** Học viên điền form đăng ký khóa học -> Lưu data vào bảng Enrollments với trạng thái pending.
* **Luồng Học tập:** Xử lý màn hình xem khóa học (chỉ hiển thị nội dung Video nếu khóa học đã được duyệt).

### Phase 4: Luồng quản trị & Hoàn thiện hệ thống (24/04 - 30/04)
* **Admin:** Hiển thị danh sách ghi danh, cập nhật trạng thái duyệt học viên (để học viên vào học).
* **Xử lý Data Validation:** Bắt lỗi tất cả các form nhập liệu.
* **Deploy:** Deploy hệ thống lên môi trường live (Điểm cộng).
