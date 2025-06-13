# Tích hợp Clerk Authentication

## Tổng quan

Hệ thống sử dụng Clerk để xử lý authentication cho **PATIENT** users, trong khi **ADMIN** và **DOCTOR** sử dụng authentication truyền thống với email/password.

## Cách hoạt động

### 1. Clerk Users (PATIENT)
- **Authentication**: Được xử lý hoàn toàn bởi Clerk
- **Database**: `passwordHash` có thể là `null` hoặc không được set
- **JWT Token**: Được tạo với custom claims và không dựa vào `passwordHash`
- **Authorization**: Sử dụng JWT token với role-based permissions

### 2. Traditional Users (ADMIN/DOCTOR)
- **Authentication**: Sử dụng email/password truyền thống
- **Database**: `passwordHash` được mã hóa và lưu trữ
- **JWT Token**: Được tạo dựa trên `passwordHash`
- **Authorization**: Sử dụng JWT token với role-based permissions

## API Endpoints

### `/api/auth/clerk-sync`
- **Mục đích**: Đồng bộ thông tin user từ Clerk vào database
- **Xử lý**: 
  - Tạo user mới nếu chưa tồn tại
  - Cập nhật thông tin nếu đã tồn tại
  - Không yêu cầu `password` trong request
  - Tự động gán role `PATIENT`

### `/api/auth/login`
- **Mục đích**: Đăng nhập cho ADMIN/DOCTOR
- **Xử lý**: 
  - Yêu cầu email/password
  - Chỉ cho phép ADMIN/DOCTOR đăng nhập
  - PATIENT sử dụng Clerk authentication

## Bảo mật

1. **Clerk Users**: Authentication được xử lý bởi Clerk, an toàn hơn
2. **JWT Token**: Chứa custom claims với thông tin role và userId
3. **Password Management**: Không cần lưu password cho Clerk users
4. **Role-based Access**: Phân quyền dựa trên role trong JWT token

## Migration Path

Nếu muốn chuyển tất cả users sang Clerk:
1. Cập nhật frontend để sử dụng Clerk cho tất cả roles
2. Migrate existing ADMIN/DOCTOR accounts sang Clerk
3. Cập nhật backend để remove password requirements hoàn toàn 