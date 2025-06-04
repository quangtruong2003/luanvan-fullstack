# Tóm tắt Dự án Luận Văn

## Tổng Quan
Dự án được tổ chức theo mô hình monorepo, chứa cả backend và frontend trong một repository Git duy nhất. Cấu trúc dự án được chia thành hai phần chính: `luanvan-backend` và `luanvan-frontend`.

## Cấu Trúc Repository
- Repository được tổ chức dưới dạng monorepo, giúp quản lý code một cách tập trung
- Sử dụng GitHub để lưu trữ mã nguồn: https://github.com/quangtruong2003/luanvan-fullstack

## Backend (Spring Boot)

### Công Nghệ Sử Dụng
- **Framework**: Spring Boot
- **Ngôn ngữ**: Java
- **Quản lý dự án**: Maven
- **Cơ sở dữ liệu**: MySQL với JPA/Hibernate
- **Bảo mật**: Spring Security với JWT
- **Xác thực bệnh nhân**: Tích hợp Clerk via API đồng bộ
- **Thư viện bổ sung**: Lombok (giảm boilerplate code)

### Cấu Trúc Backend 
```

luanvan-backend/
├── src/main/java/com/luanvan/luanvanbackend/
│   ├── LuanvanBackendApplication.java (class chính của ứng dụng)
│   ├── config/ (cấu hình ứng dụng)
│   │   └── SecurityConfig.java (cấu hình bảo mật)
│   ├── controllers/ (REST API endpoints)
│   │   └── AuthController.java (xử lý xác thực)
│   ├── dto/ (data transfer objects)
│   ├── entities/ (JPA entities)
│   │   ├── Doctor.java (entity cho đối tượng bác sĩ)
│   │   ├── User.java (entity cho người dùng)
│   │   └── Role.java (entity cho vai trò người dùng)
│   ├── repositories/ (data access layer)
│   │   ├── UserRepository.java
│   │   └── RoleRepository.java
│   ├── request/ (request models)
│   │   ├── LoginRequest.java
│   │   ├── ClerkUserSyncRequest.java (đồng bộ Clerk user)
│   │   └── UserCreateRequest.java
│   ├── response/ (response models)
│   │   ├── LoginResponse.java
│   │   ├── ClerkUserSyncResponse.java (phản hồi đồng bộ Clerk)
│   │   └── UserCreateResponse.java
│   ├── security/ (bảo mật)
│   │   ├── CustomUserDetailsService.java
│   │   └── JwtAuthenticationFilter.java
│   └── services/ (business logic)
│       ├── AuthService.java
│       └── impl/ (implementation của service interfaces)
│           └── AuthServiceImpl.java
└── src/main/resources/
    ├── application.properties (cấu hình ứng dụng)
    └── import.sql (dữ liệu khởi tạo cho roles và users)
```

### Entities Hiện Có
1. **Doctor**
   - Thuộc tính: id, name, specialty, phoneNumber, email, address
   - Sử dụng JPA annotations và Lombok

2. **User** (đã được mở rộng cho Clerk)
   - Thuộc tính: userId, phoneNumber, passwordHash, email, fullName, role, isActive, registrationDate
   - **Clerk integration fields**: clerkUserId, imageUrl
   - Liên kết với Role thông qua ManyToOne

3. **Role**
   - Thuộc tính: roleId, roleName
   - Được sử dụng trong hệ thống phân quyền

### Xác Thực và Phân Quyền
- **Spring Security**: Cung cấp khung bảo mật
- **JWT (JSON Web Tokens)**: Sử dụng cho xác thực không trạng thái (admin/doctor)
- **Clerk Integration**: Xác thực bên thứ ba cho bệnh nhân
- **BCryptPasswordEncoder**: Mã hóa mật khẩu an toàn
- **Role-based Authorization**: Phân quyền dựa trên vai trò (ADMIN, DOCTOR, PATIENT, STAFF)

