# Kế Hoạch Triển Khai Đăng Nhập & Đăng Ký Tài Khoản Người Dùng

## 1. Tổng Quan

Hệ thống cần triển khai tính năng đăng ký và đăng nhập người dùng với xác thực số điện thoại qua OTP. Quá trình này sẽ bao gồm:
- Đăng ký với số điện thoại và mật khẩu
- Gửi và xác thực OTP
- Đăng nhập với số điện thoại và mật khẩu
- Sinh JWT token sau khi đăng nhập thành công

## 2. API Endpoints

### Đăng Ký
- `POST /api/auth/register`: Đăng ký tài khoản mới
- `POST /api/auth/verify-otp`: Xác thực OTP
- `POST /api/auth/resend-otp`: Gửi lại OTP

### Đăng Nhập
- `POST /api/auth/login`: Đăng nhập và nhận JWT token

## 3. Chi Tiết Triển Khai

### 3.1. Đăng Ký Tài Khoản

#### Model Request
```java
public class RegisterRequest {
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "Số điện thoại không hợp lệ")
    private String phoneNumber;
    
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
    private String password;
    
    @NotBlank(message = "Xác nhận mật khẩu không được để trống")
    private String confirmPassword;
}
```

#### Model Response
```java
public class RegisterResponse {
    private boolean success;
    private String message;
    private String sessionId; // Sử dụng để liên kết với quá trình xác thực OTP
}
```

#### Luồng xử lý
1. Kiểm tra số điện thoại đã tồn tại trong hệ thống chưa
2. Kiểm tra mật khẩu và xác nhận mật khẩu có khớp nhau
3. Sinh mã OTP ngẫu nhiên (6 chữ số)
4. Lưu thông tin người dùng với trạng thái "chưa xác thực" vào database
5. Gửi OTP qua SMS đến số điện thoại người dùng
6. Trả về response thành công với sessionId

### 3.2. Xác Thực OTP

#### Model Request
```java
public class VerifyOTPRequest {
    @NotBlank(message = "Mã OTP không được để trống")
    @Size(min = 6, max = 6, message = "Mã OTP phải có 6 chữ số")
    private String otp;
    
    @NotBlank(message = "SessionId không được để trống")
    private String sessionId;
}
```

#### Model Response
```java
public class VerifyOTPResponse {
    private boolean success;
    private String message;
    private String token; // JWT token nếu xác thực thành công
}
```

#### Luồng xử lý
1. Kiểm tra sessionId và lấy thông tin người dùng tương ứng
2. Kiểm tra mã OTP có khớp và còn hiệu lực (thường trong 5-10 phút)
3. Nếu hợp lệ, cập nhật trạng thái người dùng thành "đã xác thực"
4. Tạo JWT token
5. Trả về response thành công kèm token

### 3.3. Gửi Lại OTP

#### Model Request
```java
public class ResendOTPRequest {
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "Số điện thoại không hợp lệ")
    private String phoneNumber;
    
    @NotBlank(message = "SessionId không được để trống")
    private String sessionId;
}
```

#### Model Response
```java
public class ResendOTPResponse {
    private boolean success;
    private String message;
    private String sessionId; // Có thể là sessionId mới
}
```

#### Luồng xử lý
1. Kiểm tra sessionId hợp lệ
2. Sinh mã OTP mới
3. Cập nhật OTP và thời gian hiệu lực mới trong cơ sở dữ liệu
4. Gửi OTP mới qua SMS
5. Trả về response thành công

### 3.4. Đăng Nhập

#### Model Request
```java
public class LoginRequest {
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "Số điện thoại không hợp lệ")
    private String phoneNumber;
    
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
}
```

#### Model Response
```java
public class LoginResponse {
    private boolean success;
    private String message;
    private String token;
    private UserInfoDTO userInfo; // Thông tin cơ bản của người dùng
}
```

#### Luồng xử lý
1. Kiểm tra số điện thoại có tồn tại trong hệ thống
2. Kiểm tra mật khẩu có khớp với dữ liệu đã lưu (đã mã hóa)
3. Kiểm tra trạng thái tài khoản đã được xác thực chưa
4. Nếu tất cả hợp lệ, tạo JWT token
5. Trả về response thành công kèm token và thông tin cơ bản của người dùng

## 4. Triển Khai Xác Thực OTP qua SMS

### 4.1. Lựa Chọn Nhà Cung Cấp
Lựa chọn một trong những nhà cung cấp dịch vụ SMS Gateway sau:
- SpeedSMS
- Twilio
- Viettel SMS Gateway
- Tiniyo

