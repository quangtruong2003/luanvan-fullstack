# Kế Hoạch Phát Triển Chi Tiết Backend - Hệ Thống Đặt Lịch Hẹn Y Tế

Đây là danh sách các công việc cần thực hiện để hoàn thiện phần backend của dự án, được tổ chức theo từng giai đoạn và module chính.

## Giai Đoạn 0: Chuẩn Bị và Thiết Kế (Một phần đã hoàn thành)

1.  **[HOÀN THÀNH] Phân tích yêu cầu hệ thống:**
    *   [X] Xác định các vai trò người dùng (Patient, Doctor, Administrator).
    *   [X] Mô tả các luồng nghiệp vụ chính (đặt lịch, quản lý lịch, quản lý người dùng, v.v.).
2.  **[HOÀN THÀNH] Thiết kế cơ sở dữ liệu:**
    *   [X] Xác định các thực thể (Entities) cần thiết.
    *   [X] Định nghĩa thuộc tính và mối quan hệ giữa các thực thể.
    *   [X] Chuẩn hóa cơ sở dữ liệu.
3.  **[HOÀN THÀNH] Thiết lập môi trường phát triển:**
    *   [X] Cài đặt Java JDK (phiên bản 17).
    *   [X] Cài đặt Maven/Gradle.
    *   [X] Cài đặt IDE (IntelliJ IDEA, Eclipse, VSCode).
    *   [X] Cài đặt MySQL Server.
    *   [X] Tạo project Spring Boot.
    *   [X] Cấu hình `application.properties` hoặc `application.yml` (kết nối database, server port, v.v.).
4.  **[HOÀN THÀNH] Lựa chọn công nghệ và thư viện phụ trợ:**
    *   [X] Spring Boot (Core, Web, Data JPA, Security).
    *   [X] Lombok.
    *   [X] MySQL Connector.
    *   [X] MapStruct (hoặc ModelMapper) cho DTO mapping.
    *   [X] Swagger/OpenAPI cho tài liệu API.
    *   [X] JWT cho xác thực.
    *   [X] Thư viện xử lý thanh toán Momo & VNPay (qua API).
    *   [X] Thư viện gửi email (Spring Mail).

## Giai Đoạn 1: Xây Dựng Lớp Entity và Repository

1.  **[HOÀN THÀNH] Triển khai Entities:**
    *   [X] Tạo các class Java cho mỗi entity đã thiết kế (`User`, `Role`, `Doctor`, `Clinic`, `Specialty`, `DoctorSpecialty`, `StandardWorkShift`, `AvailabilitySlot`, `Appointment`, `Article`, `SystemConfiguration`).
    *   [X] Sử dụng các annotation JPA (@Entity, @Table, @Id, @GeneratedValue, @Column, @ManyToOne, @OneToMany, @ManyToMany, @OneToOne, @JoinColumn, @Enumerated, etc.).
    *   [X] Sử dụng Lombok (@Data, @NoArgsConstructor, @AllArgsConstructor).
2.  **[HOÀN THÀNH] Triển khai Repositories:**
    *   [X] Tạo interface Repository cho mỗi Entity (kế thừa `JpaRepository` hoặc `CrudRepository`).
        *   [X] `UserRepository`
        *   [X] `RoleRepository`
        *   [X] `DoctorRepository`
        *   [X] `ClinicRepository`
        *   [X] `SpecialtyRepository`
        *   [X] `DoctorSpecialtyRepository`
        *   [X] `StandardWorkShiftRepository`
        *   [X] `AvailabilitySlotRepository`
        *   [X] `AppointmentRepository`
        *   [X] `ArticleRepository`
        *   [X] `SystemConfigurationRepository`
    *   [X] Định nghĩa các phương thức truy vấn tùy chỉnh nếu cần (sử dụng @Query hoặc Query Methods).

## Giai Đoạn 2: Xây Dựng Lớp Service (Business Logic) [HOÀN THÀNH]

1.  **[HOÀN THÀNH] Thiết kế cấu trúc Service:**
    *   [X] Tạo interface và class implementation cho mỗi nhóm nghiệp vụ.
