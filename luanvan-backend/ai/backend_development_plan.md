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
4.  **Lựa chọn công nghệ và thư viện phụ trợ:**
    *   [X] Spring Boot (Core, Web, Data JPA, Security).
    *   [X] Lombok.
    *   [X] MySQL Connector.
    *   [ ] MapStruct (hoặc ModelMapper) cho DTO mapping.
    *   [ ] Swagger/OpenAPI cho tài liệu API.
    *   [ ] JWT cho xác thực.
    *   [ ] Thư viện xử lý thanh toán Momo (nếu có SDK chính thức hoặc qua API).
    *   [ ] Thư viện gửi email (Spring Mail).

## Giai Đoạn 1: Xây Dựng Lớp Entity và Repository

1.  **[HOÀN THÀNH] Triển khai Entities:**
    *   [X] Tạo các class Java cho mỗi entity đã thiết kế (`User`, `Role`, `Doctor`, `Clinic`, `Specialty`, `DoctorSpecialty`, `StandardWorkShift`, `DoctorAvailabilityRequest`, `RequestedSlot`, `AvailabilitySlot`, `Appointment`, `Article`, `SystemConfiguration`).
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
        *   [X] `DoctorAvailabilityRequestRepository`
        *   [X] `RequestedSlotRepository`
        *   [X] `AvailabilitySlotRepository`
        *   [X] `AppointmentRepository`
        *   [X] `ArticleRepository`
        *   [X] `SystemConfigurationRepository`
    *   [X] Định nghĩa các phương thức truy vấn tùy chỉnh nếu cần (sử dụng @Query hoặc Query Methods).

## Giai Đoạn 2: Xây Dựng Lớp Service (Business Logic)

1.  **Thiết kế cấu trúc Service:**
    *   [ ] Tạo interface và class implementation cho mỗi nhóm nghiệp vụ.
2.  **Module Quản Lý Người Dùng và Phân Quyền (AuthService, UserService, RoleService):**
    *   [ ] Đăng ký tài khoản:
        *   [ ] Patient: Sử dụng số điện thoại, xác thực OTP.
        *   [ ] Doctor: (Cân nhắc quy trình riêng, có thể do Admin tạo hoặc tự đăng ký với thông tin cơ bản).
    *   [ ] Logic gửi và xác thực OTP qua SMS (tích hợp với một SMS Gateway).
    *   [ ] Đăng nhập (generate JWT token).
    *   [ ] Lấy thông tin người dùng hiện tại.
    *   [ ] Cập nhật thông tin cá nhân (Patient, Doctor).
    *   [ ] Quản lý tài khoản người dùng (CRUD cho Admin).
    *   [ ] Quản lý vai trò (CRUD cho Admin).
    *   [ ] Gán vai trò cho người dùng.
3.  **Module Quản Lý Bác Sĩ (DoctorService):**
    *   [ ] Cập nhật thông tin chuyên môn của bác sĩ (bio, kinh nghiệm).
    *   [ ] Xem danh sách bác sĩ (có filter, pagination).
    *   [ ] Xem chi tiết thông tin bác sĩ.
    *   [ ] (Admin) Quản lý thông tin bác sĩ.
4.  **Module Quản Lý Phòng Khám (ClinicService):**
    *   [ ] (Admin) Quản lý thông tin phòng khám (CRUD).
    *   [ ] (Public) Xem thông tin phòng khám.
5.  **Module Quản Lý Chuyên Khoa (SpecialtyService):**
    *   [ ] (Admin) Quản lý chuyên khoa (CRUD).
    *   [ ] (Public) Xem danh sách chuyên khoa.
    *   [ ] Gán chuyên khoa cho bác sĩ.
