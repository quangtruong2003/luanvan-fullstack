# Luận Văn Backend - Tổng Quan

## Cấu Trúc Dự Án

Dự án backend được xây dựng trên nền tảng Spring Boot và sử dụng các công nghệ sau:

- **Spring Boot**: 3.4.5
- **Java**: 17
- **Database**: MySQL
- **ORM**: Spring Data JPA
- **Bảo mật**: Spring Security
- **Phụ thuộc khác**: Lombok, Spring Boot DevTools

## Kiến Trúc Ứng Dụng

Ứng dụng tuân theo kiến trúc phân lớp tiêu chuẩn của Spring Boot:

```
src/main/
└── java/
    └── com/
        └── luanvan/
            └── luanvanbackend/
                ├── config/         # Cấu hình ứng dụng
                ├── controllers/    # Điều khiển REST API
                ├── dto/            # Đối tượng truyền dữ liệu
                ├── entities/       # Thực thể JPA
                ├── reponsitories/  # Truy vấn cơ sở dữ liệu
                ├── request/        # Đối tượng yêu cầu
                ├── response/       # Đối tượng phản hồi
                └── services/       # Xử lý nghiệp vụ
                    └── impl/       # Triển khai dịch vụ
```

## Cấu Hình Cơ Sở Dữ Liệu

Ứng dụng kết nối với cơ sở dữ liệu MySQL:

- URL: jdbc:mysql://localhost:3306/luanvan_db
- Username: root
- Password: (không có)
- Tự động cập nhật schema: true

## Mô Hình Dữ Liệu

Dự án đang phát triển với các thực thể (entities):

- **Doctor**: Thực thể đại diện cho bác sĩ trong hệ thống
  - Thuộc tính: id, name, specialty, phoneNumber, email, address

## Tính Năng Hiện Tại

- Cấu trúc REST API cơ bản
- Xác thực và phân quyền với Spring Security
- Quản lý thực thể Doctor

## Hướng Phát Triển

- Mở rộng các thực thể để tích hợp thêm thông tin bệnh nhân và lịch hẹn
- Phát triển API cho việc đặt lịch khám và quản lý hồ sơ y tế
- Tích hợp với frontend để tạo giao diện người dùng hoàn chỉnh

## Thông Tin Triển Khai

- Phiên bản hiện tại: 0.0.1-SNAPSHOT
- Môi trường: Phát triển (Development)