2.  **[HOÀN THÀNH] Module Quản Lý Người Dùng và Phân Quyền (AuthService, UserService, RoleService):**
    *   [X] Đăng ký tài khoản:
        *   [X] Patient: Sử dụng số điện thoại, xác thực OTP.
        *   [ ] Doctor: (Cân nhắc quy trình riêng, có thể do Admin tạo hoặc tự đăng ký với thông tin cơ bản).
    *   [X] Logic gửi và xác thực OTP qua SMS (tích hợp với một SMS Gateway).
    *   [X] Đăng nhập (generate JWT token).
    *   [X] Lấy thông tin người dùng hiện tại.
    *   [X] Cập nhật thông tin cá nhân (Patient, Doctor).
    *   [X] Quản lý tài khoản người dùng (CRUD cho Admin).
    *   [X] Quản lý vai trò (CRUD cho Admin).
    *   [X] Gán vai trò cho người dùng.
3.  **[HOÀN THÀNH] Module Quản Lý Bác Sĩ (DoctorService):**
    *   [X] Cập nhật thông tin chuyên môn của bác sĩ (bio, kinh nghiệm).
    *   [X] Xem danh sách bác sĩ (có filter, pagination).
    *   [X] Xem chi tiết thông tin bác sĩ.
    *   [X] (Admin) Quản lý thông tin bác sĩ.
4.  **[HOÀN THÀNH] Module Quản Lý Phòng Khám (ClinicService):**
    *   [X] (Admin) Quản lý thông tin phòng khám (CRUD).
    *   [X] (Public) Xem thông tin phòng khám.
5.  **[HOÀN THÀNH] Module Quản Lý Chuyên Khoa (SpecialtyService):**
    *   [X] (Admin) Quản lý chuyên khoa (CRUD).
    *   [X] (Public) Xem danh sách chuyên khoa.
    *   [X] Gán chuyên khoa cho bác sĩ.
6.  **[HOÀN THÀNH] Module Quản Lý Lịch Làm Việc (AvailabilityService, StandardWorkShiftService):**
    *   [X] (Admin) Quản lý ca làm việc chuẩn (`StandardWorkShift`).
    *   [X] (Admin) Tạo khung giờ khả dụng trực tiếp cho bác sĩ.
    *   [X] (Doctor) Xem lịch làm việc của mình.
    *   [X] (Public/Patient) Tìm kiếm khung giờ khả dụng của bác sĩ (theo ngày, chuyên khoa).
7.  **[HOÀN THÀNH] Module Quản Lý Lịch Hẹn (AppointmentService):**
    *   [X] (Patient) Đặt lịch hẹn (chọn bác sĩ, chuyên khoa, khung giờ).
    *   [X] (Patient) Xử lý đặt cọc (liên kết với Momo).
    *   [X] (Patient) Xem lịch sử lịch hẹn.
    *   [X] (Patient) Hủy lịch hẹn (lưu ý chính sách hoàn cọc).
    *   [X] (Doctor) Xem danh sách lịch hẹn đã được đặt với mình.
    *   [X] (Admin) Quản lý toàn bộ lịch hẹn (xác nhận, hủy, theo dõi trạng thái).
    *   [X] (Admin) Cập nhật trạng thái lịch hẹn (Completed, Cancelled_by_Clinic).
    *   [X] Gửi email xác nhận/nhắc nhở lịch hẹn.
    *   [X] (Nếu OTP qua SMS) Gửi thông báo SMS quan trọng (tùy chọn).
8.  **[HOÀN THÀNH] Module Quản Lý Tin Tức/Bài Viết (ArticleService):**
    *   [X] (Admin/Doctor) Tạo/Cập nhật/Xóa bài viết.
    *   [X] (Admin/Doctor) Quản lý trạng thái bài viết (Draft, Published, Archived).
    *   [X] (Public) Xem danh sách bài viết (có filter, pagination).
    *   [X] (Public) Xem chi tiết bài viết.
9.  **[HOÀN THÀNH] Module Cấu Hình Hệ Thống (SystemConfigurationService):**
    *   [X] (Admin) Cập nhật các cấu hình hệ thống (đặt cọc, phí, thông tin Momo).
    *   [X] (Hệ thống) Đọc cấu hình để áp dụng vào các nghiệp vụ.

## Giai Đoạn 3: Xây Dựng Lớp Controller (API Endpoints) [HOÀN THÀNH]

1.  **[HOÀN THÀNH] Thiết kế API endpoints:**
    *   [X] Tuân thủ nguyên tắc RESTful.
    *   [X] Xác định rõ các HTTP methods (GET, POST, PUT, DELETE).
    *   [ ] Versioning API (nếu cần).
