package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.AuthResponseDTO;
import com.luanvan.luanvanbackend.dto.LoginRequestDTO;
import com.luanvan.luanvanbackend.dto.PatientRegistrationDTO;
import com.luanvan.luanvanbackend.dto.UserInfoDTO;
import com.luanvan.luanvanbackend.entities.OTP;
import com.luanvan.luanvanbackend.entities.Role;
import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.repositories.OTPRepository;
import com.luanvan.luanvanbackend.repositories.RoleRepository;
import com.luanvan.luanvanbackend.repositories.UserRepository;
import com.luanvan.luanvanbackend.request.LoginRequest;
import com.luanvan.luanvanbackend.request.RegisterRequest;
import com.luanvan.luanvanbackend.request.ResendOTPRequest;
import com.luanvan.luanvanbackend.request.VerifyOTPRequest;
import com.luanvan.luanvanbackend.response.LoginResponse;
import com.luanvan.luanvanbackend.response.RegisterResponse;
import com.luanvan.luanvanbackend.response.ResendOTPResponse;
import com.luanvan.luanvanbackend.response.VerifyOTPResponse;
import com.luanvan.luanvanbackend.security.JwtUtils;
import com.luanvan.luanvanbackend.services.AuthService;
import com.luanvan.luanvanbackend.services.OTPService;
import com.luanvan.luanvanbackend.services.SMSService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OTPRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final OTPService otpService;
    private final SMSService smsService;
    private final AuthenticationManager authenticationManager;

    @Override
    public RegisterResponse register(RegisterRequest request) {
        // Kiểm tra số điện thoại đã tồn tại chưa
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            return RegisterResponse.builder()
                    .success(false)
                    .message("Số điện thoại đã được đăng ký")
                    .build();
        }
        
        // Kiểm tra mật khẩu và xác nhận mật khẩu có khớp nhau
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return RegisterResponse.builder()
                    .success(false)
                    .message("Mật khẩu và xác nhận mật khẩu không khớp")
                    .build();
        }
        
        // Tạo sessionId cho quá trình xác thực OTP
        String sessionId = otpService.generateSessionId();
        
        // Tạo mã OTP và lưu vào cơ sở dữ liệu
        String otp = otpService.generateOTP();
        otpService.saveOTP(request.getPhoneNumber(), otp, sessionId);
        
        // Lưu thông tin user (chưa xác thực) vào database
        User newUser = new User();
        newUser.setPhoneNumber(request.getPhoneNumber());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        newUser.setActive(false); // Chưa kích hoạt cho đến khi xác thực OTP
        newUser.setRegistrationDate(LocalDateTime.now());
        
        // Gán vai trò "PATIENT"
        Role patientRole = roleRepository.findByRoleName("PATIENT")
                .orElseThrow(() -> new RuntimeException("Vai trò PATIENT không tồn tại"));
        newUser.setRole(patientRole);
        
        userRepository.save(newUser);
        
        // Gửi OTP qua SMS
        smsService.sendOTP(request.getPhoneNumber(), otp);
        
        return RegisterResponse.builder()
                .success(true)
                .message("Đăng ký thành công. Vui lòng xác thực OTP để hoàn tất đăng ký.")
                .sessionId(sessionId)
                .build();
    }
    
    @Override
    public VerifyOTPResponse verifyOTP(VerifyOTPRequest request) {
        // Xác thực OTP
        boolean isValid = otpService.verifyOTP(request.getSessionId(), request.getOtp());
        
        if (!isValid) {
            return VerifyOTPResponse.builder()
                    .success(false)
                    .message("Mã OTP không hợp lệ hoặc đã hết hạn")
                    .build();
        }
        
        // Lấy thông tin OTP đã được xác thực
        Optional<OTP> otpOptional = otpRepository.findBySessionId(request.getSessionId());
        if (otpOptional.isEmpty()) {
            return VerifyOTPResponse.builder()
                    .success(false)
                    .message("Phiên xác thực không hợp lệ")
                    .build();
        }
        
        OTP otpEntity = otpOptional.get();
        String phoneNumber = otpEntity.getPhoneNumber();
        
        // Tìm và kích hoạt tài khoản người dùng
        Optional<User> userOptional = userRepository.findByPhoneNumber(phoneNumber);
        if (userOptional.isEmpty()) {
            return VerifyOTPResponse.builder()
                    .success(false)
                    .message("Không tìm thấy tài khoản")
                    .build();
        }
        
        User user = userOptional.get();
        user.setActive(true); // Kích hoạt tài khoản
        userRepository.save(user);
        
        // Tạo JWT token
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getPhoneNumber())
                .password(user.getPasswordHash())
                .authorities("ROLE_" + user.getRole().getRoleName())
                .build();
        
        String token = jwtUtils.generateToken(userDetails);
        
        return VerifyOTPResponse.builder()
                .success(true)
                .message("Xác thực OTP thành công")
                .token(token)
                .build();
    }
    
    @Override
    public ResendOTPResponse resendOTP(ResendOTPRequest request) {
        // Kiểm tra tài khoản có tồn tại không
        if (!userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            return ResendOTPResponse.builder()
                    .success(false)
                    .message("Số điện thoại không tồn tại trong hệ thống")
                    .build();
        }
        
        // Kiểm tra sessionId
        Optional<OTP> existingOTP = otpRepository.findByPhoneNumberAndSessionId(
                request.getPhoneNumber(), request.getSessionId());
        
        if (existingOTP.isEmpty()) {
            return ResendOTPResponse.builder()
                    .success(false)
                    .message("Phiên xác thực không hợp lệ")
                    .build();
        }
        
        // Tạo mã OTP mới
        String newOTP = otpService.generateOTP();
        otpService.saveOTP(request.getPhoneNumber(), newOTP, request.getSessionId());
        
        // Gửi OTP mới qua SMS
        smsService.sendOTP(request.getPhoneNumber(), newOTP);
        
        return ResendOTPResponse.builder()
                .success(true)
                .message("Đã gửi lại mã OTP mới")
                .sessionId(request.getSessionId())
                .build();
    }
    
    @Override
    public LoginResponse login(LoginRequest request) {
        try {
            // Xác thực người dùng
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getPhoneNumber(),
                            request.getPassword()
                    )
            );
            
            // Lưu thông tin xác thực vào SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Lấy thông tin người dùng
            Optional<User> userOptional = userRepository.findByPhoneNumber(request.getPhoneNumber());
            if (userOptional.isEmpty()) {
                return LoginResponse.builder()
                        .success(false)
                        .message("Không tìm thấy tài khoản")
                        .build();
            }
            
            User user = userOptional.get();
            
            // Kiểm tra trạng thái tài khoản đã được kích hoạt chưa
            if (!user.isActive()) {
                return LoginResponse.builder()
                        .success(false)
                        .message("Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP trước.")
                        .build();
            }
            
            // Tạo JWT token
            UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(user.getPhoneNumber())
                    .password(user.getPasswordHash())
                    .authorities("ROLE_" + user.getRole().getRoleName())
                    .build();
            
            String token = jwtUtils.generateToken(userDetails);
            
            // Tạo thông tin cơ bản của người dùng
            UserInfoDTO userInfo = UserInfoDTO.builder()
                    .userId(user.getUserId())
                    .fullName(user.getFullName())
                    .phoneNumber(user.getPhoneNumber())
                    .email(user.getEmail())
                    .role(user.getRole().getRoleName())
                    .build();
            
            return LoginResponse.builder()
                    .success(true)
                    .message("Đăng nhập thành công")
                    .token(token)
                    .userInfo(userInfo)
                    .build();
            
        } catch (Exception e) {
            return LoginResponse.builder()
                    .success(false)
                    .message("Đăng nhập thất bại: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public User registerPatient(PatientRegistrationDTO registrationDTO) {
        // Kiểm tra xem người dùng đã tồn tại chưa
        if (userRepository.existsByPhoneNumber(registrationDTO.getPhoneNumber())) {
            throw new RuntimeException("Số điện thoại đã được đăng ký");
        }
        
        if (registrationDTO.getEmail() != null && !registrationDTO.getEmail().isEmpty() 
                && userRepository.existsByEmail(registrationDTO.getEmail())) {
            throw new RuntimeException("Email đã được đăng ký");
        }
        
        // Tạo user mới
        User newUser = new User();
        newUser.setFullName(registrationDTO.getFullName());
        newUser.setPhoneNumber(registrationDTO.getPhoneNumber());
        newUser.setEmail(registrationDTO.getEmail());
        newUser.setPasswordHash(passwordEncoder.encode(registrationDTO.getPassword()));
        newUser.setDateOfBirth(registrationDTO.getDateOfBirth());
        newUser.setGender(registrationDTO.getGender());
        newUser.setAddress(registrationDTO.getAddress());
        newUser.setRegistrationDate(LocalDateTime.now());
        newUser.setActive(true);
        
        // Gán vai trò "PATIENT"
        Role patientRole = roleRepository.findByRoleName("PATIENT")
                .orElseThrow(() -> new RuntimeException("Vai trò PATIENT không tồn tại"));
        newUser.setRole(patientRole);
        
        // Lưu user mới
        return userRepository.save(newUser);
    }

    @Override
    public boolean sendOTP(String phoneNumber) {
        // TODO: Tích hợp với SMS Gateway để gửi OTP
        // Giả lập thành công
        return true;
    }

    @Override
    public boolean verifyOTP(String phoneNumber, String otpCode) {
        // TODO: Kiểm tra OTP từ hệ thống lưu trữ tạm thời
        // Giả lập thành công
        return true;
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO loginRequest) {
        // TODO: Xác thực người dùng và tạo JWT token
        // Hiện tại chỉ là stub - cần triển khai khi có Spring Security & JWT
        return new AuthResponseDTO("dummy-token", 1L, "Tên người dùng", "email@example.com", 
                loginRequest.getPhoneNumber(), "PATIENT");
    }

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String phoneNumber = authentication.getName();
        return userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));
    }
} 