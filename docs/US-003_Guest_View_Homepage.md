# USER STORY 3: XEM TRANG CHỦ (GUEST/STUDENT)

## 1. Thông tin chung (Card)
* **Đối tượng**: Là một khách vãng lai hoặc học viên.
* **Hành động**: Tôi muốn xem trang chủ với các khóa học nổi bật.
* **Mục tiêu**: Để khám phá và tìm hiểu về các khóa học có sẵn trong hệ thống.

## 2. Tóm tắt (Summary)
Hiển thị trang chủ của hệ thống ACADELINK với banner quảng cáo và danh sách các khóa học nổi bật/mới nhất, giúp người dùng dễ dàng khám phá và lựa chọn khóa học phù hợp.

## 3. Phạm vi (Scope)
### Trong phạm vi (In-scope):
* Hiển thị banner quảng cáo ở đầu trang (có thể là slider hoặc banner tĩnh).
* Hiển thị section "Khóa học nổi bật" với tối đa 6-8 khóa học.
* Hiển thị section "Khóa học mới nhất" với tối đa 6-8 khóa học.
* Mỗi card khóa học hiển thị: Thumbnail, Tên khóa học, Giá, Danh mục.
* Click vào card khóa học -> Chuyển đến trang chi tiết khóa học.
* Header hiển thị logo, menu điều hướng (Trang chủ, Khóa học, Đăng nhập/Đăng ký hoặc Tên user nếu đã đăng nhập).
* Footer hiển thị thông tin liên hệ và links.
* Responsive trên cả PC và Mobile.

### Ngoài phạm vi (Out of Scope):
* Tìm kiếm khóa học từ trang chủ.
* Lọc khóa học theo danh mục từ trang chủ.
* Hiển thị đánh giá/rating của khóa học.
* Phân trang cho danh sách khóa học.
* Thêm khóa học vào wishlist.

## 4. Điều kiện & Quy tắc (Rules)
* **Kích hoạt (Trigger)**: Người dùng truy cập vào URL gốc của website (/).
* **Điều kiện tiên quyết (Pre-condition)**:
    * Hệ thống phải có ít nhất một số khóa học trong database.
    * Thiết bị phải có kết nối Internet.
* **Quy tắc kinh doanh & Thông báo lỗi**:
    * Khóa học nổi bật được xác định dựa trên số lượng enrollment hoặc được đánh dấu bởi Admin.
    * Khóa học mới nhất được sắp xếp theo thời gian tạo (created_at DESC).
    * Nếu không có khóa học nào, hiển thị: "Hiện chưa có khóa học nào. Vui lòng quay lại sau."
    * Giá khóa học hiển thị định dạng tiền tệ (VD: 500,000đ hoặc Miễn phí nếu price = 0).

## 5. Thiết kế giao diện (Screen Design & Description)
Giao diện trang chủ bao gồm:
1. **Header**:
    * Logo ACADELINK (bên trái).
    * Menu: Trang chủ | Khóa học | (Đăng nhập/Đăng ký) hoặc (Tên user + Dropdown).
2. **Banner Section**:
    * Banner quảng cáo lớn với slogan và CTA button "Khám phá ngay".
3. **Khóa học nổi bật Section**:
    * Tiêu đề: "Khóa học nổi bật".
    * Grid layout hiển thị 6-8 cards khóa học.
    * Mỗi card: Thumbnail, Tên, Giá, Danh mục.
4. **Khóa học mới nhất Section**:
    * Tiêu đề: "Khóa học mới nhất".
    * Grid layout hiển thị 6-8 cards khóa học.
5. **Footer**:
    * Thông tin liên hệ, links mạng xã hội.

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)
* **Hiển thị thành công**: Truy cập trang chủ -> Hiển thị banner, khóa học nổi bật và mới nhất.
* **Click vào khóa học**: Click vào bất kỳ card khóa học nào -> Chuyển đến trang chi tiết "/courses/:id".
* **Không có khóa học**: Database không có khóa học -> Hiển thị thông báo "Hiện chưa có khóa học nào".
* **Responsive**: Truy cập từ mobile -> Layout tự động điều chỉnh, cards xếp theo cột dọc.
* **Loading**: Khi đang tải dữ liệu -> Hiển thị skeleton hoặc loading spinner.
* **Header**: Nếu chưa đăng nhập -> Hiển thị "Đăng nhập/Đăng ký". Nếu đã đăng nhập -> Hiển thị tên user.