### API Endpoints
1. **POST /api/auth/login**: Đăng nhập admin/doctor và trả về JWT token
2. **POST /api/auth/clerk-sync**: **Đồng bộ thông tin người dùng Clerk vào database**
3. **POST /api/auth/create-user**: Tạo tài khoản mới (yêu cầu quyền ADMIN)
4. **POST /api/auth/create-first-admin**: API đặc biệt để tạo tài khoản admin đầu tiên

### Tích Hợp Clerk - Chi Tiết
Backend hỗ trợ đầy đủ việc đồng bộ user từ Clerk:

**Request Model (`ClerkUserSyncRequest`)**:
```java
{
    "clerkUserId": "user_123...",
    "email": "user@example.com", 
    "firstName": "Nguyễn",
    "lastName": "Văn A",
    "phoneNumber": "+84xxxxxxxxx",
    "imageUrl": "https://..."
}
```

**Response Model (`ClerkUserSyncResponse`)**:
```java
{
    "success": true,
    "message": "Tạo tài khoản mới thành công",
    "userId": 123,
    "fullName": "Nguyễn Văn A", 
    "email": "user@example.com",
    "isNewUser": true
}
```

**Logic xử lý**:
- Kiểm tra user có tồn tại theo `clerkUserId`
- Nếu có: cập nhật thông tin
- Nếu không có nhưng email đã tồn tại: liên kết tài khoản hiện có với Clerk
- Nếu hoàn toàn mới: tạo user mới với role PATIENT

## Frontend (React)

### Công Nghệ Sử Dụng
- **Framework**: React.js với Vite
- **Styling**: TailwindCSS
- **Routing**: React Router
- **Xác thực**: Clerk (cho bệnh nhân) và JWT (cho admin/doctor)
- **State Management**: React Context

### Cấu Trúc Frontend
```
luanvan-frontend/
├── public/ (static assets)
└── src/
    ├── assets/ (media files, images)
    ├── components/ (reusable components)
    │   ├── Menubar.jsx (navigation với Clerk buttons)
    │   ├── ClerkAuthHandler.jsx (xử lý đồng bộ Clerk)
    │   └── ProtectedRoute.jsx (bảo vệ route theo role)
    ├── context/ (React contexts)
    │   └── AuthContext.jsx (quản lý authentication state)
    ├── pages/ (page components)
    │   ├── Home.jsx (trang chủ)
    │   ├── BookAppointment.jsx (đặt lịch hẹn)
    │   ├── MyAppointments.jsx (lịch hẹn của tôi)
    │   ├── Dashboard.jsx (dashboard bệnh nhân)
    │   ├── Login.jsx (đăng nhập admin/doctor)
    │   ├── admin/ (trang admin)
    │   └── doctor/ (trang bác sĩ)
    ├── services/ (API services)
    │   └── api.js (tích hợp với backend API)
    └── App.jsx (main React component với routing)
```

### Luồng Hoạt Động Clerk Integration

**1. Setup Initial**:
```jsx
// main.jsx
<ClerkProvider publishableKey={PUBLISHABLE_KEY}>
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
</ClerkProvider>
```

**2. Xử Lý Đồng Bộ Tự Động**:
`ClerkAuthHandler` component tự động:
- Lắng nghe thay đổi Clerk user state
- Khi user đăng ký/đăng nhập qua Clerk → gọi API `/auth/clerk-sync`  
- Lưu thông tin user vào localStorage để sử dụng

**3. UI Integration**:
- `Menubar.jsx`: Hiển thị SignInButton/SignUpButton của Clerk
- Tự động chuyển đổi giữa authenticated/unauthenticated state
- Hiển thị thông tin user và UserButton của Clerk

**4. API Service**:
```javascript
// api.js
async syncClerkUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/clerk-sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(userData)
  });
  return await response.json();
}
```

### Tính Năng Hiện Có
1. **Trang chủ** - Landing page với thông tin phòng khám
2. **Đăng ký/Đăng nhập Clerk** - Cho bệnh nhân (tự động lưu vào database)
3. **Đăng nhập JWT** - Cho admin và bác sĩ  
4. **Đặt lịch hẹn** - Chức năng đặt lịch khám
5. **Quản lý lịch hẹn** - Xem lịch hẹn của bệnh nhân
6. **Dashboard** - Trang tổng quan cho từng role
7. **Admin Dashboard** - Quản lý hệ thống (protected route)
8. **Doctor Dashboard** - Dashboard cho bác sĩ (protected route)