2.  **[HOÀN THÀNH] Triển khai Controllers cho từng module:**
    *   [X] `AuthController`
    *   [X] `UserController`
    *   [X] `DoctorController`
    *   [X] `ClinicController`
    *   [X] `SpecialtyController`
    *   [X] `AvailabilityController` (bao gồm `StandardWorkShift`, `AvailabilitySlot`)
    *   [X] `AppointmentController`
    *   [X] `ArticleController`
    *   [X] `SystemConfigurationController`
    *   [X] `RoleController`
    *   [X] `PaymentController`
3.  **[HOÀN THÀNH] Sử dụng DTOs (Data Transfer Objects):**
    *   [X] Định nghĩa các DTO cho request và response để tránh expose trực tiếp entities.
    *   [X] Triển khai mapper (MapStruct/ModelMapper) để chuyển đổi giữa Entity và DTO.
4.  **[HOÀN THÀNH] Validation:**
    *   [X] Áp dụng validation cho request DTOs (sử dụng Bean Validation API - @Valid, @NotNull, @Size, etc.).
5.  **[HOÀN THÀNH] Error Handling:**
    *   [X] Xây dựng Global Exception Handler (@ControllerAdvice) để xử lý các lỗi một cách nhất quán và trả về response lỗi thân thiện.
    *   [X] Định nghĩa các custom exceptions cho các trường hợp nghiệp vụ cụ thể.

## Giai Đoạn 4: Bảo Mật (Spring Security) [HOÀN THÀNH]

1.  **[HOÀN THÀNH] Cấu hình Spring Security:**
    *   [X] Cấu hình `SecurityFilterChain`.
    *   [X] Vô hiệu hóa các cơ chế bảo mật mặc định không cần thiết (ví dụ: form login nếu dùng JWT).
2.  **[HOÀN THÀNH] Triển khai xác thực bằng JWT:**
    *   [X] Tạo `JwtTokenProvider` để generate và validate token.
    *   [X] Tạo `JwtAuthenticationFilter` để xử lý token trong mỗi request.
    *   [X] Cấu hình `UserDetailsService` để tải thông tin người dùng.
    *   [X] Cấu hình `AuthenticationManager`.
3.  **[HOÀN THÀNH] Phân quyền dựa trên vai trò:**
    *   [X] Sử dụng `@PreAuthorize` hoặc cấu hình trong `SecurityFilterChain` để bảo vệ các endpoints theo vai trò (`hasRole('ADMIN')`, `hasAnyRole('DOCTOR', 'PATIENT')`).
4.  **[HOÀN THÀNH] Xử lý mật khẩu:**
    *   [X] Sử dụng `PasswordEncoder` (ví dụ: `BCryptPasswordEncoder`) để mã hóa mật khẩu người dùng.
5.  **[HOÀN THÀNH] CORS Configuration:**
    *   [X] Cấu hình CORS để cho phép frontend truy cập API.

## Giai Đoạn 5: Tích Hợp Thanh Toán Momo & VNPay [HOÀN THÀNH]

1.  **[HOÀN THÀNH] Nghiên cứu tài liệu API:**
    *   [X] Quy trình tạo đơn hàng Momo và VNPay.
    *   [X] Quy trình xác nhận thanh toán (IPN - Instant Payment Notification).
    *   [X] Xử lý các trường hợp thành công, thất bại, hủy.
    *   [X] Deep link support cho mobile apps.
2.  **[HOÀN THÀNH] Triển khai cơ sở hạ tầng Payment:**
    *   [X] Tạo Payment entity với đầy đủ fields.
    *   [X] Tạo PaymentRepository với các query methods phức tạp.
    *   [X] Tạo DTOs: PaymentRequestDTO, PaymentResponseDTO, PaymentCallbackDTO.
    *   [X] Tạo PaymentUtils với utility methods.
    *   [X] Cấu hình PaymentConfig cho Momo và VNPay.
3.  **[HOÀN THÀNH] Triển khai PaymentService:**
    *   [X] PaymentServiceImpl với logic cho cả Momo và VNPay.
    *   [X] Tạo request thanh toán đến payment gateways.
    *   [X] Xử lý callback/IPN từ payment gateways.
    *   [X] Query payment status và verify signatures.
    *   [X] Deep link generation cho mobile apps.
