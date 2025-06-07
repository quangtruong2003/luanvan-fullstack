# Test Cases cho Doctor & Specialty APIs

## 🔧 Setup Environment Variables

```json
{
    "BASE_URL": "http://localhost:9090",
    "ADMIN_TOKEN": "{{admin_login_token}}",
    "DOCTOR_TOKEN": "{{doctor_login_token}}"
}
```

## 📋 Pre-requisites

### 1. Login Admin để lấy token
```
POST {{BASE_URL}}/api/auth/login
Content-Type: application/json

{
    "phoneNumber": "admin",
    "password": "123456"
}

Post-test Script:
pm.environment.set("ADMIN_TOKEN", pm.response.json().token);
```

### 2. Login Doctor để lấy token
```
POST {{BASE_URL}}/api/auth/login
Content-Type: application/json

{
    "phoneNumber": "doctor1",
    "password": "123456"
}

Post-test Script:
pm.environment.set("DOCTOR_TOKEN", pm.response.json().token);

Note: doctor1 tương ứng với doctor ID=3 (user_id=3) trong sample data
```

---

## 👨‍⚕️ DOCTOR API TESTS

### 1. Lấy Danh Sách Tất Cả Bác Sĩ (Public - No Auth Required)

#### Test Case 1.1: Lấy doctors có phân trang
```
GET {{BASE_URL}}/api/doctors?page=0&size=5

Expected:
- Status: 200
- Response: Paginated list of doctors
- Content: doctors array với thông tin cơ bản
- Note: Public endpoint, không cần token
```

#### Test Case 1.2: Lấy doctors không có phân trang parameters
```
GET {{BASE_URL}}/api/doctors

Expected:
- Status: 200
- Response: Default pagination (size=10)
```

### 2. Lấy Thông Tin Chi Tiết Bác Sĩ

#### Test Case 2.1: Lấy doctor theo ID hợp lệ
```
GET {{BASE_URL}}/api/doctors/2

Expected:
- Status: 200
- Response: Doctor details với specialties
- Fields: doctorId, bio, yearsOfExperience, profilePictureURL, user info
```

#### Test Case 2.2: Lấy doctor theo ID không tồn tại
```
GET {{BASE_URL}}/api/doctors/999

Expected:
- Status: 404 hoặc 500 (tùy implementation)
- Response: Error message "Không tìm thấy bác sĩ với ID: 999"
```

#### Test Case 2.3: Lấy doctor theo User ID
```
GET {{BASE_URL}}/api/doctors/user/2

Expected:
- Status: 200
- Response: Doctor details tương ứng với user ID 2
```

### 3. Tìm Kiếm Bác Sĩ

#### Test Case 3.1: Tìm kiếm theo tên hợp lệ
```
GET {{BASE_URL}}/api/doctors/search?name=Nguyễn&page=0&size=10

Expected:
- Status: 200
- Response: Doctors có tên chứa "Nguyễn"
```

#### Test Case 3.2: Tìm kiếm với tên không tồn tại
```
GET {{BASE_URL}}/api/doctors/search?name=XyzNotExist&page=0&size=10

Expected:
- Status: 200
- Response: Empty content array
```

#### Test Case 3.3: Tìm kiếm không có tham số name
```
GET {{BASE_URL}}/api/doctors/search?page=0&size=10

Expected:
- Status: 400
- Response: Missing required parameter 'name'
```

### 4. Lấy Bác Sĩ Theo Chuyên Khoa

#### Test Case 4.1: Lấy doctors theo specialty ID hợp lệ
```
GET {{BASE_URL}}/api/doctors/specialty/1?page=0&size=10

Expected:
- Status: 200
- Response: Doctors thuộc chuyên khoa "Tim mạch" (specialty_id=1)
```

#### Test Case 4.2: Lấy doctors theo specialty ID không tồn tại
```
GET {{BASE_URL}}/api/doctors/specialty/999?page=0&size=10

Expected:
- Status: 200
- Response: Empty content array
```

### 5. Lấy Bác Sĩ Theo Kinh Nghiệm

