# Hướng Dẫn Test API với Postman (Clerk Authentication)

## 1. Chuẩn Bị

### 1.1. Import Collection
1. Tạo một collection mới trong Postman tên là "Luận Văn API - Clerk"
2. Thêm biến môi trường:
   - `BASE_URL`: http://localhost:9090
   - `CLERK_USER_ID`: (clerk user ID để test)
   - `ADMIN_PHONE`: admin
   - `ADMIN_PASSWORD`: admin123

## 2. Authentication Flow

### 2.1. System Initialization

#### Test Case 1: Tạo Admin Đầu Tiên
```
POST {{BASE_URL}}/api/auth/create-first-admin
Content-Type: application/json

{
    "phoneNumber": "admin",
    "password": "admin123",
    "fullName": "System Administrator",
    "email": "admin@luanvan.com"
}
```

#### Test Case 2: Admin Login
```
POST {{BASE_URL}}/api/auth/login
Content-Type: application/json

{
    "phoneNumber": "admin",
    "password": "admin123"
}

Post-test Script:
pm.environment.set("ADMIN_TOKEN", pm.response.json().token);
```

### 2.2. Clerk User Sync

#### Test Case 3: Sync Patient từ Clerk
```
POST {{BASE_URL}}/api/auth/clerk-sync
Content-Type: application/json

{
    "clerkUserId": "user_2abc123def456",
    "email": "patient@example.com",
    "firstName": "Nguyen",
    "lastName": "Van A",
    "phoneNumber": "0123456789"
}
```

## 3. Core API Testing

### 3.1. User Management
- `GET /api/users/me` - Lấy thông tin user hiện tại
- `PUT /api/users/contact-info` - Cập nhật thông tin liên hệ

### 3.2. Clinic & Doctor Management
- `POST /api/clinics` - Tạo phòng khám (Admin)
- `POST /api/specialties` - Tạo chuyên khoa (Admin)
- `POST /api/doctors/user/{userId}` - Tạo doctor profile (Admin)

### 3.3. Appointment Booking
- `POST /api/appointments` - Đặt lịch hẹn (Patient)
- `POST /api/payments/create` - Tạo thanh toán

## 4. Key Differences với Traditional Auth

**Patient Authentication:**
- ✅ Sử dụng Clerk cho registration/login
- ✅ Backend sync thông qua `/api/auth/clerk-sync`
- ✅ Frontend quản lý Clerk session

**Admin/Doctor Authentication:**
- ✅ Traditional login với JWT
- ✅ Backend issued tokens
- ✅ Full backend session management

**Hybrid System Benefits:**
- Patient UX: Modern Clerk authentication
- Admin Security: Traditional server-side auth
- Flexibility: Best of both worlds

## 5. Test Cases Chi Tiết

### 5.1. System Initialization

#### Test Case 1: Tạo Admin Đầu Tiên (Chỉ dùng 1 lần)
```
POST {{BASE_URL}}/api/auth/create-first-admin
Content-Type: application/json

{
    "phoneNumber": "admin",
    "password": "admin123",
    "fullName": "System Administrator",
    "email": "admin@luanvan.com"
}

Expected: 
- Status: 200
- Response: Admin user details với role ADMIN
```

#### Test Case 2: Đăng Nhập Admin (Để lấy token quản trị)
```
POST {{BASE_URL}}/api/auth/login
Content-Type: application/json

{
    "phoneNumber": "admin",
    "password": "admin123"
}

Expected:
- Status: 200
- Response: Login success với admin token

Post-test Script:
pm.environment.set("ADMIN_TOKEN", pm.response.json().token);
```

### 5.2. Clerk User Management

#### Test Case 3: Clerk User Sync (Patient)
```
POST {{BASE_URL}}/api/auth/clerk-sync
Content-Type: application/json

{
    "clerkUserId": "user_2abc123def456",
    "email": "patient@example.com",
    "firstName": "Nguyen",
    "lastName": "Van A",
    "phoneNumber": "0123456789",
    "imageUrl": "https://img.clerk.com/user123.jpg"
}

Expected:
- Status: 200
- Response: Synced user details với role PATIENT tự động
```

