# Hướng Dẫn Test API với Postman (Hybrid Authentication)

## 1. Chuẩn Bị

### 1.1. Import Collection
1. Tạo một collection mới trong Postman tên là "Luận Văn API - Hybrid Auth"
2. Thêm biến môi trường:
   - `BASE_URL`: http://localhost:9090
   - `CLERK_USER_ID`: (clerk user ID để test)
   - `ADMIN_EMAIL`: admin@luanvan.com
   - `ADMIN_PASSWORD`: admin123
   - `DOCTOR_EMAIL`: doctor001@luanvan.com
   - `DOCTOR_PASSWORD`: doctor123

## 2. Authentication Flow

### 2.1. System Initialization

#### Test Case 1: Tạo Admin Đầu Tiên (BẮT BUỘC CHẠY TRƯỚC)
```
POST {{BASE_URL}}/api/auth/create-first-admin
Content-Type: application/json

{
    "email": "admin@luanvan.com",
    "password": "admin123",
    "fullName": "System Administrator"
}

Expected:
- Status: 200
- Response: {"success": true, "message": "Tạo tài khoản ADMIN đầu tiên thành công", ...}
- Note: PHẢI chạy test case này TRƯỚC KHI test các API khác
```

#### Test Case 2: Admin Login (Email-based)
```
POST {{BASE_URL}}/api/auth/login
Content-Type: application/json

{
    "email": "admin@luanvan.com",
    "password": "admin123"
}

Post-test Script:
pm.environment.set("ADMIN_TOKEN", pm.response.json().token);
```

#### Test Case 3: Doctor Login (Email-based)
```
POST {{BASE_URL}}/api/auth/login
Content-Type: application/json

{
    "email": "doctor001@luanvan.com", 
    "password": "doctor123"
}

Post-test Script:
pm.environment.set("DOCTOR_TOKEN", pm.response.json().token);
```

### 2.2. Clerk User Sync (Patient)

#### Test Case 4: Sync Patient từ Clerk
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

## 3. Hybrid Authentication System

### **Admin & Doctor:**
- ✅ Đăng nhập bằng **EMAIL** + password
- ✅ Traditional JWT authentication
- ✅ Backend session management
- ✅ Role-based access control

### **Patient:**
- ✅ Đăng nhập bằng **Clerk** (frontend)
- ✅ Sync với backend qua `/api/auth/clerk-sync`
- ✅ Hybrid session management

## 4. Sample Accounts

### Admin Account:
- **Email**: admin@luanvan.com
- **Password**: admin123
- **Role**: ADMIN

### Doctor Accounts:
1. **Email**: doctor001@luanvan.com, **Password**: doctor123, **Role**: DOCTOR
2. **Email**: doctor1@luanvan.com, **Password**: doctor123, **Role**: DOCTOR  
3. **Email**: bs_tim_mach@luanvan.com, **Password**: doctor123, **Role**: DOCTOR

### Patient Account (for traditional login testing):
- **Phone**: 0123456789
- **Password**: patient123
- **Role**: PATIENT

## 5. Test Cases Chi Tiết

### 5.1. Admin Management

#### Test Case 5: Tạo Doctor User
```
POST {{BASE_URL}}/api/auth/create-user
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
    "email": "newdoctor@luanvan.com",
    "password": "doctor123",
    "fullName": "Dr. New Doctor",
    "phoneNumber": "0987654999",
    "role": "DOCTOR"
}

Expected:
- Status: 200
- Response: Created doctor user details
```

#### Test Case 6: Email Validation Test
```
POST {{BASE_URL}}/api/auth/login
Content-Type: application/json

{
    "email": "invalid-email",
    "password": "admin123"
}

Expected:
- Status: 400
- Response: Email validation error
```

### 5.2. Role-based Login Restrictions

