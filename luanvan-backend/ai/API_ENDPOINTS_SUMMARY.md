# Tóm Tắt API Endpoints

## Tổng Quan

Hệ thống backend đã triển khai đầy đủ **10 controllers** với **hơn 100 API endpoints** để hỗ trợ đầy đủ các chức năng của hệ thống đặt lịch hẹn y tế.

## Danh Sách Controllers và Endpoints

### 1. AuthController (`/api/auth`)
- `POST /login` - Đăng nhập
- `POST /clerk-sync` - Đồng bộ người dùng với Clerk
- `POST /create-user` - Tạo người dùng mới (Admin)
- `POST /create-first-admin` - Tạo admin đầu tiên

### 2. UserController (`/api/users`)
- `GET /me` - Lấy thông tin người dùng hiện tại
- `GET /{userId}` - Lấy thông tin người dùng theo ID
- `GET /` - Lấy danh sách tất cả người dùng (Admin)
- `GET /role/{roleId}` - Lấy người dùng theo vai trò (Admin)
- `PUT /{userId}` - Cập nhật thông tin người dùng
- `PUT /{userId}/deactivate` - Vô hiệu hóa tài khoản (Admin)
- `PUT /{userId}/activate` - Kích hoạt tài khoản (Admin)
- `PUT /{userId}/role/{roleId}` - Thay đổi vai trò người dùng (Admin)

### 3. DoctorController (`/api/doctors`)
- `GET /` - Lấy danh sách bác sĩ (có phân trang)
- `GET /{doctorId}` - Lấy thông tin bác sĩ theo ID
- `GET /user/{userId}` - Lấy thông tin bác sĩ theo user ID
- `GET /search` - Tìm kiếm bác sĩ theo tên
- `GET /specialty/{specialtyId}` - Lấy bác sĩ theo chuyên khoa
- `GET /experience/{yearsOfExperience}` - Lấy bác sĩ theo kinh nghiệm
- `POST /user/{userId}` - Tạo hồ sơ bác sĩ mới (Admin)
- `PUT /{doctorId}` - Cập nhật thông tin bác sĩ
- `PUT /{doctorId}/profile-picture` - Cập nhật ảnh đại diện
- `POST /{doctorId}/specialties/{specialtyId}` - Gán chuyên khoa (Admin)
- `DELETE /{doctorId}/specialties/{specialtyId}` - Xóa chuyên khoa (Admin)
- `GET /{doctorId}/specialties` - Lấy chuyên khoa của bác sĩ

### 4. ClinicController (`/api/clinics`)
- `GET /` - Lấy danh sách phòng khám (có phân trang)
- `GET /{clinicId}` - Lấy thông tin phòng khám theo ID
- `GET /search` - Tìm kiếm phòng khám theo tên
- `POST /` - Tạo phòng khám mới (Admin)
- `PUT /{clinicId}` - Cập nhật thông tin phòng khám (Admin)
- `PUT /{clinicId}/logo` - Cập nhật logo phòng khám (Admin)
- `DELETE /{clinicId}` - Xóa phòng khám (Admin)

### 5. SpecialtyController (`/api/specialties`)
- `GET /` - Lấy danh sách chuyên khoa (có phân trang)
- `GET /all` - Lấy tất cả chuyên khoa (không phân trang)
- `GET /{specialtyId}` - Lấy thông tin chuyên khoa theo ID
- `GET /clinic/{clinicId}` - Lấy chuyên khoa theo phòng khám
- `GET /search` - Tìm kiếm chuyên khoa theo tên
- `POST /` - Tạo chuyên khoa mới (Admin)
- `PUT /{specialtyId}` - Cập nhật thông tin chuyên khoa (Admin)
- `DELETE /{specialtyId}` - Xóa chuyên khoa (Admin)

### 6. AvailabilityController (`/api/availability`)

#### Quản lý Khung Giờ (`/slots`)
- `GET /slots/{slotId}` - Lấy thông tin khung giờ theo ID
- `GET /slots/doctor/{doctorId}` - Lấy khung giờ theo bác sĩ (có phân trang)
- `GET /slots/doctor/{doctorId}/date/{date}` - Lấy khung giờ theo bác sĩ và ngày
- `GET /slots/doctor/{doctorId}/range` - Lấy khung giờ theo khoảng thời gian
- `GET /slots/specialty/{specialtyId}/date/{date}` - Tìm khung giờ theo chuyên khoa và ngày
- `GET /slots/clinic/{clinicId}` - Lấy khung giờ theo phòng khám (Admin)
- `POST /slots` - Tạo khung giờ mới (Admin)
- `POST /slots/bulk` - Tạo nhiều khung giờ (Admin)
- `POST /slots/doctor/{doctorId}/bulk` - Tạo nhiều khung giờ cho bác sĩ (Admin)
- `PUT /slots/{slotId}` - Cập nhật khung giờ (Admin)
- `PUT /slots/{slotId}/status` - Cập nhật trạng thái khung giờ (Admin)
- `DELETE /slots/{slotId}` - Xóa khung giờ (Admin)

