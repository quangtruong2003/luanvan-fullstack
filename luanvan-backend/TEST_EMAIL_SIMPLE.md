# 🧪 Test Email Đơn Giản

## Bước 1: Kiểm tra Server đã khởi động
```bash
# Kiểm tra port 9090
netstat -ano | findstr :9090
```

## Bước 2: Test Email bằng Postman

### Endpoint 1: Test Email với Query Parameters
```
GET http://localhost:9090/api/test/email?to=your-email@gmail.com&subject=Test&body=Hello
```

### Endpoint 2: Test Email với JSON Body
```
POST http://localhost:9090/api/test/email
Content-Type: application/json

{
  "to": "your-email@gmail.com",
  "subject": "Test Email từ Backend",
  "body": "Đây là email test từ hệ thống khám bệnh"
}
```

## Bước 3: Test Email bằng cURL

```bash
# Test với query parameters
curl -X GET "http://localhost:9090/api/test/email?to=your-email@gmail.com&subject=Test&body=Hello"

# Test với JSON body
curl -X POST "http://localhost:9090/api/test/email" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@gmail.com",
    "subject": "Test Email từ Backend",
    "body": "Đây là email test từ hệ thống khám bệnh"
  }'
```

## Bước 4: Kiểm tra Logs

Sau khi test, kiểm tra logs:

```bash
# Xem logs real-time
cd luanvan-backend
Get-Content logs/email.log -Wait -Tail 10

# Hoặc xem logs application
Get-Content logs/application.log -Wait -Tail 10
```

## Bước 5: Test Đặt Lịch trên Frontend

1. Mở frontend: http://localhost:5173
2. Đăng nhập với tài khoản patient
3. Chọn bác sĩ và slot thời gian
4. Điền thông tin và đặt lịch
5. Theo dõi logs backend để xem quá trình gửi email

## 🔍 Debug Email Service

Nếu email không gửi được, kiểm tra:

1. **Cấu hình Gmail SMTP** trong `application.properties`:
   ```properties
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=${MAIL_USERNAME}
   spring.mail.password=${MAIL_PASSWORD}
   spring.mail.properties.mail.smtp.auth=true
   spring.mail.properties.mail.smtp.starttls.enable=true
   ```

2. **Biến môi trường**:
   ```bash
   echo $MAIL_USERNAME
   echo $MAIL_PASSWORD
   ```

3. **Gmail App Password**: Đảm bảo đã tạo App Password 16 ký tự và bật 2FA

## 📧 Logs cần theo dõi

- `logs/email.log`: Logs chi tiết về email
- `logs/application.log`: Logs tổng quát của ứng dụng
- Console output: Logs real-time khi chạy server

## 🚨 Lỗi thường gặp

1. **Authentication failed**: Chưa cấu hình đúng App Password
2. **Connection timeout**: Firewall hoặc network issue
3. **Invalid email**: Email không đúng format
4. **SMTP error**: Cấu hình SMTP sai 