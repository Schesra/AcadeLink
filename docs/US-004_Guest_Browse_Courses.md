# USER STORY 4: DUYỆT DANH SÁCH KHÓA HỌC (GUEST/STUDENT)

## 1. Thông tin chung (Card)
* **Đối tượng**: Là một khách vãng lai hoặc học viên.
* **Hành động**: Tôi muốn xem toàn bộ danh sách khóa học và lọc theo danh mục.
* **Mục tiêu**: Để tìm kiếm và lựa chọn khóa học phù hợp với nhu cầu học tập của mình.

## 2. Tóm tắt (Summary)
Hiển thị trang danh sách toàn bộ khóa học trong hệ thống ACADELINK với khả năng lọc theo danh mục, giúp người dùng dễ dàng tìm kiếm và khám phá các khóa học theo lĩnh vực quan tâm.

## 3. Phạm vi (Scope)
### Trong phạm vi (In-scope):
* Hiển thị toàn bộ khóa học dưới dạng grid layout.
* Mỗi card khóa học hiển thị: Thumbnail, Tên, Giá, Danh mục, Mô tả ngắn.
* Sidebar hoặc dropdown để lọc khóa học theo danh mục.
* Hiển thị số lượng khóa học tìm thấy.
* Click vào card khóa học -> Chuyển đến trang chi tiết.
* Click vào danh mục -> Lọc và hiển thị chỉ các khóa học thuộc danh mục đó.
* Nút "Xem tất cả" để bỏ filter và hiển thị lại toàn bộ khóa học.
* Responsive trên PC và Mobile.

### Ngoài phạm vi (Out of Scope):
* Tìm kiếm khóa học theo từ khóa.
* Sắp xếp khóa học (theo giá, tên, ngày tạo).
* Phân trang (pagination) - hiển thị tất cả khóa học trên một trang.
* Lọc theo khoảng giá.
* Hiển thị rating/đánh giá.

## 4. Điều kiện & Quy tắc (Rules)
* **Kích hoạt (Trigger)**: Người dùng click vào menu "Khóa học" hoặc truy cập URL "/courses".
* **Điều kiện tiên quyết (Pre-condition)**:
    * Hệ thống phải có ít nhất một khóa học trong database.
    * Thiết bị phải có kết nối Internet.
* **Quy tắc kinh doanh & Thông báo lỗi**:
    * Mặc định hiển thị tất cả khóa học khi chưa chọn danh mục.
    * Khi chọn một danh mục, chỉ hiển thị các khóa học thuộc danh mục đó.
    * Nếu danh mục không có khóa học nào, hiển thị: "Không tìm thấy khóa học nào trong danh mục này."
    * Giá hiển thị định dạng tiền tệ hoặc "Miễn phí" nếu price = 0.

## 5. Thiết kế giao diện (Screen Design & Description)
Giao diện trang danh sách khóa học:
1. **Header**: Giống trang chủ (Logo, Menu, Login/User info).
2. **Page Title**: "Tất cả khóa học" hoặc "Khóa học - [Tên danh mục]".
3. **Filter Section**:
    * Sidebar (PC) hoặc Dropdown (Mobile) hiển thị danh sách danh mục.
    * Mỗi danh mục có thể click để lọc.
    * Nút "Tất cả" để bỏ filter.
4. **Course Grid**:
    * Hiển thị số lượng: "Tìm thấy X khóa học".
    * Grid layout 3-4 cột (PC), 1-2 cột (Mobile).
    * Mỗi card: Thumbnail, Tên, Giá, Danh mục, Mô tả ngắn (2-3 dòng).
5. **Footer**: Giống trang chủ.

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)
* **Hiển thị tất cả**: Truy cập "/courses" -> Hiển thị toàn bộ khóa học trong hệ thống.
* **Lọc theo danh mục**: Click vào danh mục "Lập trình" -> Chỉ hiển thị các khóa học thuộc danh mục "Lập trình".
* **Số lượng khóa học**: Hiển thị đúng số lượng khóa học tìm thấy (VD: "Tìm thấy 12 khóa học").
* **Click vào khóa học**: Click vào card -> Chuyển đến "/courses/:id".
* **Không có khóa học**: Danh mục không có khóa học -> Hiển thị "Không tìm thấy khóa học nào".
* **Bỏ filter**: Click "Tất cả" -> Hiển thị lại toàn bộ khóa học.
* **Responsive**: Truy cập từ mobile -> Filter chuyển thành dropdown, grid layout 1 cột.
* **Loading**: Đang tải dữ liệu -> Hiển thị loading spinner.
