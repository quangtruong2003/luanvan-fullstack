# Hướng dẫn Test Email Nhanh

## 🚀 Test ngay lập tức

### 1. Khởi động backend
```bash
cd luanvan-backend
./mvnw spring-boot:run
```

### 2. Test email đơn giản
```bash
curl -X POST "http://localhost:9090/api/test/send-test-email?email=your_email@gmail.com"
```

### 3. Test email HTML
```bash
curl -X POST "http://localhost:9090/api/test/send-test-html-email?email=your_email@gmail.com"
```

### 4. Test với Postman
- **Method**: POST
- **URL**: `http://localhost:9090/api/test/send-test-email`
- **Params**: `email=your_email@gmail.com`

## 🔧 Cấu hình Email

### Bước 1: Tạo Gmail App Password
1. Vào https://myaccount.google.com/security
2. Bật 2-Step Verification
3. Tạo App Password cho "Mail"
4. Copy password

### Bước 2: Cấu hình Environment Variables
```bash
export MAIL_USERNAME=your_email@gmail.com
export MAIL_PASSWORD=your_app_password_here
```

### Bước 3: Restart backend
```bash
# Dừng backend (Ctrl+C)
# Khởi động lại
./mvnw spring-boot:run
```

## 📧 Debug Logs

Khi test, bạn sẽ thấy logs như sau:

```
📧 EmailConfig: Cấu hình SMTP
📧 Host: smtp.gmail.com
📧 Port: 587
📧 Username: your_email@gmail.com
📧 Password: ***
📧 Auth: true
📧 StartTLS: true

🧪 TestController: Bắt đầu test email
🧪 Email: your_email@gmail.com
📧 sendHtmlEmail: Bắt đầu gửi email
📧 To: your_email@gmail.com
📧 From: your_email@gmail.com
📧 Subject: Test Email - Hệ thống đặt lịch khám bệnh
📧 Đang gửi email qua SMTP...
✅ Email đã gửi thành công qua SMTP
✅ Test email đã gửi thành công
```

## ❌ Lỗi thường gặp

### 1. Authentication failed
```
❌ Lỗi SMTP: 535-5.7.8 Username and Password not accepted
```
**Giải pháp**: Kiểm tra App Password, không dùng password thường

### 2. Connection timeout
```
❌ Lỗi SMTP: Connection timed out
```
**Giải pháp**: Kiểm tra firewall, thử port 587

### 3. SSL/TLS error
```
❌ Lỗi SMTP: SSL handshake failed
```
**Giải pháp**: Đảm bảo `starttls.enable=true`

## 🎯 Test đặt lịch thực tế

Sau khi test email thành công:

1. **Đặt lịch** qua frontend
2. **Kiểm tra logs** backend xem có gửi email không
3. **Kiểm tra inbox** email

## 📝 Logs khi đặt lịch

```
📧 Bắt đầu gửi email...
📧 Patient email: patient@example.com
📧 Appointment ID: 123
📧 Gửi email thông tin khám bệnh...
📧 EmailServiceImpl: Bắt đầu gửi email xác nhận
📧 To: patient@example.com
📧 From: your_email@gmail.com
📧 Subject: 🏥 Thông Tin Lịch Hẹn Khám Bệnh - Phòng khám ABC
📧 Content length: 2048
📧 sendHtmlEmail: Bắt đầu gửi email
📧 Đang gửi email qua SMTP...
✅ Email đã gửi thành công qua SMTP
✅ Email xác nhận đã gửi thành công
✅ Email thông tin khám bệnh đã gửi thành công
``` 