#### Quản lý Ca Làm Việc (`/shifts`)
- `GET /shifts/{shiftId}` - Lấy thông tin ca làm việc theo ID
- `GET /shifts` - Lấy danh sách ca làm việc (có phân trang)
- `GET /shifts/clinic/{clinicId}` - Lấy ca làm việc theo phòng khám
- `GET /shifts/day/{dayOfWeek}` - Lấy ca làm việc theo ngày trong tuần
- `GET /shifts/default` - Lấy ca làm việc mặc định
- `POST /shifts` - Tạo ca làm việc mới (Admin)
- `PUT /shifts/{shiftId}` - Cập nhật ca làm việc (Admin)
- `DELETE /shifts/{shiftId}` - Xóa ca làm việc (Admin)
- `PUT /shifts/{shiftId}/set-default` - Đặt ca làm việc mặc định (Admin)
- `PUT /shifts/{shiftId}/unset-default` - Bỏ đặt ca làm việc mặc định (Admin)

### 7. AppointmentController (`/api/appointments`)
- `GET /{appointmentId}` - Lấy thông tin lịch hẹn theo ID
- `GET /patient/{patientId}` - Lấy lịch hẹn của bệnh nhân
- `GET /doctor/{doctorId}` - Lấy lịch hẹn của bác sĩ
- `GET /status/{status}` - Lấy lịch hẹn theo trạng thái (Admin)
- `GET /clinic/{clinicId}` - Lấy lịch hẹn theo phòng khám (Admin)
- `GET /date/{date}` - Lấy lịch hẹn theo ngày (Admin)
- `POST /` - Tạo lịch hẹn mới (Patient)
- `PUT /{appointmentId}` - Cập nhật thông tin lịch hẹn (Admin)
- `PUT /{appointmentId}/status` - Cập nhật trạng thái lịch hẹn (Admin)
- `PUT /{appointmentId}/cancel-by-patient` - Hủy lịch hẹn bởi bệnh nhân
- `PUT /{appointmentId}/cancel-by-clinic` - Hủy lịch hẹn bởi phòng khám (Admin)
- `PUT /{appointmentId}/confirm` - Xác nhận lịch hẹn sau thanh toán (Admin)
- `PUT /{appointmentId}/complete` - Đánh dấu hoàn thành (Admin)
- `PUT /{appointmentId}/payment-status` - Cập nhật trạng thái thanh toán (Admin)
- `GET /upcoming-reminders` - Lấy lịch hẹn cần nhắc nhở (Admin)

### 8. ArticleController (`/api/articles`)
- `GET /{articleId}` - Lấy thông tin bài viết theo ID
- `GET /published` - Lấy tất cả bài viết đã xuất bản
- `GET /search` - Tìm kiếm bài viết theo tiêu đề
- `GET /status/{status}` - Lấy bài viết theo trạng thái (Admin/Doctor)
- `GET /author/{authorId}` - Lấy bài viết của tác giả
- `POST /` - Tạo bài viết mới (Admin/Doctor)
- `PUT /{articleId}` - Cập nhật bài viết
- `PUT /{articleId}/publish` - Xuất bản bài viết
- `PUT /{articleId}/draft` - Lưu bài viết dưới dạng bản nháp
- `PUT /{articleId}/archive` - Lưu trữ bài viết
- `DELETE /{articleId}` - Xóa bài viết (Admin)

### 9. SystemConfigurationController (`/api/system-config`)
- `GET /` - Lấy cấu hình hiện tại (Admin)
- `PUT /` - Cập nhật cấu hình hệ thống (Admin)
- `PUT /deposit/toggle` - Bật/tắt tính năng đặt cọc (Admin)
- `PUT /deposit/amount` - Cập nhật số tiền đặt cọc mặc định (Admin)
- `PUT /momo` - Cập nhật cấu hình Momo (Admin)
- `PUT /payment/timeout` - Cập nhật thời gian chờ thanh toán (Admin)
- `PUT /cancellation/time-limit` - Cập nhật thời gian giới hạn hủy lịch (Admin)
- `PUT /policy/non-refundable` - Cập nhật chính sách không hoàn cọc (Admin)
- `POST /default` - Tạo cấu hình mặc định (Admin)

### 10. RoleController (`/api/roles`)
- `GET /` - Lấy danh sách tất cả vai trò (Admin)
- `GET /{roleId}` - Lấy thông tin vai trò theo ID (Admin)
- `GET /name/{roleName}` - Lấy vai trò theo tên (Admin)
- `POST /` - Tạo vai trò mới (Admin)
- `PUT /{roleId}` - Cập nhật tên vai trò (Admin)
- `DELETE /{roleId}` - Xóa vai trò (Admin)

## Tính Năng Bảo Mật

- **Phân quyền**: Sử dụng `@PreAuthorize` để kiểm soát quyền truy cập
- **Vai trò**: Hỗ trợ 3 vai trò chính: ADMIN, DOCTOR, PATIENT
- **Xác thực**: Tích hợp với JWT authentication
- **Xử lý lỗi**: Global Exception Handler cho xử lý lỗi thống nhất

## Tính Năng Khác

- **Phân trang**: Hỗ trợ phân trang cho các danh sách dài
- **Tìm kiếm**: Tính năng tìm kiếm linh hoạt
- **Validation**: Kiểm tra dữ liệu đầu vào với Bean Validation
- **RESTful Design**: Tuân thủ nguyên tắc thiết kế RESTful API

## Trạng Thái Triển Khai

✅ **Hoàn thành**: Giai đoạn 3 - Xây dựng lớp Controller (API Endpoints)

**Tiếp theo**: Giai đoạn 4 - Bảo mật (Spring Security) 