6.  **Module Quản Lý Lịch Làm Việc (AvailabilityService, StandardWorkShiftService):**
    *   [ ] (Admin) Quản lý ca làm việc chuẩn (`StandardWorkShift`).
    *   [ ] (Doctor) Đăng ký/đề xuất lịch làm việc (`DoctorAvailabilityRequest`, `RequestedSlot`).
    *   [ ] (Admin) Xem xét và phê duyệt/từ chối lịch làm việc do bác sĩ đăng ký.
    *   [ ] (Doctor) Xem lịch làm việc đã đăng ký và trạng thái.
    *   [ ] (Hệ thống) Tự động tạo `AvailabilitySlot` khi lịch được duyệt.
    *   [ ] (Public/Patient) Tìm kiếm khung giờ khả dụng của bác sĩ (theo ngày, chuyên khoa).
7.  **Module Quản Lý Lịch Hẹn (AppointmentService):**
    *   [ ] (Patient) Đặt lịch hẹn (chọn bác sĩ, chuyên khoa, khung giờ).
    *   [ ] (Patient) Xử lý đặt cọc (liên kết với Momo).
    *   [ ] (Patient) Xem lịch sử lịch hẹn.
    *   [ ] (Patient) Hủy lịch hẹn (lưu ý chính sách hoàn cọc).
    *   [ ] (Doctor) Xem danh sách lịch hẹn đã được đặt với mình.
    *   [ ] (Admin) Quản lý toàn bộ lịch hẹn (xác nhận, hủy, theo dõi trạng thái).
    *   [ ] (Admin) Cập nhật trạng thái lịch hẹn (Completed, Cancelled_by_Clinic).
    *   [ ] Gửi email xác nhận/nhắc nhở lịch hẹn.
    *   [ ] (Nếu OTP qua SMS) Gửi thông báo SMS quan trọng (tùy chọn).
8.  **Module Quản Lý Tin Tức/Bài Viết (ArticleService):**
    *   [ ] (Admin/Doctor) Tạo/Cập nhật/Xóa bài viết.
    *   [ ] (Admin/Doctor) Quản lý trạng thái bài viết (Draft, Published, Archived).
    *   [ ] (Public) Xem danh sách bài viết (có filter, pagination).
    *   [ ] (Public) Xem chi tiết bài viết.
9.  **Module Cấu Hình Hệ Thống (SystemConfigurationService):**
    *   [ ] (Admin) Cập nhật các cấu hình hệ thống (đặt cọc, phí, thông tin Momo).
    *   [ ] (Hệ thống) Đọc cấu hình để áp dụng vào các nghiệp vụ.

## Giai Đoạn 3: Xây Dựng Lớp Controller (API Endpoints)

1.  **Thiết kế API endpoints:**
    *   [ ] Tuân thủ nguyên tắc RESTful.
    *   [ ] Xác định rõ các HTTP methods (GET, POST, PUT, DELETE).
    *   [ ] Versioning API (nếu cần).
2.  **Triển khai Controllers cho từng module:**
    *   [ ] `AuthController`
    *   [ ] `UserController`
    *   [ ] `DoctorController`
    *   [ ] `ClinicController`
    *   [ ] `SpecialtyController`
    *   [ ] `AvailabilityController` (bao gồm `StandardWorkShift`, `DoctorAvailabilityRequest`, `AvailabilitySlot`)
    *   [ ] `AppointmentController`
    *   [ ] `ArticleController`
    *   [ ] `SystemConfigurationController`
3.  **Sử dụng DTOs (Data Transfer Objects):**
    *   [ ] Định nghĩa các DTO cho request và response để tránh expose trực tiếp entities.
    *   [ ] Triển khai mapper (MapStruct/ModelMapper) để chuyển đổi giữa Entity và DTO.
4.  **Validation:**
    *   [ ] Áp dụng validation cho request DTOs (sử dụng Bean Validation API - @Valid, @NotNull, @Size, etc.).
5.  **Error Handling:**
    *   [ ] Xây dựng Global Exception Handler (@ControllerAdvice) để xử lý các lỗi một cách nhất quán và trả về response lỗi thân thiện.
    *   [ ] Định nghĩa các custom exceptions cho các trường hợp nghiệp vụ cụ thể.

