# Debug Doctor Authentication Issues

## 🔍 Vấn đề hiện tại
- Doctor dashboard hiển thị màn hình trắng
- Báo lỗi xác thực người dùng
- Không tải được thông tin bác sĩ

## 🛠️ Các thay đổi đã thực hiện

### 1. Sửa DoctorProfileManagement.jsx
- ✅ Thay `apiService.getDoctors()` → `doctorService.getMyProfile()`
- ✅ Thêm xử lý lỗi authentication tốt hơn
- ✅ Auto redirect về login khi session hết hạn

### 2. Cải thiện doctorService.updateMyProfile()
- ✅ Tách riêng doctor data và user data
- ✅ Chỉ update những field thay đổi
- ✅ Clear cache sau khi update

### 3. Sửa DoctorDashboardNew.jsx
- ✅ Hỗ trợ cả `fullName` và `full_name` field

## 🔧 API Endpoints được sử dụng

### Doctor Profile Management:
```
GET /api/doctors/user/{userId}  ← _getDoctorInfo()
PUT /api/doctors/{doctorId}     ← Update doctor profile
PUT /api/users/{userId}         ← Update user profile
```

### Authentication Check:
```javascript
// Kiểm tra localStorage
const backendUserId = localStorage.getItem('backendUserId');
const token = localStorage.getItem('token');
const userRole = localStorage.getItem('userRole');
```

## 🚨 Các lỗi thường gặp

### 1. "Dữ liệu xác thực không hợp lệ"
**Nguyên nhân:**
- Token hết hạn
- backendUserId không tồn tại
- User không có role DOCTOR

**Giải pháp:**
- Clear localStorage và redirect về login
- Kiểm tra token validity

### 2. "Không tìm thấy thông tin bác sĩ"
**Nguyên nhân:**
- User có role DOCTOR nhưng chưa có doctor profile
- API endpoint `/doctors/user/{userId}` trả về 404

**Giải pháp:**
- Admin cần tạo doctor profile cho user
- Hiển thị message hướng dẫn user liên hệ admin

### 3. Màn hình trắng
**Nguyên nhân:**
- Component crash do missing data
- API call fail không được handle

**Giải pháp:**
- Thêm error boundary
- Loading states
- Fallback UI

## 🎯 Debugging Steps

### 1. Kiểm tra localStorage
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User ID:', localStorage.getItem('backendUserId'));
console.log('Role:', localStorage.getItem('userRole'));
```

### 2. Test API call
```javascript
// Test trong browser console
fetch('/api/doctors/user/' + localStorage.getItem('backendUserId'), {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### 3. Kiểm tra Network tab
- Xem API calls có được gửi không
- Status code trả về (401, 403, 404, 500)
- Response body có error message gì

## 🔄 Flow hoạt động đúng

1. **Login** → Lưu token, backendUserId, userRole vào localStorage
2. **Doctor Dashboard** → Gọi `doctorService.getMyProfile()`
3. **getMyProfile()** → Gọi `_getDoctorInfo()`
4. **_getDoctorInfo()** → API call `/doctors/user/{userId}`
5. **Success** → Cache data và return
6. **Error** → Handle auth error và redirect

## 📋 Checklist kiểm tra

- [ ] localStorage có đầy đủ: token, backendUserId, userRole
- [ ] Role = "DOCTOR"
- [ ] API `/doctors/user/{userId}` trả về 200
- [ ] Doctor profile tồn tại trong database
- [ ] Token chưa hết hạn
- [ ] Network không bị block CORS

## 🚀 Next Steps

1. Kiểm tra backend logs xem API call có đến server không
2. Verify JWT token validity
3. Kiểm tra database có doctor record cho user này không
4. Test với Postman để isolate frontend vs backend issue 