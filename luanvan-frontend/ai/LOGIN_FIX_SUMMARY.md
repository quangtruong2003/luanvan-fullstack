# 🔧 **FIX LỖI LOGIN - FRONTEND TO BACKEND MISMATCH**

## 📋 **Vấn đề đã xác định**

### **Root Cause**: 
Frontend gửi field `"phoneNumber"` nhưng Backend chỉ chấp nhận `"email"` trong LoginRequest

### **Error Log**:
```
JSON parse error: Unrecognized field "phoneNumber" (class com.luanvan.luanvanbackend.request.LoginRequest), not marked as ignorable (2 known properties: "password", "email"])
```

---

## ✅ **Các thay đổi đã thực hiện**

### **1. Frontend Login.jsx** 
- **Thay đổi**: `phoneNumber` → `email`
- **UI Updates**:
  - Label: "Tài khoản" → "Email"
  - Input type: `text` → `email`
  - Placeholder: "Nhập 'admin' hoặc 'doctor'" → "Nhập email (vd: admin@luanvan.com)"

### **2. Sample Account Info Updated**
- **Admin**: Email `admin@luanvan.com`, Mật khẩu `admin123`
- **Doctor**: Email `doctor001@luanvan.com`, Mật khẩu `doctor123`

### **3. Backend Compatibility**
- ✅ Backend LoginRequest chỉ chấp nhận `email` + `password`
- ✅ Database có sẵn accounts với emails tương ứng

---

## 🚀 **Test Instructions**

### **Step 1: Tạo Admin Account (BẮT BUỘC)**
```bash
# Chạy command này để tạo admin đầu tiên
curl -X POST http://localhost:9090/api/auth/create-first-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@luanvan.com","password":"admin123","fullName":"System Administrator"}'
```

### **Step 2: Test Frontend Login**
1. **Start Frontend**: `cd luanvan-frontend && npm run dev`
2. **Navigate**: `http://localhost:3000/login`
3. **Test Admin Login**:
   - Email: `admin@luanvan.com`
   - Password: `admin123`
   - Expected: Redirect to `/admin/dashboard`

4. **Test Doctor Login**:
   - Email: `doctor001@luanvan.com`
   - Password: `doctor123`
   - Expected: Redirect to `/doctor/dashboard`

### **Step 3: API Test (Optional)**
```bash
# Test Admin Login via API
curl -X POST http://localhost:9090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@luanvan.com","password":"admin123"}'

# Test Doctor Login via API  
curl -X POST http://localhost:9090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor001@luanvan.com","password":"doctor123"}'
```

---

## 🎯 **Expected Results**

### **Admin Login Success**:
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userInfo": {
    "userId": 1,
    "fullName": "System Administrator",
    "email": "admin@luanvan.com",
    "role": "ADMIN"
  }
}
```

### **Doctor Login Success**:
```json
{
  "success": true,
  "message": "Đăng nhập thành công", 
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userInfo": {
    "userId": 3,
    "fullName": "BS. Nguyễn Văn A",
    "email": "doctor001@luanvan.com",
    "role": "DOCTOR"
  }
}
```

---

## 🔍 **Debug Notes**

### **Nếu vẫn lỗi**:
1. ✅ Check backend logs: `tail -f luanvan-backend/logs/application.log`
2. ✅ Verify database: Confirm admin account exists với email `admin@luanvan.com`
3. ✅ Network check: Browser DevTools → Network tab
4. ✅ CORS: Backend CORS config cho `http://localhost:3000`

### **Nếu 401 Unauthorized**:
- Check password: Admin account có tồn tại với đúng password `admin123`?
- Check API endpoint: `/api/auth/login` đang hoạt động?

### **Nếu 404 Not Found**:
- Backend đang chạy trên port `9090`?
- Frontend API base URL đúng `http://localhost:9090/api`?

---

## 📝 **Files Changed**

1. ✅ `luanvan-frontend/src/pages/Login.jsx`
   - phoneNumber → email
   - UI text updates
   - Sample account info

2. ✅ `luanvan-frontend/ai/LOGIN_FIX_SUMMARY.md` (this file)

---

## 🎉 **Status**

- **Frontend**: ✅ FIXED - Gửi đúng email field
- **Backend**: ✅ COMPATIBLE - Chấp nhận email login
- **Database**: ✅ READY - Sample accounts có sẵn
- **Testing**: 🔄 PENDING - Cần run test cases

**Next**: Test login workflow và confirm fix hoạt động properly 