4.  **[HOÀN THÀNH] Triển khai PaymentController:**
    *   [X] API endpoints cho tạo thanh toán.
    *   [X] Callback handlers cho IPN từ payment gateways.
    *   [X] Return URL handlers cho redirect sau thanh toán.
    *   [X] Query status endpoints.
    *   [X] Auto-select payment gateway dựa trên device type.
5.  **[HOÀN THÀNH] Tính năng nâng cao:**
    *   [X] PaymentSchedulerService cho xử lý payment hết hạn.
    *   [X] Retry logic cho failed payments.
    *   [X] Payment statistics và monitoring.
    *   [X] HTML success/failure pages cho return URLs.
6.  **[HOÀN THÀNH] Bảo mật và cấu hình:**
    *   [X] Signature verification cho tất cả callbacks.
    *   [X] IP detection và device type detection.
    *   [X] Security config cho payment callbacks.
    *   [X] Cấu hình sandbox cho development.
    *   [X] RestTemplate và ObjectMapper configuration.

## Giai Đoạn 6: Tích Hợp Email Service [HOÀN THÀNH]

1.  **[HOÀN THÀNH] Cấu hình Spring Mail:**
    *   [X] Thêm dependency `spring-boot-starter-mail`.
    *   [X] Cấu hình thông tin SMTP server trong `application.properties/yml`.
2.  **[HOÀN THÀNH] Triển khai EmailService:**
    *   [X] Hàm gửi email cơ bản.
    *   [X] Sử dụng template engine (Thymeleaf, FreeMarker) để tạo nội dung email HTML (tùy chọn).
3.  **[HOÀN THÀNH] Tích hợp gửi email vào các nghiệp vụ:**
    *   [X] Email chào mừng khi đặt lịch lần đầu tiên (thay thế xác nhận đăng ký).
    *   [X] Xác nhận đặt lịch hẹn.
    *   [X] Nhắc nhở lịch hẹn (có thể cần một cron job/scheduled task).
    *   [X] Thông báo hủy lịch hẹn.
4.  **[HOÀN THÀNH] Cập nhật cho Clerk Authentication:**
    *   [X] Loại bỏ email đăng ký tài khoản (do Clerk quản lý).
    *   [X] Thêm kiểm tra thông tin liên hệ trước khi đặt lịch.
    *   [X] API cập nhật thông tin liên hệ cho người dùng.
    *   [X] Exception handling cho thiếu thông tin liên hệ.
    
## Giai Đoạn 7: Xử Lý Upload File (Nếu có) [SẮP TỚI]

1.  **Lựa chọn giải pháp lưu trữ:**
    *   [ ] Lưu trữ trên server local.
    *   [ ] Sử dụng dịch vụ lưu trữ đám mây (AWS S3, Google Cloud Storage, Cloudinary).
2.  **Triển khai FileUploadService:**
    *   [ ] Hàm lưu file (ảnh đại diện bác sĩ, ảnh bài viết, logo phòng khám).
    *   [ ] Hàm lấy URL của file đã upload.
    *   [ ] Xử lý giới hạn kích thước, loại file.
3.  **Tích hợp vào các module liên quan:**
    *   [ ] `DoctorService` (cập nhật ảnh đại diện).
    *   [ ] `ArticleService` (upload ảnh bài viết).
    *   [ ] `ClinicService` (upload logo).

## Giai Đoạn 8: Testing [SẮP TỚI]

1.  **Unit Tests:**
    *   [ ] Viết unit test cho các phương thức trong lớp Service (sử dụng Mockito để mock dependencies).
    *   [ ] Kiểm tra logic nghiệp vụ, xử lý các trường hợp biên.
2.  **Integration Tests:**
    *   [ ] Viết integration test cho lớp Controller (sử dụng `@SpringBootTest` và `MockMvc`).
    *   [ ] Kiểm tra luồng request-response, validation, error handling.
    *   [ ] Kiểm tra tương tác với database (sử dụng H2 hoặc Testcontainers).
3.  **Kiểm tra API thủ công:**
    *   [ ] Sử dụng Postman hoặc công cụ tương tự để kiểm tra các API endpoints.

## Giai Đoạn 9: Tài Liệu Hóa API [HOÀN THÀNH]