#### Test Case 5.1: Lấy doctors theo số năm kinh nghiệm
```
GET {{BASE_URL}}/api/doctors/experience/10?page=0&size=10

Expected:
- Status: 200
- Response: Doctors có ít nhất 10 năm kinh nghiệm
```

#### Test Case 5.2: Lấy doctors với kinh nghiệm = 0
```
GET {{BASE_URL}}/api/doctors/experience/0?page=0&size=10

Expected:
- Status: 200
- Response: Tất cả doctors (có ít nhất 0 năm kinh nghiệm)
```

### 6. Quản Lý Doctor Profile (Admin Required)

#### Test Case 6.1: Tạo doctor profile (Admin)
```
POST {{BASE_URL}}/api/doctors/user/6
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
    "bio": "Bác sĩ chuyên khoa Nhi với 8 năm kinh nghiệm",
    "years_of_experience": 8,
    "specialty_ids": [3],
    "primary_specialty_id": 3
}

Expected:
- Status: 201
- Response: Created doctor profile
- Note: Sử dụng snake_case cho JSON fields theo global Jackson config
```

#### Test Case 6.2: Tạo doctor profile không có quyền
```
POST {{BASE_URL}}/api/doctors/user/7
Content-Type: application/json

{
    "bio": "Test bio",
    "years_of_experience": 5,
    "specialty_ids": [1],
    "primary_specialty_id": 1
}

Expected:
- Status: 401
- Response: Unauthorized
```

#### Test Case 6.3: Tạo doctor profile với user đã có profile
```
POST {{BASE_URL}}/api/doctors/user/3
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
    "bio": "Test bio duplicate",
    "years_of_experience": 5,
    "specialty_ids": [1],
    "primary_specialty_id": 1
}

Expected:
- Status: 400 hoặc 409
- Response: "Đã tồn tại hồ sơ bác sĩ cho người dùng với ID: 3"
- Note: User ID 3 đã có doctor profile trong sample data
```

### 7. Cập Nhật Doctor Profile

#### Test Case 7.1: Cập nhật bởi Admin
```
PUT {{BASE_URL}}/api/doctors/3
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
    "bio": "Bác sĩ Tim mạch cập nhật profile với 16 năm kinh nghiệm",
    "years_of_experience": 16
}

Expected:
- Status: 200
- Response: Updated doctor info
- Note: DoctorUpdateDTO chỉ cần bio và years_of_experience
```

#### Test Case 7.2: Cập nhật profile bởi chính bác sĩ đó
```
PUT {{BASE_URL}}/api/doctors/3
Authorization: Bearer {{DOCTOR_TOKEN}}
Content-Type: application/json

{
    "bio": "Bác sĩ tự cập nhật profile của mình",
    "years_of_experience": 18
}

Expected:
- Status: 200 (nếu DOCTOR_TOKEN là của doctor ID 3)
- Status: 403 (nếu không phải doctor của mình)
- Response: Updated doctor info hoặc Forbidden
- Note: Test authorization - doctor chỉ có thể update profile của mình
```

### 8. Validation Tests

#### Test Case 8.0: Test JSON format validation
```
POST {{BASE_URL}}/api/doctors/user/8
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
    "bio": "Test camelCase format - should fail",
    "yearsOfExperience": 5,
    "specialtyIds": [1],
    "primarySpecialtyId": 1
}

Expected:
- Status: 400 hoặc 500
- Response: JSON parse error về unrecognized fields
- Error: "Unrecognized field 'yearsOfExperience'"
- Note: Verify backend reject camelCase, chỉ accept snake_case
```

### 9. Quản Lý Chuyên Khoa của Doctor

  #### Test Case 9.1: Gán chuyên khoa cho doctor (Admin)
```
POST {{BASE_URL}}/api/doctors/3/specialties/2?isPrimary=false
Authorization: Bearer {{ADMIN_TOKEN}}

Expected:
- Status: 200
- Response: "Đã gán chuyên khoa thành công"
- Note: Gán chuyên khoa "Nội khoa" (ID=2) cho doctor ID=3
```

