# Test Email Nhanh - Khắc phục lỗi Authentication

## Lỗi hiện tại:
```
535-5.7.8 Username and Password not accepted
```

## Giải pháp nhanh:

### 1. Kiểm tra biến môi trường hiện tại
```bash
# Windows PowerShell
echo $env:MAIL_USERNAME
echo $env:MAIL_PASSWORD

# Windows CMD  
echo %MAIL_USERNAME%
echo %MAIL_PASSWORD%

# Linux/Mac
echo $MAIL_USERNAME
echo $MAIL_PASSWORD
```

### 2. Set biến môi trường ngay lập tức

**Windows PowerShell:**
```powershell
$env:MAIL_USERNAME="your_real_email@gmail.com"
$env:MAIL_PASSWORD="your_16_digit_app_password"
```

**Windows CMD:**
```cmd
set MAIL_USERNAME=your_real_email@gmail.com
set MAIL_PASSWORD=your_16_digit_app_password
```

**Linux/Mac:**
```bash
export MAIL_USERNAME="your_real_email@gmail.com"
export MAIL_PASSWORD="your_16_digit_app_password"
```

### 3. Restart server
```bash
# Dừng server (Ctrl+C)
# Chạy lại
./mvnw spring-boot:run
```

### 4. Test ngay lập tức
```bash
curl -X POST http://localhost:9090/api/test/send-simple-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your_email@gmail.com","subject":"Test","text":"Hello from LuanVan"}'
```

### 5. Kiểm tra logs
```bash
tail -f logs/application.log | grep -i "mail\|email\|smtp"
```

## Nếu vẫn lỗi:

### Kiểm tra Gmail App Password:
1. Vào https://myaccount.google.com/security
2. 2-Step Verification → App passwords
3. Tạo mới App Password cho "Mail"
4. Copy 16 ký tự (không có dấu cách)

### Test với email khác:
```bash
curl -X POST http://localhost:9090/api/test/send-simple-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@gmail.com","subject":"Test","text":"Hello"}'
```

## Debug chi tiết:
Thêm vào `application.properties`:
```properties
logging.level.org.springframework.mail=DEBUG
logging.level.org.eclipse.angus.mail=DEBUG
```

## Lưu ý:
- **KHÔNG dùng mật khẩu Gmail thường**
- **PHẢI dùng App Password 16 ký tự**
- **PHẢI bật 2FA trước**
- **Email phải là Gmail thật** 