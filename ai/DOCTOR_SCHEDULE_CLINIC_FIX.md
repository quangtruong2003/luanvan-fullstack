# Sửa lỗi Lịch làm việc và Hiển thị Clinic cho Doctor

## 🎯 Vấn đề được giải quyết

### 1. **Lịch làm việc không nhận được clinic**
- **Nguyên nhân**: API `getMyStandardWorkShifts` chưa được implement
- **Giải pháp**: Thêm endpoint `/my-clinics` trong `StandardWorkShiftController`

### 2. **Hồ sơ bác sĩ không hiển thị tên phòng khám**
- **Nguyên nhân**: `DoctorResponseDTO.SpecialtyResponseDTO` không có thông tin clinic
- **Giải pháp**: Thêm `ClinicDTO` vào `SpecialtyResponseDTO` và cập nhật mapping logic

## 🔧 Thay đổi Backend

### 1. **DoctorResponseDTO.java**
```java
// Thêm ClinicDTO vào SpecialtyResponseDTO
public static class SpecialtyResponseDTO {
    private Long specialtyId;
    private String name;
    private String description;
    private boolean isPrimary;
    private ClinicDTO clinic; // ✅ THÊM MỚI
}

// Thêm ClinicDTO class
public static class ClinicDTO {
    private Long clinicId;
    private String name;
    private String address;
    private String phoneNumber;
    private String email;
    private String workingHours;
}
```

### 2. **DoctorServiceImpl.java**
```java
// Cập nhật convertToResponseDTO để include clinic info
private DoctorResponseDTO convertToResponseDTO(Doctor doctor) {
    // ...
    List<DoctorResponseDTO.SpecialtyResponseDTO> specialtyDTOs = doctorSpecialties.stream()
        .map(ds -> {
            // Create clinic DTO if clinic exists
            DoctorResponseDTO.ClinicDTO clinicDTO = null;
            if (ds.getSpecialty().getClinic() != null) {
                clinicDTO = new DoctorResponseDTO.ClinicDTO(
                    ds.getSpecialty().getClinic().getClinicId(),
                    ds.getSpecialty().getClinic().getName(),
                    ds.getSpecialty().getClinic().getAddress(),
                    ds.getSpecialty().getClinic().getPhoneNumber(),
                    ds.getSpecialty().getClinic().getEmail(),
                    ds.getSpecialty().getClinic().getWorkingHours()
                );
            }
            
            return new DoctorResponseDTO.SpecialtyResponseDTO(
                ds.getSpecialty().getSpecialtyId(),
                ds.getSpecialty().getName(),
                ds.getSpecialty().getDescription(),
                ds.isPrimary(),
                clinicDTO // ✅ INCLUDE CLINIC
            );
        })
        .collect(Collectors.toList());
    // ...
}
```

### 3. **StandardWorkShiftController.java**
```java
// Thêm endpoint mới cho doctor
@GetMapping("/my-clinics")
@PreAuthorize("hasRole('DOCTOR')")
public ResponseEntity<List<StandardWorkShift>> getMyStandardWorkShifts(Authentication authentication) {
    try {
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        Doctor doctor = doctorService.getDoctorByUserId(user.getUserId());
        
        // Get all clinic IDs from doctor's specialties
        List<Long> clinicIds = doctor.getSpecialties().stream()
                .map(DoctorSpecialty::getSpecialty)
                .map(Specialty::getClinic)
                .filter(clinic -> clinic != null)
                .map(clinic -> clinic.getClinicId())
                .distinct()
                .collect(Collectors.toList());
        
        // Get work shifts for all clinics
        List<StandardWorkShift> allShifts = clinicIds.stream()
                .flatMap(clinicId -> standardWorkShiftService.getShiftsByClinic(clinicId).stream())
                .distinct()
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(allShifts);
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
```

## 🎨 Thay đổi Frontend

### 1. **DoctorProfileManagement.jsx**
```jsx
// Handle multiple data structures from backend
{doctor.specialties.map(specialty => {
  const specialtyId = specialty.specialtyId || specialty.specialty_id;
  const specialtyName = specialty.specialtyName || specialty.name || specialty.specialty?.name || 'Chưa có tên';
  const clinicName = specialty.clinic?.clinicName || specialty.clinic?.name || specialty.clinicName || 'Chưa có phòng khám';
  const clinicAddress = specialty.clinic?.address || specialty.clinic?.clinic_address || '';
  const description = specialty.description || specialty.specialty?.description || '';
  
  return (
    <div key={specialtyId} className="p-4 border border-gray-200 rounded-lg bg-blue-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Stethoscope className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <h5 className="font-medium text-gray-900">{specialtyName}</h5>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {clinicName}
            </p>
            {clinicAddress && (
              <p className="text-xs text-gray-500 mt-1 ml-4">
                {clinicAddress}
              </p>
            )}
          </div>
        </div>
      </div>
      {description && (
        <p className="text-sm text-gray-600 mt-2">{description}</p>
      )}
    </div>
  );
})}
```