#### Test Case 9.2: Gán chuyên khoa primary
```
POST {{BASE_URL}}/api/doctors/3/specialties/1?isPrimary=true
Authorization: Bearer {{ADMIN_TOKEN}}

Expected:
- Status: 200
- Response: "Đã gán chuyên khoa thành công"
- Note: Gán "Tim mạch" (ID=1) làm chuyên khoa chính, sẽ hủy primary cũ
```

#### Test Case 9.3: Xóa chuyên khoa khỏi doctor
```
DELETE {{BASE_URL}}/api/doctors/3/specialties/2
Authorization: Bearer {{ADMIN_TOKEN}}

Expected:
- Status: 200
- Response: "Đã xóa chuyên khoa thành công"
- Note: Xóa chuyên khoa "Nội khoa" khỏi doctor ID=3
```

#### Test Case 9.4: Lấy danh sách chuyên khoa của doctor
```
GET {{BASE_URL}}/api/doctors/3/specialties

Expected:
- Status: 200
- Response: Array of specialties với isPrimary flag
- Sample Response: 
  [
    {
      "specialtyId": 1,
      "name": "Tim mạch", 
      "description": "Chẩn đoán và điều trị bệnh lý tim mạch",
      "isPrimary": true
    }
  ]
```

---

## 🏥 SPECIALTY API TESTS

### 1. Lấy Danh Sách Chuyên Khoa (Public)

#### Test Case 1.1: Lấy specialties có phân trang
```
GET {{BASE_URL}}/api/specialties?page=0&size=5

Expected:
- Status: 200
- Response: Paginated specialties list
- Content: name, description, clinic info
```

#### Test Case 1.2: Lấy tất cả specialties không phân trang
```
GET {{BASE_URL}}/api/specialties/all

Expected:
- Status: 200
- Response: Full list of specialties
- Use case: Dropdown selection, quick reference
```

### 2. Lấy Chi Tiết Chuyên Khoa

#### Test Case 2.1: Lấy specialty theo ID hợp lệ
```
GET {{BASE_URL}}/api/specialties/1

Expected:
- Status: 200
- Response: Specialty details với clinic info
- Fields: specialtyId, name, description, clinic
```

#### Test Case 2.2: Lấy specialty theo ID không tồn tại
```
GET {{BASE_URL}}/api/specialties/999

Expected:
- Status: 404 hoặc 500
- Response: Error message "Không tìm thấy chuyên khoa"
```

### 3. Lấy Chuyên Khoa Theo Phòng Khám

#### Test Case 3.1: Lấy specialties theo clinic ID hợp lệ
```
GET {{BASE_URL}}/api/specialties/clinic/1

Expected:
- Status: 200
- Response: Specialties thuộc Phòng Khám ABC (clinic_id=1)
- Content: ["Tim mạch", "Nội khoa"]
```

#### Test Case 3.2: Lấy specialties theo clinic không có chuyên khoa
```
GET {{BASE_URL}}/api/specialties/clinic/999

Expected:
- Status: 200
- Response: Empty array []
```

### 4. Tìm Kiếm Chuyên Khoa

#### Test Case 4.1: Tìm kiếm theo tên hợp lệ
```
GET {{BASE_URL}}/api/specialties/search?name=Tim&page=0&size=10

Expected:
- Status: 200
- Response: Specialties có tên chứa "Tim"
- Content: ["Tim mạch", "Tim mạch nhi"]
```

#### Test Case 4.2: Tìm kiếm với tên không có kết quả
```
GET {{BASE_URL}}/api/specialties/search?name=NotExist&page=0&size=10

Expected:
- Status: 200
- Response: Empty content array
```

### 5. Quản Lý Chuyên Khoa (Admin Required)

#### Test Case 5.1: Tạo chuyên khoa mới (Admin)
```
POST {{BASE_URL}}/api/specialties
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
    "name": "Da liễu",
    "description": "Chẩn đoán và điều trị các bệnh về da",
    "clinic_id": 1
}

Expected:
- Status: 201
- Response: Created specialty với ID mới
- Note: Sử dụng snake_case (clinic_id) theo global Jackson config
```

