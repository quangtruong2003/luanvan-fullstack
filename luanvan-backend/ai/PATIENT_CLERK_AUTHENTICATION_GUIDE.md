# 🔐 Hướng Dẫn Patient Authentication qua Clerk

## 📋 Tổng Quan

Hệ thống sử dụng **Hybrid Authentication System**:
- **Admin & Doctor**: Email-based login với backend JWT
- **Patient**: Clerk authentication với backend sync

## 🔄 Luồng Authentication cho Patient

### 1. Frontend (React + Clerk)
```javascript
// Patient đăng nhập thông qua Clerk
import { useAuth } from '@clerk/nextjs'

const { user, isSignedIn } = useAuth()
```

### 2. Backend Sync
Sau khi Clerk authentication thành công, frontend gọi API để sync với backend:

```javascript
// Frontend gọi API sync
const syncResponse = await fetch('/api/auth/clerk-sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clerkUserId: user.id,
    email: user.primaryEmailAddress?.emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumbers[0]?.phoneNumber,
    imageUrl: user.imageUrl
  })
})

const { token, userId } = await syncResponse.json()
// Lưu token để sử dụng cho các API calls khác
localStorage.setItem('authToken', token)
```

### 3. Sử dụng Token cho API Calls
```javascript
// Gọi API với token
await fetch('/api/appointments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(appointmentData)
})
```

## 🧪 Testing với Postman

### Bước 1: Chạy Patient Clerk Sync
```
POST {{base_url}}/api/auth/clerk-sync
Content-Type: application/json

{
  "clerkUserId": "user_test123",
  "email": "patient.test@example.com", 
  "firstName": "Test",
  "lastName": "Patient",
  "phoneNumber": "+84901234567",
  "imageUrl": "https://example.com/avatar.jpg"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Tạo tài khoản mới thành công",
  "userId": 123,
  "fullName": "Test Patient",
  "email": "patient.test@example.com",
  "isNewUser": true,
  "token": "eyJhbGciOiJIUzI1NiIs...", 
  "role": "PATIENT"
}
```

### Bước 2: Sử dụng Token để tạo Appointment
```
POST {{base_url}}/api/appointments  
Authorization: Bearer {{patient_token}}
Content-Type: application/json

{
  "patientId": {{patient_user_id}},
  "doctorId": 1,
  "clinicId": 1, 
  "specialtyId": 1,
  "slotId": 1,
  "appointmentDateTime": "2025-06-14T09:00:00",
  "reasonForVisit": "General health checkup",
  "depositAmount": 100000,
  "isDepositPaid": false
}
```

## 🔧 Environment Variables trong Postman

```
patient_token = eyJhbGciOiJIUzI1NiIs... (từ clerk-sync response)
patient_user_id = 123 (từ clerk-sync response)
```

## ⚠️ Lưu Ý Quan Trọng

1. **Patient KHÔNG thể login qua `/api/auth/login`**
   - Endpoint này chỉ dành cho Admin/Doctor
   - Patient bắt buộc phải qua Clerk

2. **Token Expiration**
   - JWT token có thời hạn (thường 24h)
   - Cần refresh token khi hết hạn

3. **Phone Number Format**
   - Hệ thống tự động sanitize phone number
   - Chỉ giữ lại số, loại bỏ ký tự đặc biệt

4. **User Roles**
   - Patient tự động được gán role "PATIENT"
   - Không thể thay đổi role qua Clerk sync

## 🚨 Troubleshooting

### Lỗi 403 Forbidden khi tạo appointment
- **Nguyên nhân**: Không có token hoặc token không hợp lệ
- **Giải pháp**: Chạy lại Clerk sync để lấy token mới

### Lỗi "Chỉ Admin và Doctor được phép đăng nhập qua email"
- **Nguyên nhân**: Cố gắng login Patient qua `/api/auth/login`
- **Giải pháp**: Sử dụng `/api/auth/clerk-sync` thay thế

### Lỗi patientId không tồn tại
- **Nguyên nhân**: Chưa chạy Clerk sync hoặc userId sai
- **Giải pháp**: Kiểm tra `{{patient_user_id}}` trong Postman environment

## 📚 API Endpoints Summary

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/clerk-sync` | POST | ❌ | Sync patient từ Clerk, trả về token |
| `/api/appointments` | POST | ✅ Patient Token | Tạo appointment mới |
| `/api/appointments/patient/{id}` | GET | ✅ Patient/Admin Token | Lấy appointments của patient | 