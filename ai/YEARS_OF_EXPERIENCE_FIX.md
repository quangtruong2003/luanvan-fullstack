# Years of Experience Display Fix - Tóm tắt

## 🐛 Vấn đề gặp phải
- Số năm kinh nghiệm hiển thị là 0 trong doctor profile management
- Sau khi update thành công vào database, UI vẫn hiển thị 0
- Backend trả về `years_of_experience` (snake_case) nhưng frontend expect `yearsOfExperience` (camelCase)

## 🔍 Nguyên nhân
1. **Field name mismatch**: Backend sử dụng `years_of_experience`, frontend expect `yearsOfExperience`
2. **Inconsistent normalization**: `_getDoctorInfo()` không normalize field `years_of_experience`
3. **Incomplete field mapping**: `getMyProfile()` chỉ check `yearsOfExperience` field

## 🔧 Các thay đổi đã thực hiện

### 1. Sửa DoctorProfileManagement.jsx
**File**: `src/pages/doctor/components/DoctorProfileManagement.jsx`

```diff
setFormData({
  bio: doctorProfile.bio || '',
- yearsOfExperience: doctorProfile.yearsOfExperience || 0,
+ yearsOfExperience: doctorProfile.years_of_experience || doctorProfile.yearsOfExperience || 0,
- fullName: doctorProfile.user?.fullName || '',
+ fullName: doctorProfile.user?.fullName || doctorProfile.user?.full_name || '',
- phoneNumber: doctorProfile.user?.phoneNumber || '',
+ phoneNumber: doctorProfile.user?.phoneNumber || doctorProfile.user?.phone_number || '',
  email: doctorProfile.user?.email || '',
  specialtyIds: doctorProfile.specialties?.map(s => s.specialtyId || s.specialty_id) || []
});
```

### 2. Cải thiện _getDoctorInfo() normalization
**File**: `src/services/api.js`

```diff
// Normalize the response to use camelCase for consistency
if (doctorInfo.doctor_id && !doctorInfo.doctorId) {
  doctorInfo.doctorId = doctorInfo.doctor_id;
}

+ // Normalize years_of_experience field
+ if (doctorInfo.years_of_experience !== undefined && doctorInfo.yearsOfExperience === undefined) {
+   doctorInfo.yearsOfExperience = doctorInfo.years_of_experience;
+ }

// Normalize user fields...
```

### 3. Cập nhật getMyProfile() method
**File**: `src/services/api.js`

```diff
return {
  doctorId: doctorInfo.doctorId,
  bio: doctorInfo.bio || '',
- yearsOfExperience: doctorInfo.yearsOfExperience || 0,
+ yearsOfExperience: doctorInfo.years_of_experience || doctorInfo.yearsOfExperience || 0,
+ years_of_experience: doctorInfo.years_of_experience || doctorInfo.yearsOfExperience || 0, // Include both formats
  specialties: doctorInfo.specialties || [],
  user: doctorInfo.user || {}
};
```

## ✅ Kết quả mong đợi

1. **Hiển thị chính xác**: Years of experience sẽ hiển thị đúng giá trị từ database
2. **Update thành công**: Sau khi update, UI sẽ refresh và hiển thị giá trị mới
3. **Consistency**: Đồng bộ với cách hiển thị của admin dashboard
4. **Backward compatibility**: Hỗ trợ cả snake_case và camelCase formats

## 🎯 Tương thích với Admin Dashboard

Admin dashboard sử dụng:
```javascript
doctor.years_of_experience || doctor.yearsOfExperience || 0
```

Doctor dashboard giờ đây cũng sử dụng pattern tương tự để đảm bảo consistency.

## 🧪 Cách test

1. Đăng nhập với tài khoản doctor
2. Vào tab "Hồ sơ" 
3. Kiểm tra years of experience hiển thị đúng
4. Chỉnh sửa và lưu
5. Xác nhận giá trị mới hiển thị chính xác sau khi lưu

## 📋 Checklist

- ✅ Fix field mapping trong DoctorProfileManagement
- ✅ Normalize years_of_experience trong _getDoctorInfo()
- ✅ Cập nhật getMyProfile() để hỗ trợ both formats
- ✅ Đảm bảo consistency với Admin dashboard
- ✅ Tạo documentation cho fix này 