## Quy Trình Đăng Ký Clerk → Database

### Bước 1: User đăng ký qua Clerk
- User click "Đăng ký" trên Menubar
- Clerk modal mở và xử lý đăng ký
- Clerk tạo tài khoản và trả về user object

### Bước 2: Tự động đồng bộ với Backend  
- `ClerkAuthHandler` detect user state change
- Extract thông tin: clerkUserId, email, firstName, lastName, phoneNumber, imageUrl
- Gọi `ApiService.syncClerkUser(userData)`

### Bước 3: Backend xử lý
- Nhận request tại `/auth/clerk-sync`
- Kiểm tra user đã tồn tại chưa (theo clerkUserId hoặc email)
- Tạo mới hoặc cập nhật user trong database
- Gán role "PATIENT" mặc định
- Trả về response với thông tin user

### Bước 4: Frontend lưu thông tin local
```javascript
localStorage.setItem('backendUserId', response.userId.toString())
localStorage.setItem('userRole', 'PATIENT')
localStorage.setItem('userEmail', response.email || '')
localStorage.setItem('userName', response.fullName || '')
```

### Bước 5: User có thể sử dụng hệ thống
- Truy cập các trang dành cho bệnh nhân
- Đặt lịch hẹn, xem lịch hẹn
- Thông tin được đồng bộ giữa Clerk và database

## Tình Trạng Hiện Tại
- ✅ Backend đã có cấu trúc cơ bản của ứng dụng Spring Boot
- ✅ Đã thiết lập xác thực JWT cho admin và doctor
- ✅ **Đã tích hợp hoàn chỉnh Clerk cho xác thực bệnh nhân**
- ✅ **Đã implement API đồng bộ Clerk user vào database**
- ✅ Frontend đã thiết lập routing và các trang cơ bản
- ✅ **Đã thiết lập tự động đồng bộ user từ Clerk sang backend**

## Kế Hoạch Phát Triển
1. **Backend**:
   - Phát triển thêm các entities cho appointment, medical records
   - Xây dựng REST API endpoints cho quản lý lịch hẹn
   - Thiết lập notification system
   - Tối ưu hóa hiệu suất database

2. **Frontend**:
   - Hoàn thiện UI/UX cho các trang
   - Implement real-time notifications
   - Tối ưu responsive design
   - Thêm tính năng tìm kiếm, filter

## Quản Lý Git
- Đã thiết lập monorepo trên GitHub
- Nhánh chính: `master`
- Convention commit message: `[Backend/Frontend/Full-stack] Mô tả thay đổi`

## Cách Tạo Tài Khoản Admin Đầu Tiên
Khi triển khai hệ thống lần đầu, sử dụng API đặc biệt để tạo tài khoản admin:

1. **API Endpoint**: `POST /api/auth/create-first-admin`
2. **Headers**: `Content-Type: application/json`
3. **Request Body**:
```json
{
  "phoneNumber": "admin",
  "password": "yourStrongPassword",
  "fullName": "Quản trị viên",
  "email": "admin@example.com",
  "role": "ADMIN"
}
```
4. **Lưu ý bảo mật**: API này chỉ hoạt động khi chưa có tài khoản admin nào trong hệ thống. Sau khi tạo admin đầu tiên, API này sẽ từ chối các yêu cầu tiếp theo.

5. **Khi triển khai hệ thống chính thức**: Nên vô hiệu hóa API này sau khi đã tạo admin đầu tiên bằng cách xóa hoặc comment out đoạn code tương ứng trong `AuthController.java`.

## Lưu Ý
- Tài liệu này sẽ được cập nhật liên tục khi dự án phát triển
- Chi tiết về các tính năng và API sẽ được bổ sung trong các tài liệu riêng
- **Hệ thống Clerk integration đã hoạt động ổn định, tự động lưu user vào database**