## Giai Đoạn 4: Bảo Mật (Spring Security)

1.  **Cấu hình Spring Security:**
    *   [ ] Cấu hình `SecurityFilterChain`.
    *   [ ] Vô hiệu hóa các cơ chế bảo mật mặc định không cần thiết (ví dụ: form login nếu dùng JWT).
2.  **Triển khai xác thực bằng JWT:**
    *   [ ] Tạo `JwtTokenProvider` để generate và validate token.
    *   [ ] Tạo `JwtAuthenticationFilter` để xử lý token trong mỗi request.
    *   [ ] Cấu hình `UserDetailsService` để tải thông tin người dùng.
    *   [ ] Cấu hình `AuthenticationManager`.
3.  **Phân quyền dựa trên vai trò:**
    *   [ ] Sử dụng `@PreAuthorize` hoặc cấu hình trong `SecurityFilterChain` để bảo vệ các endpoints theo vai trò (`hasRole('ADMIN')`, `hasAnyRole('DOCTOR', 'PATIENT')`).
4.  **Xử lý mật khẩu:**
    *   [ ] Sử dụng `PasswordEncoder` (ví dụ: `BCryptPasswordEncoder`) để mã hóa mật khẩu người dùng.
5.  **CORS Configuration:**
    *   [ ] Cấu hình CORS để cho phép frontend truy cập API.

## Giai Đoạn 5: Tích Hợp Thanh Toán Momo

1.  **Nghiên cứu tài liệu API Momo:**
    *   [ ] Quy trình tạo đơn hàng.
    *   [ ] Quy trình xác nhận thanh toán (IPN - Instant Payment Notification).
    *   [ ] Xử lý các trường hợp thành công, thất bại, hủy.
2.  **Triển khai Service tích hợp Momo:**
    *   [ ] Tạo request thanh toán đến Momo.
    *   [ ] Xử lý callback/IPN từ Momo để cập nhật trạng thái thanh toán của `Appointment`.
    *   [ ] Lưu trữ thông tin giao dịch Momo.
3.  **Bảo mật thông tin Momo:**
    *   [ ] Lưu trữ an toàn các key (PartnerCode, AccessKey, SecretKey) - ưu tiên sử dụng biến môi trường hoặc secret management tools.

## Giai Đoạn 6: Tích Hợp Email Service

1.  **Cấu hình Spring Mail:**
    *   [ ] Thêm dependency `spring-boot-starter-mail`.
    *   [ ] Cấu hình thông tin SMTP server trong `application.properties/yml`.
2.  **Triển khai EmailService:**
    *   [ ] Hàm gửi email cơ bản.
    *   [ ] Sử dụng template engine (Thymeleaf, FreeMarker) để tạo nội dung email HTML (tùy chọn).
3.  **Tích hợp gửi email vào các nghiệp vụ:**
    *   [ ] Xác nhận đăng ký tài khoản.
    *   [ ] Xác nhận đặt lịch hẹn.
    *   [ ] Nhắc nhở lịch hẹn (có thể cần một cron job/scheduled task).
    *   [ ] Thông báo hủy lịch hẹn.
    *   [ ] Thông báo khi lịch làm việc của bác sĩ được duyệt/từ chối.

## Giai Đoạn 6.1: Tích Hợp SMS Gateway (Cho OTP và Thông Báo nếu cần)

1.  **Lựa chọn nhà cung cấp SMS Gateway:**
    *   [ ] Nghiên cứu các nhà cung cấp (ví dụ: Twilio, Vonage, các nhà cung cấp Việt Nam).
    *   [ ] So sánh chi phí, độ tin cậy, tài liệu API.
2.  **Triển khai Service gửi SMS:**
    *   [ ] Tạo `SmsService`.
    *   [ ] Hàm gửi tin nhắn SMS (bao gồm mã OTP).
    *   [ ] Xử lý các phản hồi từ SMS Gateway.