#### Test Case 4: Clerk User Sync (Update Existing)
```
POST {{BASE_URL}}/api/auth/clerk-sync
Content-Type: application/json

{
    "clerkUserId": "user_2abc123def456",
    "email": "patient.updated@example.com",
    "firstName": "Nguyen",
    "lastName": "Van A Updated",
    "phoneNumber": "0123456780",
    "imageUrl": "https://img.clerk.com/user123_new.jpg"
}

Expected:
- Status: 200
- Response: Updated user info, isNewUser: false
```

### 5.3. Admin User Management

#### Test Case 5: Tạo Doctor User
```
POST {{BASE_URL}}/api/auth/create-user
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
    "phoneNumber": "doctor001",
    "password": "doctor123",
    "fullName": "Dr. Tran Van B",
    "email": "doctor001@luanvan.com",
    "role": "DOCTOR"
}

Expected:
- Status: 200
- Response: Created doctor user details
```

#### Test Case 6: Lấy Thông Tin User Hiện Tại
```
GET {{BASE_URL}}/api/users/me
Authorization: Bearer {{ADMIN_TOKEN}}

Expected:
- Status: 200
- Response: Current admin user details
```

### 5.4. Clinic & Specialty Management

#### Test Case 7: Tạo Phòng Khám
```
POST {{BASE_URL}}/api/clinics
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
    "name": "Phòng Khám Đa Khoa ABC",
    "address": "123 Nguyễn Văn Linh, Q7, TP.HCM",
    "phoneNumber": "0281234567",
    "email": "contact@phongkhamabc.com",
    "description": "Phòng khám đa khoa hiện đại",
    "workingHours": "Thứ 2 - Thứ 7: 8:00 - 20:00"
}

Expected:
- Status: 201
- Response: Created clinic details
```

#### Test Case 8: Tạo Chuyên Khoa
```
POST {{BASE_URL}}/api/specialties
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
    "name": "Tim mạch",
    "description": "Chuyên khoa điều trị các bệnh về tim mạch",
    "clinicId": 1
}

Expected:
- Status: 201
- Response: Created specialty
```

### 5.5. Doctor Profile Management

#### Test Case 9: Tạo Doctor Profile
```
POST {{BASE_URL}}/api/doctors/user/2
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
    "bio": "Bác sĩ chuyên khoa Tim mạch với 10 năm kinh nghiệm",
    "yearsOfExperience": 10,
    "profilePictureURL": "doctor1.jpg"
}

Expected:
- Status: 201
- Response: Created doctor profile
```

#### Test Case 10: Gán Chuyên Khoa cho Doctor
```
POST {{BASE_URL}}/api/doctors/1/specialties/1
Authorization: Bearer {{ADMIN_TOKEN}}

Expected:
- Status: 200
- Response: Assigned specialty to doctor
```

### 5.6. Availability Management

#### Test Case 11: Tạo Ca Làm Việc
```
POST {{BASE_URL}}/api/availability/shifts
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
    "shiftName": "Ca sáng",
    "dayOfWeek": "MONDAY",
    "startTime": "08:00",
    "endTime": "12:00",
    "clinicId": 1,
    "isDefault": true
}

Expected:
- Status: 201
- Response: Created shift
```

#### Test Case 12: Tạo Khung Giờ Khả Dụng
```
POST {{BASE_URL}}/api/availability/slots
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
    "doctorId": 1,
    "date": "2024-12-25",
    "startTime": "09:00",
    "endTime": "09:30",
    "clinicId": 1
}

Expected:
- Status: 201
- Response: Created availability slot
```

### 5.7. Patient Booking (Via Clerk User)

