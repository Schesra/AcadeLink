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

1. Trang chủ phải có Banner quảng cáo ở đầu trang (có thể là hình ảnh tĩnh hoặc slider).

2. Section "Khóa học nổi bật" phải hiển thị tối đa 6-8 khóa học được đánh dấu nổi bật hoặc có số lượng enrollment cao nhất.

3. Section "Khóa học mới nhất" phải hiển thị tối đa 6-8 khóa học được sắp xếp theo created_at DESC.

4. Mỗi card khóa học phải hiển thị: Thumbnail (ảnh), Tên khóa học, Giá (định dạng tiền tệ VNĐ hoặc "Miễn phí" nếu price = 0), Tên danh mục.

5. Click vào bất kỳ card khóa học nào phải chuyển hướng đến trang chi tiết khóa học "/courses/:id".

6. Header phải hiển thị: Logo, Menu điều hướng (Trang chủ, Khóa học), và trạng thái đăng nhập (nếu chưa đăng nhập hiển thị "Đăng nhập/Đăng ký", nếu đã đăng nhập hiển thị tên user và dropdown menu).

7. Footer phải hiển thị thông tin liên hệ và các links cơ bản.

8. Nếu database không có khóa học nào, hiển thị thông báo "Hiện chưa có khóa học nào. Vui lòng quay lại sau."

9. Khi đang tải dữ liệu từ API, hiển thị loading spinner hoặc skeleton screens.

10. Giao diện phải responsive: trên PC hiển thị grid 3-4 cột, trên tablet 2 cột, trên mobile 1 cột.
