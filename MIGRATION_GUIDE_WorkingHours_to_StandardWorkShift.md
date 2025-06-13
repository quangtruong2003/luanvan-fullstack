# Migration Guide: WorkingHours to StandardWorkShift

## Tổng quan
Hướng dẫn này giúp bạn chuyển đổi dữ liệu từ trường `workingHours` cũ sang hệ thống `StandardWorkShift` mới.

## Trước khi Migration

### 1. Backup dữ liệu
```sql
-- Backup bảng clinics
CREATE TABLE clinics_backup AS SELECT * FROM clinics;

-- Backup dữ liệu workingHours
SELECT clinic_id, name, working_hours 
FROM clinics 
WHERE working_hours IS NOT NULL;
```

### 2. Kiểm tra dữ liệu hiện có
```sql
-- Xem các pattern workingHours thường gặp
SELECT working_hours, COUNT(*) as count 
FROM clinics 
WHERE working_hours IS NOT NULL 
GROUP BY working_hours 
ORDER BY count DESC;
```

## Quy trình Migration

### Bước 1: Phân tích workingHours hiện có
Các format phổ biến:
- "T2-T7: 8:00-17:00"
- "Thứ 2-6: 8:00-20:00, T7: 8:00-12:00"
- "8:00-17:00 (T2-T6)"

### Bước 2: Tạo StandardWorkShift tương ứng

Ví dụ với workingHours = "T2-T7: 8:00-17:00":

```sql
-- Tạo ca làm việc cho T2-T7
INSERT INTO standard_work_shifts (shift_name, day_of_week, start_time, end_time, clinic_id, is_default)
VALUES 
    ('Ca chính', 'MONDAY', '08:00:00', '17:00:00', 1, true),
    ('Ca chính', 'TUESDAY', '08:00:00', '17:00:00', 1, true),
    ('Ca chính', 'WEDNESDAY', '08:00:00', '17:00:00', 1, true),
    ('Ca chính', 'THURSDAY', '08:00:00', '17:00:00', 1, true),
    ('Ca chính', 'FRIDAY', '08:00:00', '17:00:00', 1, true),
    ('Ca chính', 'SATURDAY', '08:00:00', '17:00:00', 1, true),
    ('Ca chính', 'SUNDAY', '08:00:00', '17:00:00', 1, true);
```

### Bước 3: Script tự động (Java)

```java
@Component
public class WorkingHoursMigrationService {
    
    @Autowired
    private ClinicRepository clinicRepository;
    
    @Autowired
    private StandardWorkShiftRepository standardWorkShiftRepository;
    
    public void migrateWorkingHours() {
        List<Clinic> clinics = clinicRepository.findAll();
        
        for (Clinic clinic : clinics) {
            if (clinic.getWorkingHours() != null && !clinic.getWorkingHours().isEmpty()) {
                createStandardWorkShiftsFromWorkingHours(clinic);
            }
        }
    }
    
    private void createStandardWorkShiftsFromWorkingHours(Clinic clinic) {
        String workingHours = clinic.getWorkingHours();
        
        // Phân tích workingHours và tạo StandardWorkShift
        // Implementation tùy thuộc vào format cụ thể
        
        // Ví dụ đơn giản cho format "8:00-17:00"
        if (workingHours.matches("\\d{1,2}:\\d{2}-\\d{1,2}:\\d{2}")) {
            String[] times = workingHours.split("-");
            String startTime = times[0] + ":00";
            String endTime = times[1] + ":00";
            
            // Tạo cho T2-T6
            for (String day : Arrays.asList("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY")) {
                StandardWorkShift shift = new StandardWorkShift();
                shift.setShiftName("Ca chính");
                shift.setDayOfWeek(DayOfWeek.valueOf(day));
                shift.setStartTime(LocalTime.parse(startTime));
                shift.setEndTime(LocalTime.parse(endTime));
                shift.setClinic(clinic);
                shift.setIsDefault(true);
                
                standardWorkShiftRepository.save(shift);
            }
        }
    }
}
```

## Sau Migration

### 1. Kiểm tra dữ liệu
```sql
-- Kiểm tra StandardWorkShift đã được tạo
SELECT c.name, sws.shift_name, sws.day_of_week, sws.start_time, sws.end_time, sws.is_default
FROM clinics c
JOIN standard_work_shifts sws ON c.clinic_id = sws.clinic_id
ORDER BY c.name, sws.day_of_week;
```

### 2. Verify trong UI
- Kiểm tra ClinicManagement: Mở rộng mỗi phòng khám để xem ca làm việc
- Kiểm tra StandardWorkShiftManagement: Xem tổng quan tất cả ca làm việc

### 3. Dọn dẹp (Tùy chọn)
```sql
-- Sau khi confirm migration thành công, có thể xóa workingHours
-- CẢNH BÁO: Chỉ thực hiện khi đã chắc chắn
-- UPDATE clinics SET working_hours = NULL;
```

## Rollback (Nếu cần)

```sql
-- Xóa StandardWorkShift đã tạo
DELETE FROM standard_work_shifts WHERE created_date >= '2024-01-01';

-- Restore từ backup
-- Thực hiện nếu cần thiết
```

## Lưu ý quan trọng

1. **Backward Compatibility**: Trường `workingHours` vẫn được giữ lại và đánh dấu `@Deprecated`
2. **Gradual Migration**: Có thể migration từng phần, không cần làm tất cả cùng lúc
3. **Data Validation**: Luôn validate dữ liệu sau migration
4. **User Training**: Hướng dẫn user sử dụng giao diện mới

## Tài liệu tham khảo
- [README_StandardWorkShift_API.md](./README_StandardWorkShift_API.md)
- Standard Work Shift Entity Documentation 