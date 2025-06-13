# Standard Work Shift Management System

## Tổng quan

StandardWorkShift đã được tích hợp vào hệ thống quản lý phòng khám để **thay thế hoàn toàn** trường `workingHours` cũ. Hệ thống mới cung cấp cách quản lý ca làm việc linh hoạt và chuyên nghiệp hơn.

## Thay đổi quan trọng

### Trước đây (Cũ):
- Phòng khám có trường `workingHours` dạng text (ví dụ: "T2-T7: 8:00-20:00")
- Không có cấu trúc dữ liệu chuẩn
- Khó khăn trong việc tìm kiếm và lọc theo thời gian

### Hiện tại (Mới):
- Phòng khám **không còn** trường `workingHours`
- Sử dụng StandardWorkShift với cấu trúc dữ liệu chuẩn
- Hỗ trợ nhiều ca làm việc cho mỗi phòng khám
- Có thể đặt ca mặc định
- Dễ dàng tìm kiếm và quản lý theo ngày, giờ

## Cách thức hoạt động

### 1. Quản lý tại Phòng khám (Phân tán)
- Trong **ClinicManagement**: Quản lý ca làm việc trực tiếp cho từng phòng khám
- Tính năng mở rộng/thu gọn để xem chi tiết ca làm việc
- Thêm/xóa ca làm việc ngay tại card phòng khám

### 2. Quản lý tập trung (Tổng thể)  
- Trong **StandardWorkShiftManagement**: Quản lý tất cả ca làm việc của hệ thống
- Tìm kiếm và lọc theo phòng khám, ngày trong tuần
- Phù hợp cho việc giám sát tổng thể

## API Endpoints 