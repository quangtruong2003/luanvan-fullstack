# Test Email Trực Tiếp Trên Giao Diện

## Bước 1: Kiểm tra cấu hình email

Trước khi test, hãy đảm bảo đã set biến môi trường:

```powershell
# Kiểm tra biến môi trường hiện tại
echo $env:MAIL_USERNAME
echo $env:MAIL_PASSWORD

# Set biến môi trường nếu chưa có
$env:MAIL_USERNAME="your_real_email@gmail.com"
$env:MAIL_PASSWORD="your_16_digit_app_password"
```

## Bước 2: Restart server

Sau khi set biến môi trường, restart server:

```bash
# Dừng server (Ctrl+C)
# Chạy lại
./mvnw spring-boot:run
```

## Bước 3: Test đặt lịch trên giao diện

1. **Mở giao diện frontend:** `http://localhost:5173`
2. **Đăng nhập/đăng ký** tài khoản bệnh nhân
3. **Đặt lịch khám bệnh** như bình thường
4. **Hoàn thành đặt lịch**

## Bước 4: Theo dõi logs

Trong khi đặt lịch, theo dõi logs để xem quá trình gửi email:

### Xem logs real-time:
```bash
# Terminal chạy server
tail -f logs/application.log

# Hoặc xem console nơi chạy server
```

### Logs mong đợi khi thành công:
```
📧 ===== BẮT ĐẦU GỬI EMAIL =====
📧 Patient email: patient@example.com
📧 Patient name: Nguyễn Văn A
📧 Appointment ID: 123
📧 Appointment DateTime: 2025-07-20T09:00
📧 Is First Appointment: true
📧 Gửi email chào mừng lần đầu...
📧 Gửi email thông tin khám bệnh...
📧 Calling emailService.sendAppointmentConfirmationEmail()...
📧 ===== SEND HTML EMAIL =====
📧 To: patient@example.com
📧 From: your_email@gmail.com
📧 Subject: 🏥 Thông Tin Lịch Hẹn Khám Bệnh - Tên phòng khám
📧 Content length: 1234
📧 Tạo MimeMessage...
📧 Set From: your_email@gmail.com
📧 Set To: patient@example.com
📧 Set Subject: 🏥 Thông Tin Lịch Hẹn Khám Bệnh - Tên phòng khám
📧 Set HTML content...
📧 Đang gửi email qua SMTP...
📧 SMTP Host: smtp.gmail.com
📧 SMTP Port: 587
📧 SMTP Username: your_email@gmail.com
✅ Email đã gửi thành công qua SMTP
📧 ===== HOÀN THÀNH SEND HTML EMAIL =====
✅ Email thông tin khám bệnh đã gửi thành công
📧 ===== HOÀN THÀNH GỬI EMAIL =====
```

### Logs lỗi nếu có:
```
❌ ===== LỖI KHI GỬI EMAIL =====
❌ Error message: Authentication failed
❌ Exception type: MailAuthenticationException
❌ Stack trace:
org.springframework.mail.MailAuthenticationException: Authentication failed
    at org.springframework.mail.javamail.JavaMailSenderImpl.doSend(JavaMailSenderImpl.java:402)
    ...
❌ ===== KẾT THÚC LỖI EMAIL =====
```

## Bước 5: Kiểm tra email

1. **Kiểm tra inbox** của email bệnh nhân
2. **Kiểm tra spam folder** nếu không thấy
3. **Kiểm tra email từ** (phải là email Gmail đã cấu hình)

## Troubleshooting:

### 1. Không thấy logs email
- Kiểm tra xem có gọi đến `createAppointment` không
- Kiểm tra xem có lỗi nào trước khi gửi email không

### 2. Lỗi Authentication failed
- Kiểm tra Gmail App Password
- Đảm bảo đã bật 2FA
- Kiểm tra email và password đúng

### 3. Lỗi Connection timeout
- Kiểm tra internet
- Kiểm tra firewall
- Thử test với Postman trước

### 4. Email không đến
- Kiểm tra spam folder
- Kiểm tra email đích đúng không
- Test với email khác

## Debug chi tiết:

### Thêm debug logs vào application.properties:
```properties
logging.level.org.springframework.mail=DEBUG
logging.level.org.eclipse.angus.mail=DEBUG
logging.level.com.luanvan.luanvanbackend=DEBUG
```

### Kiểm tra cấu hình SMTP:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME:your_email@gmail.com}
spring.mail.password=${MAIL_PASSWORD:your_app_password}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

## Lưu ý:
- Email sẽ được gửi **ngay khi đặt lịch thành công**
- Không cần đợi xác nhận bác sĩ
- Email sẽ gửi cả khi chưa thanh toán
- Nếu lỗi email, lịch hẹn vẫn được tạo thành công 