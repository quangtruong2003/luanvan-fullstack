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
8.  **`AvailabilitySlot`**: Các khung giờ làm việc có sẵn cho bệnh nhân đặt lịch.
    *   `slotId` (PK), `doctor` (FK to `Doctor`), `date`, `startTime`, `endTime`, `status` (Available, Booked, etc.), `clinic` (FK to `Clinic`).
9. **`Appointment`**: Thông tin chi tiết về một lịch hẹn.
    *   `appointmentId` (PK), `patient` (FK to `User`), `doctor` (FK to `User`), `slot` (FK to `AvailabilitySlot`), `specialty` (FK to `Specialty`), `clinic` (FK to `Clinic`), `appointmentDateTime`, `reasonForVisit`, `status` (PendingPayment, Confirmed, etc.), `bookingTimestamp`, `depositAmount`, `isDepositPaid`, `paymentStatusMomo`, `paymentTransactionId`, `cancellationTimestamp`, `cancellationReason`, `isDepositNonRefundable`.
10. **`Article`**: Các bài viết, tin tức.
    *   `articleId` (PK), `title`, `content`, `author` (FK to `User`), `publishedDate`, `lastModifiedDate`, `imageURL`, `category`, `status` (Draft, Published, etc.).
11. **`SystemConfiguration`**: Các cấu hình toàn cục cho hệ thống.
    *   `configId` (PK), `enableDeposit`, `defaultDepositAmount`, `momoPartnerCode`, `momoAccessKey`, `momoSecretKey`, `momoApiEndpoint`, `paymentRetryTimeoutMinutes`, `patientCancellationTimeLimitHours`, `nonRefundableDepositPolicyText`.
12. **`Payment`**: Thông tin thanh toán chi tiết.
    *   `paymentId` (PK), `appointment` (FK to `Appointment`), `amount`, `paymentMethod` (MOMO/VNPAY), `paymentGateway`, `status`, `gatewayTransactionId`, `gatewayOrderId`, `payUrl`, `deeplink`, `qrCodeUrl`, `createdAt`, `updatedAt`, `expiredAt`, `paidAt`, `gatewayResponseCode`, `gatewayResponseMessage`, `signature`, `retryCount`, `lastRetryAt`.

## Repositories (Data Access Layer)

Đã triển khai các Spring Data JPA Repositories tương ứng cho mỗi entity, cung cấp các phương thức CRUD cơ bản và các phương thức truy vấn tùy chỉnh (query methods và @Query) để hỗ trợ logic nghiệp vụ. Ví dụ:

*   **`UserRepository`**: `findByEmail`, `findByPhoneNumber`, `existsByEmail`, `existsByPhoneNumber`.
*   **`RoleRepository`**: `findByRoleName`.
*   **`DoctorRepository`**: `findByUserFullNameContainingIgnoreCase` (Pageable), `findBySpecialtyId` (Pageable), `findByYearsOfExperienceGreaterThanEqual`.
*   **`ClinicRepository`**: `findByNameContainingIgnoreCase`, `findByPhoneNumber`, `findByEmail`.
*   **`SpecialtyRepository`**: `findByNameContainingIgnoreCase`, `findByClinicClinicId`.
*   **`DoctorSpecialtyRepository`**: `findByDoctorDoctorId`, `findBySpecialtySpecialtyId`, `deleteByDoctorDoctorIdAndSpecialtySpecialtyId`.
*   **`StandardWorkShiftRepository`**: `findByDayOfWeek`, `findByClinicClinicId`, `findByIsDefaultTrue`.
*   **`AvailabilitySlotRepository`**: `findByDoctorDoctorIdAndDate`, `findOverlappingSlots`, `findAvailableSlotsBySpecialtyAndDate`.
*   **`AppointmentRepository`**: `findByPatientUserId` (List và Pageable), `findByDoctorUserId` (List và Pageable), `findByStatus`, `findBySlotSlotId`, `findUpcomingAppointmentsForReminder`.
*   **`ArticleRepository`**: `findByStatus` (List và Pageable), `findByAuthorUserId` (List và Pageable), `findByTitleContainingIgnoreCase` (Pageable).
*   **`SystemConfigurationRepository`**: `findFirstByOrderByConfigIdAsc`.
*   **`PaymentRepository`**: `findByAppointmentAppointmentId`, `findByStatus`, `findByPaymentMethod`, `findExpiredPayments`, `findByGatewayTransactionId`, `findFailedPaymentsForRetry`.

## Tính Năng Hiện Tại

- Cấu trúc REST API hoàn chỉnh với 11 controllers
- Xác thực và phân quyền với Spring Security và JWT
- Quản lý thực thể đầy đủ (User, Doctor, Clinic, Specialty, Appointment, etc.)
- Đã hoàn thành triển khai các service nghiệp vụ (Business Logic):
  - AuthService: Đăng ký, đăng nhập, xác thực (tương thích với Clerk)
  - UserService: Quản lý thông tin người dùng, kiểm tra thông tin liên hệ
  - RoleService: Quản lý vai trò người dùng
  - DoctorService: Quản lý thông tin bác sĩ
  - ClinicService: Quản lý phòng khám
  - SpecialtyService: Quản lý chuyên khoa
  - StandardWorkShiftService: Quản lý ca làm việc chuẩn
  - AvailabilitySlotService: Quản lý khung giờ khả dụng
  - AppointmentService: Quản lý lịch hẹn với kiểm tra thông tin liên hệ
  - ArticleService: Quản lý bài viết, tin tức
  - SystemConfigurationService: Quản lý cấu hình hệ thống
  - PaymentService: Tích hợp thanh toán Momo & VNPay hoàn chỉnh
  - PaymentSchedulerService: Xử lý payment hết hạn tự động
  - EmailService: Gửi email chào mừng, xác nhận, nhắc nhở (tương thích Clerk)

## Điều Chỉnh So Với Thiết Kế Ban Đầu

- Đã loại bỏ tính năng "bác sĩ đăng ký/đề xuất lịch làm việc của mình"
- Lịch làm việc của bác sĩ giờ đây được quản trị viên tạo trực tiếp thông qua AvailabilitySlotService

## Hướng Phát Triển

- ✅ Triển khai các Controllers (API Endpoints) - HOÀN THÀNH
- ✅ Cấu hình bảo mật với Spring Security và JWT - HOÀN THÀNH
- ✅ Tích hợp thanh toán Momo & VNPay - HOÀN THÀNH
- ✅ Tích hợp Email Service - HOÀN THÀNH
- ✅ Tài liệu hóa API (Swagger/OpenAPI) - HOÀN THÀNH
- 🔄 Xử lý Upload File - ĐANG PHÁT TRIỂN
- 🔄 Testing - ĐANG PHÁT TRIỂN
- 🔄 Logging và Monitoring - ĐANG PHÁT TRIỂN
- 🔄 Tối ưu hóa và đánh giá lại - ĐANG PHÁT TRIỂN
- 🔄 Chuẩn bị triển khai - ĐANG PHÁT TRIỂN

## Thông Tin Triển Khai

- Phiên bản hiện tại: 0.0.1-SNAPSHOT
- Môi trường: Phát triển (Development)