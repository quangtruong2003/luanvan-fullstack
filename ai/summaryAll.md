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
- **Cơ sở dữ liệu**: Chưa được xác định trong mã nguồn hiện tại (có thể là JPA/Hibernate với một RDBMS)
- **Thư viện bổ sung**: Lombok (giảm boilerplate code)

### Cấu Trúc Backend
```
luanvan-backend/
├── src/main/java/com/luanvan/luanvanbackend/
│   ├── LuanvanBackendApplication.java (class chính của ứng dụng)
│   ├── config/ (cấu hình ứng dụng)
│   ├── controllers/ (REST API endpoints)
│   ├── dto/ (data transfer objects)
│   ├── entities/ (JPA entities)
│   │   └── Doctor.java (entity cho đối tượng bác sĩ)
│   ├── reponsitories/ (data access layer)
│   ├── request/ (request models)
│   ├── response/ (response models)
│   └── services/ (business logic)
│       └── impl/ (implementation của service interfaces)
└── src/main/resources/
    └── application.properties (cấu hình ứng dụng)
```

### Entities Hiện Có
1. **Doctor**
   - Thuộc tính: id, name, specialty, phoneNumber, email, address
   - Sử dụng JPA annotations và Lombok

## Frontend (React)

### Công Nghệ Sử Dụng
- **Framework**: React.js
- **Routing**: React Router
- **Quản lý phụ thuộc**: npm/yarn
- **Kiểu dự án**: Single Page Application (SPA)

### Cấu Trúc Frontend
```
luanvan-frontend/
├── public/ (static assets)
└── src/
    ├── assets/ (media files, images)
    ├── components/ (reusable components)
    │   └── Layout.jsx
    ├── config/ (application configuration)
    ├── context/ (React contexts)
    ├── hooks/ (custom React hooks)
    ├── pages/ (page components)
    │   ├── Home.jsx
    │   └── Login.jsx
    ├── services/ (API services)
    │   └── api.js
    ├── store/ (state management)
    ├── types/ (TypeScript types/interfaces if used)
    ├── utils/ (utility functions)
    └── App.js (main React component)
```

### Pages và Tính Năng Hiện Có
1. **Home** - Trang chủ của ứng dụng
2. **Login** - Trang đăng nhập (đang được phát triển)
3. **Bảo vệ Route** - Đã thiết lập `PrivateRoute` để bảo vệ các trang yêu cầu xác thực
4. **Dashboard** - Trang dashboard (cần tạo component, hiện chỉ là placeholder)
5. **Profile** - Trang hồ sơ người dùng (cần tạo component, hiện chỉ là placeholder)

## Tình Trạng Hiện Tại
- Backend đã có cấu trúc cơ bản của ứng dụng Spring Boot
- Frontend đã thiết lập routing và một số trang cơ bản
- Đã thiết lập cơ chế xác thực đơn giản với token lưu trong localStorage

## Kế Hoạch Phát Triển
1. **Backend**:
   - Phát triển thêm các entities cần thiết
   - Xây dựng REST API endpoints
   - Thiết lập cơ chế xác thực và phân quyền
   - Kết nối cơ sở dữ liệu

2. **Frontend**:
   - Hoàn thiện các trang UI cơ bản
   - Kết nối với API của backend
   - Xử lý trạng thái và form
   - Thiết kế responsive

## Quản Lý Git
- Đã thiết lập monorepo trên GitHub
- Nhánh chính: `master`
- Convention commit message: `[Backend/Frontend/Full-stack] Mô tả thay đổi`

## Lưu Ý
- Tài liệu này sẽ được cập nhật liên tục khi dự án phát triển
- Chi tiết về các tính năng và API sẽ được bổ sung trong các tài liệu riêng