#### Test Case 7: Patient tries Email Login (Should Fail)
```
POST {{BASE_URL}}/api/auth/login
Content-Type: application/json

{
    "email": "patient001@example.com", 
    "password": "patient123"
}

Expected:
- Status: 200 but with error message
- Response: "Chỉ Admin và Doctor được phép đăng nhập qua email"
```

### 5.3. Phone Number Validation

#### Test Case 8: Create User với Invalid Phone
```
POST {{BASE_URL}}/api/auth/create-user
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
    "email": "test@luanvan.com",
    "password": "test123",
    "fullName": "Test User",
    "phoneNumber": "123", // Invalid: too short
    "role": "DOCTOR"
}

Expected:
- Status: 400
- Response: Phone number validation error
```

### 5.4. Email Requirement for Admin/Doctor

#### Test Case 9: Create Doctor without Email (Should Fail)
```
POST {{BASE_URL}}/api/auth/create-user
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
    "password": "test123",
    "fullName": "Test Doctor",
    "phoneNumber": "0987654888",
    "role": "DOCTOR"
}

Expected:
- Status: 200 but with error message
- Response: "Email là bắt buộc cho tài khoản DOCTOR"
```

## 6. Error Testing

### 6.1. Authentication Errors
```
// Wrong email
POST {{BASE_URL}}/api/auth/login
{
    "email": "wrong@email.com",
    "password": "admin123"
}

Expected: 401 - Đăng nhập thất bại

// Wrong password
POST {{BASE_URL}}/api/auth/login
{
    "email": "admin@luanvan.com",
    "password": "wrongpassword"
}

Expected: 401 - Đăng nhập thất bại
```

### 6.2. Validation Errors
```
// Missing email
POST {{BASE_URL}}/api/auth/login
{
    "password": "admin123"
}

Expected: 400 - Email không được để trống

// Invalid email format
POST {{BASE_URL}}/api/auth/login
{
    "email": "not-an-email",
    "password": "admin123"
}

Expected: 400 - Email không hợp lệ
```

## 7. Sample Environment Variables

```json
{
    "BASE_URL": "http://localhost:9090",
    "ADMIN_TOKEN": "eyJhbGciOiJIUzI1NiJ9...",
    "DOCTOR_TOKEN": "eyJhbGciOiJIUzI1NiJ9...",
    "PATIENT_TOKEN": "clerk_session_token",
    "CLERK_USER_ID": "user_2abc123def456",
    "ADMIN_EMAIL": "admin@luanvan.com",
    "ADMIN_PASSWORD": "admin123",
    "DOCTOR_EMAIL": "doctor001@luanvan.com",
    "DOCTOR_PASSWORD": "doctor123"
}
```

## 8. Key Changes from Previous Version

### **OLD (Phone-based login):**
- Admin: `phoneNumber: "admin"`, `password: "123456"`
- Doctor: `phoneNumber: "doctor001"`, `password: "123456"`

### **NEW (Email-based login for Admin/Doctor):**
- Admin: `email: "admin@luanvan.com"`, `password: "admin123"`
- Doctor: `email: "doctor001@luanvan.com"`, `password: "doctor123"`

### **Patient (Unchanged):**
- Continues to use Clerk authentication
- Phone number still used for traditional fallback login

## 9. Benefits of New System

### 1. **Professional Authentication:**
- Admin và Doctor sử dụng email (professional standard)
- Patient sử dụng Clerk (modern UX)

### 2. **Better Validation:**
- Email format validation
- Phone number format validation (10-11 digits)
- Clear error messages in Vietnamese

### 3. **Improved Security:**
- Email-based authentication cho staff users
- Role-based login restrictions
- Hybrid authentication system

### 4. **Better UX:**
- Clear separation between staff và patient login flows
- Professional email-based login cho healthcare providers
- Modern Clerk authentication cho patients

---

**Lưu ý quan trọng:** 
- **Admin/Doctor**: Phải đăng nhập bằng email
- **Patient**: Sử dụng Clerk hoặc phone number fallback
- Phone number giờ đây là optional cho admin/doctor, bắt buộc cho patient

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