#### Test Case 5.2: Tạo chuyên khoa không có quyền
```
POST {{BASE_URL}}/api/specialties
Content-Type: application/json

{
    "name": "Test Specialty",
    "description": "Test description",
    "clinicId": 1
}

Expected:
- Status: 401
- Response: Unauthorized
```

#### Test Case 5.3: Tạo chuyên khoa với dữ liệu không hợp lệ
```
POST {{BASE_URL}}/api/specialties
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
    "name": "",
    "description": "Invalid specialty",
    "clinic_id": 999
}

Expected:
- Status: 400
- Response: Validation errors
```

#### Test Case 5.4: Cập nhật chuyên khoa (Admin)
```
PUT {{BASE_URL}}/api/specialties/1
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
    "name": "Tim mạch Can thiệp",
    "description": "Chuyên khoa Tim mạch với kỹ thuật can thiệp hiện đại",
    "clinic_id": 1
}

Expected:
- Status: 200
- Response: Updated specialty information
```

#### Test Case 5.5: Xóa chuyên khoa (Admin)
```
DELETE {{BASE_URL}}/api/specialties/3
Authorization: Bearer {{ADMIN_TOKEN}}

Expected:
- Status: 200
- Response: "Đã xóa chuyên khoa thành công"
```

---

## 🔄 INTEGRATION TESTS

### 1. Doctor-Specialty Workflow

#### Workflow 1: Tạo Doctor và gán Specialties
```
1. POST /api/doctors/user/{userId} - Tạo doctor profile
2. POST /api/doctors/{doctorId}/specialties/{specialtyId} - Gán chuyên khoa primary
3. POST /api/doctors/{doctorId}/specialties/{specialtyId2} - Gán chuyên khoa secondary
4. GET /api/doctors/{doctorId}/specialties - Verify assignments
5. GET /api/doctors/specialty/{specialtyId} - Verify doctor appears in specialty
```

#### Workflow 2: Search và Filter
```
1. GET /api/specialties/clinic/1 - Lấy specialties của clinic
2. GET /api/doctors/specialty/1 - Lấy doctors của specialty
3. GET /api/doctors/search?name=Nguyễn - Tìm doctors theo tên
4. GET /api/doctors/experience/10 - Filter theo kinh nghiệm
```

### 2. Error Handling Tests

#### Test Case: Cascade Operations
```
1. Gán doctor vào specialty
2. Xóa specialty
3. Verify doctor specialty assignments
4. Check error handling
```

---

## 📊 PERFORMANCE TESTS

### 1. Load Test cho Public APIs
```
- GET /api/doctors (1000 requests/minute)
- GET /api/specialties/all (500 requests/minute)
- GET /api/doctors/specialty/{id} (300 requests/minute)
```

### 2. Pagination Performance
```
- Test với page size khác nhau: 5, 10, 20, 50
- Verify response time < 200ms
- Check memory usage với large datasets
```

---

## ✅ VALIDATION CHECKLIST

### Response Format Validation
- [ ] Tất cả APIs trả về consistent format
- [ ] Pagination APIs có totalElements, totalPages
- [ ] Error responses có message rõ ràng
- [ ] Nested objects được load đúng (avoid N+1 problem)

### Security Validation  
- [ ] Public GET APIs không require authentication (doctors, specialties, clinics)
- [ ] POST/PUT/DELETE APIs require proper authorization
- [ ] Admin-only APIs reject unauthorized access
- [ ] No sensitive data leaked in responses
- [ ] CORS headers configured properly

### Data Consistency
- [ ] Doctor profiles linked correctly với User
- [ ] Specialty assignments bi-directional
- [ ] Clinic relationships maintained
- [ ] Soft deletes handled properly

### Sample Test Data Verification
```
- Admin: admin/123456
- Doctors: doctor1/123456, doctor001/123456, bs_tim_mach/123456
- Patient: 0123456789/123456
- Clinics: 3 clinics with Vietnamese addresses
- Specialties: Tim mạch, Nội khoa, Nhi khoa
```

---

## 🚀 Execution Order