### 2. **SpecialtyTabBar.jsx**
```jsx
// Handle multiple data formats for specialty and clinic names
const specialtyName = specialty.specialtyName || specialty.name || specialty.specialty?.name || 'Chưa có tên';
const clinicName = specialty.clinic?.clinicName || specialty.clinic?.name || specialty.clinicName || 'Chưa có phòng khám';
const clinicAddress = specialty.clinic?.address || specialty.clinic?.clinic_address || '';
```

### 3. **AutoGenerationPanel.jsx**
```jsx
// Handle different clinic ID field names
const clinicId = currentSpecialty.clinic?.clinicId || 
                currentSpecialty.clinic?.clinic_id || 
                currentSpecialty.clinicId || 
                currentSpecialty.clinic_id;

if (!clinicId) {
  alert('Chuyên khoa này chưa được phân công phòng khám. Vui lòng liên hệ admin.');
  return;
}
```

### 4. **WeeklyCalendarView.jsx**
```jsx
// Handle multiple data formats in header display
<p className="text-blue-100">
  {currentSpecialty ? 
    `${currentSpecialty.specialtyName || currentSpecialty.name || 'Chưa có tên'} - ${currentSpecialty.clinic?.clinicName || currentSpecialty.clinic?.name || currentSpecialty.clinicName || 'Chưa có phòng khám'}` : 
    'Chọn chuyên khoa để xem lịch'}
</p>
```

## ✅ Kết quả

### 1. **Lịch làm việc hoạt động**
- ✅ Doctor có thể lấy work shifts từ tất cả clinic được phân công
- ✅ Auto-generation panel hiển thị clinic information
- ✅ Slot generation hoạt động với clinic ID đúng

### 2. **Hồ sơ bác sĩ hiển thị đầy đủ**
- ✅ Tên chuyên khoa hiển thị chính xác
- ✅ Tên phòng khám hiển thị đầy đủ
- ✅ Địa chỉ phòng khám hiển thị (nếu có)
- ✅ Handle multiple data formats từ backend

### 3. **Tương thích dữ liệu**
- ✅ Support cả snake_case và camelCase
- ✅ Fallback values cho missing fields
- ✅ Graceful handling khi clinic info không có

## 🧪 Test Cases

### 1. **Single Specialty Doctor**
- Hiển thị specialty name + clinic name
- Auto-generation hoạt động với clinic của specialty đó

### 2. **Multi-Specialty Doctor**
- Tab bar hiển thị tất cả specialties với clinic names
- Conflict resolution hoạt động giữa các specialties
- Work shifts từ tất cả clinics được load

### 3. **Edge Cases**
- Doctor chưa có specialty: hiển thị message thích hợp
- Specialty chưa có clinic: hiển thị warning và disable generation
- Missing data fields: fallback values hiển thị

## 🎯 API Endpoints

### Mới thêm:
- `GET /api/standard-work-shifts/my-clinics` - Lấy work shifts cho doctor

### Cập nhật:
- `GET /api/doctors/user/{userId}` - Bây giờ trả về clinic info trong specialties

## 📋 Checklist Hoàn thành

- [x] Backend: Thêm ClinicDTO vào DoctorResponseDTO
- [x] Backend: Cập nhật mapping logic include clinic
- [x] Backend: Thêm endpoint getMyStandardWorkShifts
- [x] Frontend: Sửa DoctorProfileManagement hiển thị clinic
- [x] Frontend: Sửa SpecialtyTabBar handle data formats
- [x] Frontend: Sửa AutoGenerationPanel clinic ID handling
- [x] Frontend: Sửa WeeklyCalendarView display logic
- [x] Test: Verify single specialty doctor workflow
- [x] Test: Verify multi-specialty doctor workflow
- [x] Documentation: Tạo summary file

## 🚀 Sẵn sàng sử dụng

Hệ thống lịch làm việc bác sĩ đã được sửa lỗi và hoạt động đầy đủ:
- ✅ Hiển thị chuyên khoa + phòng khám chính xác
- ✅ Tự động tạo lịch dựa trên ca làm việc phòng khám
- ✅ Xử lý conflict giữa specialties
- ✅ UI/UX professional và responsive 