3.  **Tích hợp vào các nghiệp vụ:**
    *   [ ] Gửi OTP khi đăng ký Patient.
    *   [ ] (Tùy chọn) Gửi thông báo SMS quan trọng (ví dụ: xác nhận lịch hẹn khẩn, thay đổi đột xuất).

## Giai Đoạn 7: Xử Lý Upload File (Nếu có)

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

## Giai Đoạn 8: Testing

1.  **Unit Tests:**
    *   [ ] Viết unit test cho các phương thức trong lớp Service (sử dụng Mockito để mock dependencies).
    *   [ ] Kiểm tra logic nghiệp vụ, xử lý các trường hợp biên.
2.  **Integration Tests:**
    *   [ ] Viết integration test cho lớp Controller (sử dụng `@SpringBootTest` và `MockMvc`).
    *   [ ] Kiểm tra luồng request-response, validation, error handling.
    *   [ ] Kiểm tra tương tác với database (sử dụng H2 hoặc Testcontainers).
3.  **Kiểm tra API thủ công:**
    *   [ ] Sử dụng Postman hoặc công cụ tương tự để kiểm tra các API endpoints.

## Giai Đoạn 9: Tài Liệu Hóa API

1.  **Sử dụng Swagger/OpenAPI:**
    *   [ ] Thêm dependency (springdoc-openapi-starter-webmvc-ui).
    *   [ ] Cấu hình cơ bản.
    *   [ ] Sử dụng các annotation (`@Operation`, `@Parameter`, `@ApiResponse`, etc.) để mô tả API trong Controller.
    *   [ ] Kiểm tra giao diện Swagger UI.

## Giai Đoạn 10: Logging và Monitoring

1.  **Logging:**
    *   [ ] Cấu hình logging (Logback - mặc định của Spring Boot, hoặc Log4j2).
    *   [ ] Ghi log các thông tin quan trọng, lỗi, sự kiện nghiệp vụ.
    *   [ ] Phân chia log level (INFO, DEBUG, WARN, ERROR).
2.  **Monitoring (Cơ bản):**
    *   [ ] Sử dụng Spring Boot Actuator để theo dõi sức khỏe ứng dụng, metrics.

## Giai Đoạn 11: Tối Ưu Hóa và Đánh Giá Lại

1.  **Tối ưu hóa truy vấn database:**
    *   [ ] Kiểm tra các truy vấn chậm (sử dụng EXPLAIN).
    *   [ ] Áp dụng indexing phù hợp.
    *   [ ] Cân nhắc sử dụng caching (Spring Cache) cho các dữ liệu ít thay đổi.
2.  **Review code:**
    *   [ ] Đảm bảo code sạch, dễ đọc, tuân thủ coding conventions.
    *   [ ] Phát hiện và sửa các bug tiềm ẩn.
3.  **Kiểm tra hiệu năng (tùy chọn, nếu có yêu cầu):**
    *   [ ] Sử dụng các công cụ như JMeter để kiểm tra tải.

## Giai Đoạn 12: Chuẩn Bị Triển Khai (Deployment)

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

## Giai Đoạn 13: Bảo Trì và Phát Triển Tiếp

1.  **Theo dõi log và sửa lỗi phát sinh.**
2.  **Cập nhật phiên bản thư viện, Spring Boot.**
3.  **Phát triển các tính năng mới theo yêu cầu.**

---

**Ghi chú:**

*   Đây là kế hoạch chi tiết, một số mục có thể được gộp hoặc điều chỉnh tùy theo tiến độ và yêu cầu cụ thể của dự án.
*   Ưu tiên hoàn thành các module cốt lõi trước, sau đó đến các tính năng phụ trợ.
*   Thường xuyên kiểm thử và tích hợp để phát hiện sớm các vấn đề.
*   Luôn giữ tài liệu (API, thiết kế) được cập nhật.
