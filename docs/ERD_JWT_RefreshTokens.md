# BỔ SUNG BẢNG REFRESHTOKENS VÀO ERD

## Lý do cần bảng RefreshTokens

**JWT Access Token** (stateless):
- Không lưu trong database
- Lưu ở client (localStorage)
- Thời gian hết hạn ngắn: 15-30 phút
- Chứa: user_id, email, roles, exp

**Refresh Token** (cần lưu database):
- Lưu trong database để quản lý
- Thời gian hết hạn dài: 7-30 ngày
- Dùng để lấy access token mới khi hết hạn
- Có thể revoke (thu hồi) khi logout

---

## Bảng RefreshTokens

### Cấu trúc

| Attribute | Type | Constraint | Description |
|-----------|------|------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID token |
| user_id | INT | FOREIGN KEY -> Users(id), NOT NULL | ID người dùng |
| token | VARCHAR(500) | NOT NULL, UNIQUE | Refresh token (JWT string) |
| expires_at | TIMESTAMP | NOT NULL | Thời gian hết hạn |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian tạo |
| revoked_at | TIMESTAMP | NULL | Thời gian thu hồi (NULL = còn hiệu lực) |

### Indexes
- INDEX on `user_id` (Tìm token của user)
- UNIQUE INDEX on `token` (Đảm bảo token không trùng)
- INDEX on `expires_at` (Xóa token hết hạn)

---

## Relationship

**Users (1) - (N) RefreshTokens**
- Một User có thể có nhiều RefreshTokens (nhiều thiết bị đăng nhập)
- Một RefreshToken thuộc về một User
- **Cascade**: ON DELETE CASCADE (Xóa user -> Xóa tất cả refresh token)

---

## Luồng hoạt động JWT

### 1. Đăng nhập
```
1. User nhập email + password
2. Server verify password (bcrypt.compare)
3. Server tạo 2 tokens:
   - Access Token (JWT, exp: 15 phút)
   - Refresh Token (JWT, exp: 7 ngày)
4. Server lưu Refresh Token vào database
5. Server trả về cả 2 tokens cho client
6. Client lưu:
   - Access Token -> localStorage
   - Refresh Token -> httpOnly cookie (an toàn hơn)
```

### 2. Gọi API
```
1. Client gửi request với Access Token trong header:
   Authorization: Bearer <access_token>
2. Server verify Access Token:
   - Kiểm tra signature
   - Kiểm tra exp (chưa hết hạn)
   - Extract user_id và roles từ payload
3. Server xử lý request và trả về data
```

### 3. Access Token hết hạn
```
1. Client gọi API -> Server trả về 401 Unauthorized
2. Client tự động gọi API refresh token:
   POST /auth/refresh
   Body: { refresh_token }
3. Server kiểm tra Refresh Token:
   - Tìm trong database
   - Kiểm tra expires_at (chưa hết hạn)
   - Kiểm tra revoked_at (chưa bị thu hồi)
4. Nếu hợp lệ -> Server tạo Access Token mới
5. Server trả về Access Token mới
6. Client lưu Access Token mới và retry request ban đầu
```

### 4. Đăng xuất
```
1. Client gọi API logout
2. Server đánh dấu Refresh Token:
   UPDATE RefreshTokens 
   SET revoked_at = NOW() 
   WHERE token = ?
3. Client xóa tokens khỏi localStorage và cookie
```

### 5. Đăng xuất tất cả thiết bị
```
1. User click "Đăng xuất tất cả thiết bị"
2. Server thu hồi tất cả Refresh Tokens của user:
   UPDATE RefreshTokens 
   SET revoked_at = NOW() 
   WHERE user_id = ? AND revoked_at IS NULL
3. Tất cả thiết bị khác không thể refresh token
```

---

## Ví dụ dữ liệu

### Bảng RefreshTokens

| id | user_id | token | expires_at | created_at | revoked_at |
|----|---------|-------|------------|------------|------------|
| 1 | 5 | eyJhbGc... | 2024-02-07 | 2024-01-31 | NULL |
| 2 | 5 | eyJhbGd... | 2024-02-07 | 2024-01-31 | 2024-02-01 |
| 3 | 8 | eyJhbGe... | 2024-02-08 | 2024-02-01 | NULL |

**Giải thích:**
- User 5 có 2 refresh tokens (2 thiết bị)
  - Token 1: Còn hiệu lực (revoked_at = NULL)
  - Token 2: Đã logout (revoked_at = 2024-02-01)
- User 8 có 1 refresh token còn hiệu lực

---

## Cron Job dọn dẹp

**Xóa token hết hạn hoặc đã revoke:**
```sql
DELETE FROM RefreshTokens 
WHERE expires_at < NOW() 
   OR revoked_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

Chạy mỗi ngày lúc 00:00 để dọn dẹp database.

---

## Bảo mật

1. **Refresh Token phải lưu trong httpOnly cookie** (không thể truy cập bằng JavaScript)
2. **Access Token lưu trong localStorage** (dễ sử dụng nhưng có rủi ro XSS)
3. **Sử dụng HTTPS** để tránh bị đánh cắp token
4. **Rotate Refresh Token**: Mỗi lần refresh, tạo refresh token mới và revoke token cũ
5. **Giới hạn số lượng thiết bị**: Một user tối đa 5 refresh tokens active

---

## Cập nhật ERD

Thêm entity **RefreshTokens** vào ERD với relationship:

```
Users ||--o{ RefreshTokens : "has"
```

**Vị trí trong ERD**: Đặt bên cạnh bảng Users

---

## Note quan trọng

- **Access Token**: KHÔNG lưu database (stateless)
- **Refresh Token**: LƯU database (để quản lý và revoke)
- Nếu không cần logout từ xa hoặc quản lý phiên, có thể bỏ bảng RefreshTokens
- Với MVP đơn giản, có thể chỉ dùng Access Token với thời gian hết hạn dài (7 ngày)
