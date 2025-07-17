# Hướng dẫn cấu hình Email Gmail

## Lỗi hiện tại: Authentication failed
Lỗi này xảy ra vì cấu hình email chưa đúng. Hiện tại đang dùng placeholder values.

## Bước 1: Tạo Gmail App Password

1. **Bật 2-Factor Authentication (2FA)**
   - Vào Google Account Settings
   - Security → 2-Step Verification → Turn on

2. **Tạo App Password**
   - Vào Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Chọn "Mail" và "Other (Custom name)"
   - Đặt tên: "LuanVan Backend"
   - Copy 16 ký tự password được tạo

## Bước 2: Cấu hình biến môi trường

### Cách 1: Tạo file .env (khuyến nghị)
Tạo file `.env` trong thư mục `luanvan-backend/`:

```env
# Email Configuration
MAIL_USERNAME=your_actual_email@gmail.com
MAIL_PASSWORD=your_16_digit_app_password

# Database Configuration  
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/luanvan_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh&createDatabaseIfNotExist=true
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_database_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=86400000

# App Base URL
APP_BASE_URL=http://localhost:9090
```

### Cách 2: Set biến môi trường trực tiếp

**Windows (PowerShell):**
```powershell
$env:MAIL_USERNAME="your_actual_email@gmail.com"
$env:MAIL_PASSWORD="your_16_digit_app_password"
```

**Windows (Command Prompt):**
```cmd
set MAIL_USERNAME=your_actual_email@gmail.com
set MAIL_PASSWORD=your_16_digit_app_password
```

**Linux/Mac:**
```bash
export MAIL_USERNAME="your_actual_email@gmail.com"
export MAIL_PASSWORD="your_16_digit_app_password"
```

## Bước 3: Test email

Sau khi cấu hình, restart server và test:

```bash
# Test email đơn giản
curl -X POST http://localhost:9090/api/test/send-simple-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","text":"Hello"}'

# Test email HTML
curl -X POST http://localhost:9090/api/test/send-html-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test HTML","htmlContent":"<h1>Hello</h1>"}'
```

## Bước 4: Kiểm tra logs

Xem logs để đảm bảo email được gửi thành công:

```bash
tail -f logs/application.log
```

## Lưu ý quan trọng:

1. **KHÔNG dùng mật khẩu Gmail thông thường**
2. **PHẢI dùng App Password 16 ký tự**
3. **PHẢI bật 2FA trước khi tạo App Password**
4. **Email phải là Gmail thật, không phải placeholder**

## Troubleshooting:

- **535-5.7.8 Username and Password not accepted**: Kiểm tra App Password
- **Connection timeout**: Kiểm tra firewall/network
- **SSL/TLS error**: Cấu hình đã đúng, không cần thay đổi 