1. **Setup:** Login admin & doctor để lấy tokens
2. **Read Operations:** Test tất cả GET APIs  
3. **Admin Operations:** Test create/update/delete APIs
4. **Integration:** Test doctor-specialty workflows
5. **Edge Cases:** Test error scenarios
6. **Performance:** Load test public APIs
7. **Cleanup:** Xóa test data nếu cần

**Note:** Sử dụng sample data từ import.sql để test, hoặc tạo data mới qua APIs. 

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: ObjectOptimisticLockingFailureException khi tạo Doctor

**Lỗi gặp phải:**
```
org.springframework.orm.ObjectOptimisticLockingFailureException: Row was updated or deleted by another transaction (or unsaved-value mapping was incorrect): [com.luanvan.luanvanbackend.entities.Doctor#6]
```

**Nguyên nhân:**
- Entity `Doctor` sử dụng `@MapsId` annotation để map `doctorId` từ `User` entity
- Trong code cũ có manually set `doctorId` trước khi set `User`, gây conflict với Hibernate
- Hibernate nghĩ đây là detached entity và cố gắng merge thay vì persist

**Giải pháp đã áp dụng:**
```java
// TRước (SAI):
Doctor doctor = new Doctor();
doctor.setDoctorId(userId); // ❌ Gây conflict với @MapsId
doctor.setUser(user);

// SAU (ĐÚNG):
Doctor doctor = new Doctor();
// ✅ Không set doctorId, để @MapsId tự động lấy từ User
doctor.setUser(user);
```

**Test Case đã sửa:**
- Test Case 6.1: Tạo doctor profile (Admin) - Đã hoạt động bình thường
- Test Case 6.3: Tạo doctor profile với user đã có profile - Exception message rõ ràng hơn

**Bài học:**
- Khi sử dụng `@MapsId`, không được manually set ID field
- Luôn để Hibernate tự động quản lý ID mapping cho OneToOne relationships
- Kiểm tra entity mapping cẩn thận khi gặp OptimisticLockingFailureException

---

## 📝 CHANGELOG

### 2025-01-07
- **FIXED**: ObjectOptimisticLockingFailureException trong `DoctorServiceImpl.createDoctor()`
- **REASON**: Conflict giữa manual ID assignment và `@MapsId` annotation
- **SOLUTION**: Loại bỏ `doctor.setDoctorId(userId)` trong createDoctor method
- **FILES CHANGED**: 
  - `luanvan-backend/src/main/java/com/luanvan/luanvanbackend/services/impl/DoctorServiceImpl.java`
- **TEST STATUS**: ✅ Test Case 6.1 đã pass

- **FIXED**: PreAuthorize expression failure trong `DoctorController.updateDoctor()`
- **REASON**: Expression `@doctorService.getDoctorById(#doctorId).user.userId == authentication.principal.userId` throw exception khi doctor không tồn tại
- **SOLUTION**: 
  - Tạo `SecurityService` riêng biệt để xử lý authorization checks
  - Method `canUpdateDoctor(Long doctorId)` trả về false thay vì throw exception khi doctor không tồn tại
  - Cập nhật PreAuthorize expression thành `@securityService.canUpdateDoctor(#doctorId)`
  - SecurityService truy cập UserPrincipal trực tiếp từ SecurityContext
- **FILES CHANGED**: 
  - `luanvan-backend/src/main/java/com/luanvan/luanvanbackend/security/SecurityService.java` (NEW)
  - `luanvan-backend/src/main/java/com/luanvan/luanvanbackend/controllers/DoctorController.java`
- **TEST STATUS**: ✅ Test Case 7.2 sẽ hoạt động với doctor ID=3

- **FIXED**: JSON naming convention mismatch trong Specialty API tests
- **REASON**: Global Jackson config sử dụng snake_case nhưng test cases sử dụng camelCase
- **SOLUTION**: Cập nhật tất cả JSON trong specialty test cases từ "clinicId" thành "clinic_id"
- **FILES CHANGED**: 
  - `luanvan-backend/ai/DOCTOR_SPECIALTY_API_TESTS.md` (Test Cases 5.1, 5.3, 5.4)
- **TEST STATUS**: ✅ Specialty API tests sẽ hoạt động với snake_case JSON 