#### Test Case 13: Cập Nhật Thông Tin Liên Hệ (Patient)
```
PUT {{BASE_URL}}/api/users/contact-info
Authorization: Bearer {{PATIENT_TOKEN}}
Content-Type: application/json

{
    "phoneNumber": "0123456789",
    "email": "patient@example.com",
    "fullName": "Nguyen Van A"
}

Expected:
- Status: 200
- Response: Updated contact info
```

#### Test Case 14: Đặt Lịch Hẹn
```
POST {{BASE_URL}}/api/appointments
Authorization: Bearer {{PATIENT_TOKEN}}
Content-Type: application/json

{
    "doctorId": 1,
    "slotId": 1,
    "specialtyId": 1,
    "clinicId": 1,
    "reasonForVisit": "Khám sức khỏe định kỳ"
}

Expected:
- Status: 201
- Response: Created appointment with payment info
```

### 5.8. Payment Processing

#### Test Case 15: Tạo Thanh Toán
```
POST {{BASE_URL}}/api/payments/create
Authorization: Bearer {{PATIENT_TOKEN}}
Content-Type: application/json

{
    "appointmentId": 1,
    "paymentMethod": "MOMO",
    "returnUrl": "http://localhost:5173/payment/return",
    "notifyUrl": "http://localhost:9090/api/payments/momo/notify"
}

Expected:
- Status: 200
- Response: Payment details với payUrl, deeplink, qrCodeUrl
```

## 6. Error Testing

### 6.1. Clerk Sync Errors
```
// Missing required fields
POST {{BASE_URL}}/api/auth/clerk-sync
{
    "clerkUserId": "user_123"
    // Missing email, firstName, lastName
}

Expected: 400 - Validation errors
```

### 6.2. Authorization Errors
```
// Patient trying to access admin endpoint
POST {{BASE_URL}}/api/auth/create-user
Authorization: Bearer {{PATIENT_TOKEN}}

Expected: 403 - Forbidden
```

### 6.3. Booking Errors
```
// Booking without contact info
POST {{BASE_URL}}/api/appointments
Authorization: Bearer {{PATIENT_TOKEN}}
// Patient chưa cập nhật phoneNumber/email

Expected: 400 - Missing contact information
```

## 7. Sample Environment Variables

```json
{
    "BASE_URL": "http://localhost:9090",
    "ADMIN_TOKEN": "eyJhbGciOiJIUzI1NiJ9...",
    "PATIENT_TOKEN": "clerk_session_token",
    "CLERK_USER_ID": "user_2abc123def456",
    "ADMIN_PHONE": "admin",
    "ADMIN_PASSWORD": "admin123"
}
```

## 8. Performance & Load Testing

### 8.1. Clerk Sync Performance
- Test concurrent clerk-sync requests
- Verify no duplicate user creation
- Check response time < 200ms

### 8.2. Booking Load Test
- Multiple patients booking same slot
- Verify slot availability locking
- Check appointment conflict prevention

## 9. Integration Testing với Clerk

### 9.1. Webhook Testing (Future)
```
POST {{BASE_URL}}/api/webhooks/clerk/user-created
Content-Type: application/json
Clerk-Webhook-Signature: {{signature}}

{
    "type": "user.created",
    "data": {
        "id": "user_123",
        "email_addresses": [...],
        "first_name": "John",
        "last_name": "Doe"
    }
}
```

### 9.2. Session Validation
- Verify Clerk session tokens
- Check session expiration handling
- Test session refresh scenarios

**Lưu ý:** Hệ thống sử dụng hybrid authentication:
- **Patients:** Clerk authentication (frontend quản lý session)  
- **Admin/Doctor:** Traditional JWT authentication (backend issued tokens)

## 10. Test Report Template

### Test Summary
- Total APIs: 120+
- Tested: [number]
- Passed: [number]
- Failed: [number]
- Skipped: [number]

### Issues Found
1. Issue #1: Description, Severity, Status
2. Issue #2: Description, Severity, Status

### Performance Metrics
- Average Response Time: [ms]
- Max Response Time: [ms]
- Error Rate: [%]

### Recommendations
1. Optimization needed for...
2. Security improvement for...
3. Additional validation for... 