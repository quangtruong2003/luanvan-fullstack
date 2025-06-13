# StandardWorkShift API Documentation

API để quản lý ca làm việc tiêu chuẩn trong hệ thống phòng khám.

## Endpoints

### 1. Lấy danh sách ca làm việc (có phân trang)
**GET** `/api/standard-work-shifts`

**Query Parameters:**
- `page` (optional): Số trang (mặc định: 0)
- `size` (optional): Số lượng records mỗi trang (mặc định: 10)
- `sort` (optional): Trường sắp xếp (ví dụ: shiftName,asc)

**Response:**
```json
{
  "content": [
    {
      "shiftId": 1,
      "shiftName": "Ca sáng",
      "dayOfWeek": "MONDAY",
      "startTime": "08:00:00",
      "endTime": "12:00:00",
      "clinic": {...},
      "isDefault": true
    }
  ],
  "totalElements": 10,
  "totalPages": 1,
  "size": 10,
  "number": 0
}
```

### 2. Lấy tất cả ca làm việc (không phân trang)
**GET** `/api/standard-work-shifts/all`

**Response:**
```json
[
  {
    "shiftId": 1,
    "shiftName": "Ca sáng",
    "dayOfWeek": "MONDAY",
    "startTime": "08:00:00",
    "endTime": "12:00:00",
    "clinic": {...},
    "isDefault": true
  }
]
```

### 3. Lấy ca làm việc theo ID
**GET** `/api/standard-work-shifts/{shiftId}`

**Response:**
```json
{
  "shiftId": 1,
  "shiftName": "Ca sáng",
  "dayOfWeek": "MONDAY",
  "startTime": "08:00:00",
  "endTime": "12:00:00",
  "clinic": {...},
  "isDefault": true
}
```

### 4. Lấy ca làm việc theo phòng khám
**GET** `/api/standard-work-shifts/clinic/{clinicId}`

**Response:**
```json
[
  {
    "shiftId": 1,
    "shiftName": "Ca sáng",
    "dayOfWeek": "MONDAY",
    "startTime": "08:00:00",
    "endTime": "12:00:00",
    "clinic": {...},
    "isDefault": true
  }
]
```

### 5. Lấy ca làm việc theo ngày trong tuần
**GET** `/api/standard-work-shifts/day/{dayOfWeek}`

**Path Parameters:**
- `dayOfWeek`: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY

**Response:**
```json
[
  {
    "shiftId": 1,
    "shiftName": "Ca sáng",
    "dayOfWeek": "MONDAY",
    "startTime": "08:00:00",
    "endTime": "12:00:00",
    "clinic": {...},
    "isDefault": true
  }
]
```

### 6. Lấy ca làm việc mặc định
**GET** `/api/standard-work-shifts/default`

**Response:**
```json
[
  {
    "shiftId": 1,
    "shiftName": "Ca sáng",
    "dayOfWeek": "MONDAY",
    "startTime": "08:00:00",
    "endTime": "12:00:00",
    "clinic": {...},
    "isDefault": true
  }
]
```

### 7. Tạo ca làm việc mới (Admin only)
**POST** `/api/standard-work-shifts`

**Headers:**
- `Authorization`: Bearer token của Admin

**Request Body:**
```json
{
  "shiftName": "Ca sáng",
  "dayOfWeek": "MONDAY",
  "startTime": "08:00:00",
  "endTime": "12:00:00",
  "clinicId": 1,
  "isDefault": true
}
```

**Response:**
```json
{
  "shiftId": 1,
  "shiftName": "Ca sáng",
  "dayOfWeek": "MONDAY",
  "startTime": "08:00:00",
  "endTime": "12:00:00",
  "clinic": {...},
  "isDefault": true
}
```

### 8. Cập nhật ca làm việc (Admin only)
**PUT** `/api/standard-work-shifts/{shiftId}`

**Headers:**
- `Authorization`: Bearer token của Admin

**Request Body:**
```json
{
  "shiftName": "Ca sáng cập nhật",
  "dayOfWeek": "TUESDAY",
  "startTime": "07:30:00",
  "endTime": "11:30:00",
  "clinicId": 1,
  "isDefault": false
}
```

**Response:**
```json
{
  "shiftId": 1,
  "shiftName": "Ca sáng cập nhật",
  "dayOfWeek": "TUESDAY",
  "startTime": "07:30:00",
  "endTime": "11:30:00",
  "clinic": {...},
  "isDefault": false
}
```

### 9. Xóa ca làm việc (Admin only)
**DELETE** `/api/standard-work-shifts/{shiftId}`

**Headers:**
- `Authorization`: Bearer token của Admin

**Response:**
```json
"Đã xóa ca làm việc thành công"
```

### 10. Đặt ca làm việc làm mặc định (Admin only)
**PUT** `/api/standard-work-shifts/{shiftId}/set-default`

**Headers:**
- `Authorization`: Bearer token của Admin

**Response:**
```json
{
  "shiftId": 1,
  "shiftName": "Ca sáng",
  "dayOfWeek": "MONDAY",
  "startTime": "08:00:00",
  "endTime": "12:00:00",
  "clinic": {...},
  "isDefault": true
}
```

### 11. Bỏ đặt ca làm việc làm mặc định (Admin only)
**PUT** `/api/standard-work-shifts/{shiftId}/unset-default`

**Headers:**
- `Authorization`: Bearer token của Admin

**Response:**
```json
{
  "shiftId": 1,
  "shiftName": "Ca sáng",
  "dayOfWeek": "MONDAY",
  "startTime": "08:00:00",
  "endTime": "12:00:00",
  "clinic": {...},
  "isDefault": false
}
```

## Validation Rules

### StandardWorkShiftDTO
- `shiftName`: Bắt buộc, từ 2-100 ký tự
- `dayOfWeek`: Bắt buộc, phải là một trong các giá trị: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
- `startTime`: Bắt buộc, định dạng HH:mm:ss
- `endTime`: Bắt buộc, định dạng HH:mm:ss, phải sau startTime
- `clinicId`: Bắt buộc, phải tồn tại trong hệ thống
- `isDefault`: Tùy chọn, mặc định là false

## Ví dụ sử dụng

### 1. Tạo ca sáng cho thứ 2-6
```bash
curl -X POST "http://localhost:8080/api/standard-work-shifts" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shiftName": "Ca sáng",
    "dayOfWeek": "MONDAY",
    "startTime": "08:00:00",
    "endTime": "12:00:00",
    "clinicId": 1,
    "isDefault": true
  }'
```

### 2. Lấy tất cả ca làm việc của phòng khám
```bash
curl -X GET "http://localhost:8080/api/standard-work-shifts/clinic/1"
```

### 3. Lấy ca làm việc của thứ 2
```bash
curl -X GET "http://localhost:8080/api/standard-work-shifts/day/MONDAY"
```

## Error Responses

### 400 Bad Request
```json
{
  "timestamp": "2024-01-01T10:00:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Tên ca làm việc không được để trống",
  "path": "/api/standard-work-shifts"
}
```

### 401 Unauthorized
```json
{
  "timestamp": "2024-01-01T10:00:00.000Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Access Denied",
  "path": "/api/standard-work-shifts"
}
```

### 403 Forbidden
```json
{
  "timestamp": "2024-01-01T10:00:00.000Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied",
  "path": "/api/standard-work-shifts"
}
```

### 404 Not Found
```json
{
  "timestamp": "2024-01-01T10:00:00.000Z",
  "status": 404,
  "error": "Not Found",
  "message": "Không tìm thấy ca làm việc với ID: 999",
  "path": "/api/standard-work-shifts/999"
}
``` 