1.  **Sử dụng Swagger/OpenAPI:**
    *   [X] Thêm dependency (springdoc-openapi-starter-webmvc-ui).
    *   [X] Cấu hình cơ bản.
    *   [X] Sử dụng các annotation (`@Operation`, `@Parameter`, `@ApiResponse`, etc.) để mô tả API trong Controller.
    *   [X] Kiểm tra giao diện Swagger UI.

## Giai Đoạn 10: Logging và Monitoring [SẮP TỚI]

1.  **Logging:**
    *   [ ] Cấu hình logging (Logback - mặc định của Spring Boot, hoặc Log4j2).
    *   [ ] Ghi log các thông tin quan trọng, lỗi, sự kiện nghiệp vụ.
    *   [ ] Phân chia log level (INFO, DEBUG, WARN, ERROR).
2.  **Monitoring (Cơ bản):**
    *   [ ] Sử dụng Spring Boot Actuator để theo dõi sức khỏe ứng dụng, metrics.

## Giai Đoạn 11: Tối Ưu Hóa và Đánh Giá Lại [SẮP TỚI]

1.  **Tối ưu hóa truy vấn database:**
    *   [ ] Kiểm tra các truy vấn chậm (sử dụng EXPLAIN).
    *   [ ] Áp dụng indexing phù hợp.
    *   [ ] Cân nhắc sử dụng caching (Spring Cache) cho các dữ liệu ít thay đổi.
2.  **Review code:**
    *   [ ] Đảm bảo code sạch, dễ đọc, tuân thủ coding conventions.
    *   [ ] Phát hiện và sửa các bug tiềm ẩn.
3.  **Kiểm tra hiệu năng (tùy chọn, nếu có yêu cầu):**
    *   [ ] Sử dụng các công cụ như JMeter để kiểm tra tải.

## Giai Đoạn 12: Chuẩn Bị Triển Khai (Deployment) [SẮP TỚI]

1.  **Đóng gói ứng dụng:**
    *   [ ] Tạo file JAR hoặc WAR thực thi.
2.  **Lựa chọn môi trường triển khai:**
    *   [ ] Server vật lý, VPS, Cloud (AWS, Azure, GCP).
    *   [ ] Sử dụng Docker (tạo Dockerfile).
3.  **Cấu hình môi trường production:**
    *   [ ] Database, server port, logging, thông tin Momo, SMTP server.
    *   [ ] Quản lý biến môi trường.
4.  **Triển khai ứng dụng.**
5.  **Cấu hình web server (Nginx, Apache) làm reverse proxy (nếu cần).**
6.  **Cấu hình HTTPS (sử dụng SSL/TLS certificate).**

## Giai Đoạn 13: Bảo Trì và Phát Triển Tiếp [SẮP TỚI]

1.  **Theo dõi log và sửa lỗi phát sinh.**
2.  **Cập nhật phiên bản thư viện, Spring Boot.**
3.  **Phát triển các tính năng mới theo yêu cầu.**

---

**Cập nhật tiến độ (ngày hiện tại):**

*   Đã hoàn thành:
    *   Giai đoạn 0: Chuẩn bị và Thiết kế
    *   Giai đoạn 1: Xây dựng lớp Entity và Repository
    *   Giai đoạn 2: Xây dựng lớp Service (Business Logic)
    *   Giai đoạn 3: Xây dựng lớp Controller (API Endpoints)
    *   Giai đoạn 4: Bảo mật (Spring Security)
    *   Giai đoạn 5: Tích Hợp Thanh Toán Momo & VNPay
    *   Giai đoạn 6: Tích hợp Email Service
    *   Giai đoạn 9: Tài liệu hóa API (Swagger/OpenAPI)
*   Tiếp theo:
    *   Giai đoạn 7: Xử lý Upload File
    *   Giai đoạn 8: Testing
    *   Giai đoạn 10-13: Các giai đoạn còn lại

Dự án đã hoàn thành toàn bộ hệ thống backend cốt lõi với đầy đủ 11 controllers (bao gồm PaymentController) để xử lý tất cả các API endpoints cần thiết cho hệ thống đặt lịch hẹn y tế. Hệ thống thanh toán Momo & VNPay đã được tích hợp hoàn chỉnh với scheduled tasks để xử lý payment hết hạn và deep link support cho mobile apps. Email service đã được cập nhật để tương thích với Clerk authentication.