### 4.2. Tạo Service Gửi SMS
```java
@Service
public class SMSService {
    // Cấu hình từ application.properties
    @Value("${sms.api.url}")
    private String apiUrl;
    
    @Value("${sms.api.key}")
    private String apiKey;
    
    // Phương thức gửi SMS
    public boolean sendSMS(String phoneNumber, String message) {
        // Triển khai gọi API của nhà cung cấp SMS
    }
    
    // Phương thức gửi OTP
    public boolean sendOTP(String phoneNumber, String otp) {
        String message = "Mã xác thực OTP của bạn là: " + otp + ". Mã có hiệu lực trong 5 phút.";
        return sendSMS(phoneNumber, message);
    }
}
```

### 4.3. Tạo OTP Service
```java
@Service
public class OTPService {
    // Sinh mã OTP ngẫu nhiên
    public String generateOTP() {
        // Sinh 6 chữ số ngẫu nhiên
    }
    
    // Lưu OTP vào database với thời gian hiệu lực
    public void saveOTP(String phoneNumber, String otp, String sessionId) {
        // Lưu vào cơ sở dữ liệu hoặc cache (Redis)
    }
    
    // Xác thực OTP
    public boolean verifyOTP(String sessionId, String otp) {
        // Kiểm tra OTP có khớp và còn hiệu lực
    }
}
```

## 5. Bảo Mật và JWT

### 5.1. Cấu Hình JWT
```java
@Configuration
public class JwtConfig {
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private long expiration;
    
    // Cấu hình JWT Utils
    @Bean
    public JwtUtils jwtUtils() {
        return new JwtUtils(secret, expiration);
    }
}
```

### 5.2. Triển Khai JWT Utils
```java
public class JwtUtils {
    private String secret;
    private long expiration;
    
    // Constructor
    
    // Tạo token từ thông tin người dùng
    public String generateToken(UserDetails userDetails) {
        // Triển khai tạo token
    }
    
    // Kiểm tra token có hợp lệ
    public boolean validateToken(String token, UserDetails userDetails) {
        // Kiểm tra token
    }
    
    // Lấy username từ token
    public String getUsernameFromToken(String token) {
        // Trích xuất thông tin từ token
    }
}
```

### 5.3. Cấu Hình Spring Security
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeRequests()
            .antMatchers("/api/auth/**").permitAll()
            .anyRequest().authenticated()
            .and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    // Cấu hình các bean liên quan đến bảo mật
}
```

## 6. Triển Khai Controller

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    // Các service liên quan
    
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        // Triển khai đăng ký
    }
    
    @PostMapping("/verify-otp")
    public ResponseEntity<VerifyOTPResponse> verifyOTP(@Valid @RequestBody VerifyOTPRequest request) {
        // Triển khai xác thực OTP
    }
    
    @PostMapping("/resend-otp")
    public ResponseEntity<ResendOTPResponse> resendOTP(@Valid @RequestBody ResendOTPRequest request) {
        // Triển khai gửi lại OTP
    }
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        // Triển khai đăng nhập
    }
}
```

## 7. Các Entity và Repository Cần Thiết

### 7.1. Cập Nhật User Entity (Nếu Cần)
```java
public class User {
    // Thêm các trường mới (nếu cần)
    private boolean isVerified; // Trạng thái xác thực
}
```

### 7.2. OTP Entity
```java
@Entity
public class OTP {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String phoneNumber;
    private String otpValue;
    private String sessionId;
    private LocalDateTime expiryTime;
    private boolean isVerified;
}
```

### 7.3. OTP Repository
```java
public interface OTPRepository extends JpaRepository<OTP, Long> {
    Optional<OTP> findBySessionId(String sessionId);
    Optional<OTP> findByPhoneNumberAndSessionId(String phoneNumber, String sessionId);
}
```

## 8. Kế Hoạch Testing

### 8.1. Unit Tests
- Test AuthService
- Test OTPService
- Test SMSService
- Test JwtUtils

### 8.2. Integration Tests
- Test luồng đăng ký, xác thực OTP, đăng nhập
- Test các trường hợp lỗi: số điện thoại đã tồn tại, OTP không khớp, OTP hết hạn...

### 8.3. API Tests
- Sử dụng Postman/cURL để kiểm tra các API endpoints

## 9. Tiến Độ Triển Khai

1. Cấu hình cơ sở dữ liệu và entities (1 ngày)
2. Triển khai SMS Service và OTP Service (2 ngày)
3. Triển khai JWT và Spring Security (2 ngày)
4. Triển khai Controllers và API endpoints (2 ngày)
5. Testing và sửa lỗi (2 ngày)

Tổng thời gian ước tính: 9 ngày làm việc 