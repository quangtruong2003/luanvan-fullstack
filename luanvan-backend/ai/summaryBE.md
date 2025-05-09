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

## Mô Hình Dữ Liệu (Entities)

Hệ thống sử dụng các thực thể JPA để ánh xạ với cơ sở dữ liệu. Dưới đây là danh sách các thực thể chính và một số thuộc tính quan trọng:

1.  **`User`**: Lưu trữ thông tin người dùng chung của hệ thống.
    *   `userId` (PK), `email`, `phoneNumber`, `passwordHash`, `fullName`, `role` (FK to `Role`), `dateOfBirth`, `gender`, `address`, `registrationDate`, `isActive`.
2.  **`Role`**: Định nghĩa các vai trò trong hệ thống.
    *   `roleId` (PK), `roleName` (ví dụ: "PATIENT", "DOCTOR", "ADMINISTRATOR").
3.  **`Doctor`**: Lưu trữ thông tin chi tiết của bác sĩ, liên kết với `User`.
    *   `doctorId` (PK, FK to `User.userId`), `bio`, `yearsOfExperience`, `profilePictureURL`.
4.  **`Clinic`**: Thông tin về phòng khám/bệnh viện.
    *   `clinicId` (PK), `name`, `address`, `phoneNumber`, `email`, `logoURL`, `description`, `workingHours`, `history`, `vision`, `mission`, `coreValues`, `facilitiesDescription`, `equipmentDescription`.
5.  **`Specialty`**: Các chuyên khoa y tế.
    *   `specialtyId` (PK), `name`, `description`, `clinic` (FK to `Clinic`).
6.  **`DoctorSpecialty`**: Bảng nối thể hiện chuyên khoa của bác sĩ (quan hệ nhiều-nhiều).
    *   `id` (PK), `doctor` (FK to `Doctor`), `specialty` (FK to `Specialty`), `isPrimary`.
7.  **`StandardWorkShift`**: Các ca làm việc chuẩn của phòng khám.
    *   `shiftId` (PK), `shiftName`, `dayOfWeek`, `startTime`, `endTime`, `clinic` (FK to `Clinic`), `isDefault`.
8.  **`DoctorAvailabilityRequest`**: Yêu cầu đăng ký lịch làm việc từ bác sĩ.
    *   `requestId` (PK), `doctor` (FK to `Doctor`), `weekStartDate`, `submissionTimestamp`, `status` (Pending, Approved, etc.), `reviewer` (FK to `User`), `reviewTimestamp`, `reviewNotes`.
9.  **`RequestedSlot`**: Các khung giờ cụ thể trong một `DoctorAvailabilityRequest`.
    *   `requestedSlotId` (PK), `request` (FK to `DoctorAvailabilityRequest`), `date`, `startTime`, `endTime`.
10. **`AvailabilitySlot`**: Các khung giờ làm việc đã được duyệt và sẵn sàng cho bệnh nhân đặt.
    *   `slotId` (PK), `doctor` (FK to `Doctor`), `date`, `startTime`, `endTime`, `status` (Available, Booked, etc.), `originalRequest` (FK to `DoctorAvailabilityRequest`), `clinic` (FK to `Clinic`).
11. **`Appointment`**: Thông tin chi tiết về một lịch hẹn.
    *   `appointmentId` (PK), `patient` (FK to `User`), `doctor` (FK to `User`), `slot` (FK to `AvailabilitySlot`), `specialty` (FK to `Specialty`), `clinic` (FK to `Clinic`), `appointmentDateTime`, `reasonForVisit`, `status` (PendingPayment, Confirmed, etc.), `bookingTimestamp`, `depositAmount`, `isDepositPaid`, `paymentStatusMomo`, `paymentTransactionId`, `cancellationTimestamp`, `cancellationReason`, `isDepositNonRefundable`.
12. **`Article`**: Các bài viết, tin tức.
    *   `articleId` (PK), `title`, `content`, `author` (FK to `User`), `publishedDate`, `lastModifiedDate`, `imageURL`, `category`, `status` (Draft, Published, etc.).
13. **`SystemConfiguration`**: Các cấu hình toàn cục cho hệ thống.
    *   `configId` (PK), `enableDeposit`, `defaultDepositAmount`, `momoPartnerCode`, `momoAccessKey`, `momoSecretKey`, `momoApiEndpoint`, `paymentRetryTimeoutMinutes`, `patientCancellationTimeLimitHours`, `nonRefundableDepositPolicyText`.

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