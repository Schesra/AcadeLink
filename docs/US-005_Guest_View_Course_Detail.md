# USER STORY 5: XEM CHI TIẾT KHÓA HỌC (GUEST/STUDENT)

## 1. Thông tin chung (Card)
* **Đối tượng**: Là một khách vãng lai hoặc học viên.
* **Hành động**: Tôi muốn xem thông tin chi tiết của một khóa học.
* **Mục tiêu**: Để hiểu rõ nội dung, giá cả và chương trình học trước khi quyết định đăng ký.

## 2. Tóm tắt (Summary)
Hiển thị trang chi tiết khóa học trong hệ thống ACADELINK với đầy đủ thông tin bao gồm thumbnail, tên, giá, mô tả chi tiết, danh mục và curriculum (danh sách bài học), giúp người dùng đưa ra quyết định đăng ký khóa học.

## 3. Phạm vi (Scope)
### Trong phạm vi (In-scope):
* Hiển thị thumbnail/banner của khóa học.
* Hiển thị tên khóa học, giá, danh mục.
* Hiển thị mô tả chi tiết của khóa học.
* Hiển thị curriculum (danh sách bài học) với tên bài học và thứ tự.
* Nút "Đăng ký khóa học" (cho Guest và Student chưa đăng ký).
* Nếu Student đã đăng ký khóa học -> Hiển thị nút "Vào học" thay vì "Đăng ký".
* Nếu Guest -> Click "Đăng ký khóa học" -> Chuyển đến trang đăng nhập.
* Responsive trên PC và Mobile.

### Ngoài phạm vi (Out of Scope):
* Hiển thị video preview/demo.
* Hiển thị thông tin giảng viên.
* Hiển thị đánh giá/review của học viên.
* Hiển thị số lượng học viên đã đăng ký.
* Thêm vào wishlist.
* Chia sẻ khóa học lên mạng xã hội.

## 4. Điều kiện & Quy tắc (Rules)
* **Kích hoạt (Trigger)**: Người dùng click vào card khóa học từ trang chủ hoặc trang danh sách, hoặc truy cập URL "/courses/:id".
* **Điều kiện tiên quyết (Pre-condition)**:
    * Khóa học phải tồn tại trong database.
    * Thiết bị phải có kết nối Internet.
* **Quy tắc kinh doanh & Thông báo lỗi**:
    * Nếu khóa học không tồn tại (ID không hợp lệ), hiển thị trang 404 "Không tìm thấy khóa học".
    * Curriculum hiển thị danh sách bài học theo thứ tự (order ASC).
    * Guest không thể xem nội dung video/text của bài học.
    * Student chưa đăng ký không thể xem nội dung bài học.
    * Student đã đăng ký và được duyệt (status = approved) mới có thể vào học.

## 5. Thiết kế giao diện (Screen Design & Description)
Giao diện chi tiết khóa học:
1. **Header**: Giống các trang khác.
2. **Course Hero Section**:
    * Thumbnail/Banner lớn của khóa học.
    * Tên khóa học (H1).
    * Danh mục (badge/tag).
    * Giá (nổi bật, lớn).
    * Nút CTA: "Đăng ký khóa học" hoặc "Vào học".
3. **Course Description Section**:
    * Tiêu đề: "Mô tả khóa học".
    * Nội dung mô tả chi tiết (có thể nhiều đoạn văn).
4. **Curriculum Section**:
    * Tiêu đề: "Nội dung khóa học".
    * Danh sách bài học dạng list hoặc accordion:
        - Số thứ tự bài học.
        - Tên bài học.
        - Icon video/text.
5. **Footer**: Giống các trang khác.

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)
* **Hiển thị đầy đủ**: Truy cập "/courses/:id" -> Hiển thị đầy đủ thumbnail, tên, giá, mô tả, curriculum.
* **Guest click Đăng ký**: Guest click "Đăng ký khóa học" -> Chuyển đến trang đăng nhập "/login".
* **Student chưa đăng ký**: Student đã đăng nhập nhưng chưa đăng ký khóa học -> Hiển thị nút "Đăng ký khóa học" -> Click -> Chuyển đến trang form đăng ký "/courses/:id/enroll".
* **Student đã đăng ký**: Student đã đăng ký khóa học (bất kể status) -> Hiển thị nút "Vào học" -> Click -> Chuyển đến trang học "/courses/:id/learn".
* **Khóa học không tồn tại**: Truy cập ID không hợp lệ -> Hiển thị trang 404.
* **Curriculum**: Danh sách bài học hiển thị đúng thứ tự (order ASC).
* **Responsive**: Truy cập từ mobile -> Layout tự động điều chỉnh, thumbnail và nội dung xếp theo chiều dọc.
