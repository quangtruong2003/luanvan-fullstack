# Kế hoạch Fix Bug và Cải thiện Hệ thống

Đây là kế hoạch chi tiết để sửa các lỗi hiện tại và cải thiện các chức năng của hệ thống theo yêu cầu.

## Giai đoạn 1: Sửa lỗi Backend và Tối ưu API Response

Mục tiêu của giai đoạn này là đảm bảo API backend trả về dữ liệu **đầy đủ, chính xác và nhất quán**, tạo tiền đề cho việc sửa lỗi hiển thị trên frontend.

### ✔ Task 1: Cải thiện Module Quản lý Người dùng (User)

-   [x] **Tạo `UserResponseDTO`:** Tạo một Data Transfer Object mới để đóng gói dữ liệu trả về cho User, tránh việc expose toàn bộ Entity.
    -   `userId`, `fullName`, `email`, `phoneNumber`, `imageUrl`
    -   `roleName` (kiểu String) để hiển thị tên vai trò.
    -   `isActive` (kiểu boolean) để thể hiện trạng thái tài khoản.
-   [x] **Cập nhật `UserController`:** Thay đổi các endpoint (đặc biệt là `getAllUsers`) để trả về `Page<UserResponseDTO>` thay vì `Page<User>`.
-   [x] **Cập nhật `UserService`:** Thêm logic chuyển đổi từ `User` entity sang `UserResponseDTO`.
-   [x] **Ghi chú cho Frontend:** Trạng thái `isActive` được trả về dưới dạng boolean (`true`/`false`). Cần đảm bảo logic ở frontend diễn giải đúng: `true` là "Hoạt động", `false` là "Vô hiệu hóa".

### ✔ Task 2: Cải thiện Module Quản lý Phòng khám (Clinic)

-   [x] **Tạo `ClinicResponseDTO`:** Tạo DTO cho Clinic để trả về đầy đủ thông tin.
    -   Bao gồm `clinicId`, `name`, `address`, `email`, và các trường thông tin khác.
    -   Đảm bảo có `phoneNumber` và `workingHours`.
-   [x] **Cập nhật `ClinicController`:** Sửa các endpoint `getAllClinics` và `getClinicById` để trả về `ClinicResponseDTO` / `Page<ClinicResponseDTO>`.
-   [x] **Cập nhật `ClinicService`:** Thêm logic chuyển đổi từ `Clinic` entity sang `ClinicResponseDTO`.

### ✔ Task 3: Cải thiện Module Quản lý Chuyên khoa (Specialty)

-   [x] **Sửa lỗi đếm số lượng bác sĩ:**
    -   Kiểm tra và đảm bảo logic trong `SpecialtyServiceImpl` gọi `doctorSpecialtyRepository.countBySpecialtySpecialtyId()` và gán kết quả cho trường `doctorCount` trong `SpecialtyResponseDTO`.
-   [x] **Triển khai sắp xếp theo `doctorCount`:**
    -   Tạo một phương thức query tùy chỉnh trong `SpecialtyRepository` sử dụng subquery để có thể sắp xếp theo số lượng bác sĩ.
    -   Cập nhật `SpecialtyServiceImpl` để phát hiện yêu cầu sắp xếp theo `doctorCount` từ `Pageable` và gọi phương thức query mới.

### ✔ Task 4: Cải thiện Module Quản lý Bác sĩ (Doctor)

-   [x] **Tối ưu truy vấn Doctor:**
    -   Sửa lại query trong `DoctorRepository` để sử dụng `JOIN FETCH` khi lấy danh sách bác sĩ. Việc này sẽ giải quyết vấn đề `LazyInitializationException` tiềm ẩn và đảm bảo thông tin về `User` và `Specialty` luôn được tải cùng lúc.
-   [x] **Rà soát `DoctorResponseDTO`:** Đảm bảo DTO này đã đầy đủ thông tin cần thiết cho giao diện Admin.

## Giai đoạn 2: Rà soát và Hoàn thiện CRUD

-   [x] **Review `Doctor` CRUD:** Xem xét lại logic create, update, delete để đảm bảo hoạt động chính xác và xử lý các trường hợp biên.
-   [x] **Review `Clinic` CRUD:** Đảm bảo việc update không ghi đè giá trị `null` không mong muốn và logic xóa kiểm tra các ràng buộc (ví dụ: không cho xóa nếu còn chuyên khoa).
-   [x] **Review `Specialty` CRUD:** Kiểm tra logic xóa để đảm bảo không xóa được chuyên khoa nếu vẫn còn bác sĩ thuộc chuyên khoa đó.

## Giai đoạn 3: Frontend (Gợi ý)

Sau khi các thay đổi ở backend hoàn tất, phía frontend cần:

-   [x] Cập nhật các component để gọi API và hiển thị đúng các trường dữ liệu mới/được sửa đổi trong DTOs.
-   [x] Sửa lại logic hiển thị trạng thái `isActive` của User.
-   [x] Kích hoạt lại chức năng sắp xếp trên các cột của bảng (đặc biệt là cột "Số bác sĩ" ở trang Chuyên khoa).
-   [x] Cập nhật giao diện CRUD để tận dụng API đã được cải thiện. 