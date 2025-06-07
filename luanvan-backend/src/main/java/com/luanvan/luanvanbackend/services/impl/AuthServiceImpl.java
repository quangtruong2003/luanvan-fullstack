package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.AuthResponseDTO;
import com.luanvan.luanvanbackend.dto.LoginRequestDTO;
import com.luanvan.luanvanbackend.dto.PatientRegistrationDTO;
import com.luanvan.luanvanbackend.dto.UserInfoDTO;
import com.luanvan.luanvanbackend.entities.Role;
import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.repositories.RoleRepository;
import com.luanvan.luanvanbackend.repositories.UserRepository;
import com.luanvan.luanvanbackend.request.LoginRequest;
import com.luanvan.luanvanbackend.request.ClerkUserSyncRequest;
import com.luanvan.luanvanbackend.request.UserCreateRequest;
import com.luanvan.luanvanbackend.response.LoginResponse;
import com.luanvan.luanvanbackend.response.ClerkUserSyncResponse;
import com.luanvan.luanvanbackend.response.UserCreateResponse;
import com.luanvan.luanvanbackend.security.JwtUtils;
import com.luanvan.luanvanbackend.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);
    
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
                        .token(null)
                        .userInfo(null)
                        .build();
            }
            
            User user = userOptional.get();
            
            // Kiểm tra trạng thái tài khoản đã được kích hoạt chưa
            if (!user.isActive()) {
                return LoginResponse.builder()
                        .success(false)
                        .message("Tài khoản chưa được kích hoạt")
                        .token(null)
                        .userInfo(null)
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
            logger.error("Login failed: {}", e.getMessage(), e);
            return LoginResponse.builder()
                    .success(false)
                    .message("Đăng nhập thất bại: " + e.getMessage())
                    .token(null)
                    .userInfo(null)
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
    
    @Override
    public UserCreateResponse createUser(UserCreateRequest request) {
        logger.info("Tạo tài khoản mới với vai trò: {}", request.getRole());
        
        try {
            // Tự động tạo default roles nếu chưa tồn tại
            createDefaultRolesIfNotExist();
            
            // Kiểm tra tên đăng nhập đã tồn tại chưa
            if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                return UserCreateResponse.builder()
                        .success(false)
                        .message("Tên đăng nhập/Số điện thoại đã được sử dụng")
                        .build();
            }
            
            // Kiểm tra email đã tồn tại chưa
            if (request.getEmail() != null && !request.getEmail().isEmpty() 
                    && userRepository.existsByEmail(request.getEmail())) {
                return UserCreateResponse.builder()
                        .success(false)
                        .message("Email đã được sử dụng")
                        .build();
            }
            
            // Kiểm tra role hợp lệ (ADMIN hoặc DOCTOR)
            String roleName = request.getRole().toUpperCase();
            if (!roleName.equals("ADMIN") && !roleName.equals("DOCTOR")) {
                return UserCreateResponse.builder()
                        .success(false)
                        .message("Vai trò không hợp lệ. Chỉ chấp nhận ADMIN hoặc DOCTOR")
                        .build();
            }
            
            // Tìm role từ database
            Role role = roleRepository.findByRoleName(roleName)
                    .orElseThrow(() -> new RuntimeException("Vai trò " + roleName + " không tồn tại"));
            
            // Tạo user mới
            User newUser = new User();
            newUser.setPhoneNumber(request.getPhoneNumber());
            newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            newUser.setFullName(request.getFullName());
            newUser.setEmail(request.getEmail());
            newUser.setRole(role);
            newUser.setActive(true);
            newUser.setRegistrationDate(LocalDateTime.now());
            
            // Lưu user mới vào database
            User savedUser = userRepository.save(newUser);
            
            return UserCreateResponse.builder()
                    .success(true)
                    .message("Tạo tài khoản " + roleName + " thành công")
                    .userId(savedUser.getUserId())
                    .fullName(savedUser.getFullName())
                    .email(savedUser.getEmail())
                    .role(savedUser.getRole().getRoleName())
                    .build();
            
        } catch (Exception e) {
            logger.error("Lỗi khi tạo tài khoản mới: {}", e.getMessage(), e);
            return UserCreateResponse.builder()
                    .success(false)
                    .message("Lỗi khi tạo tài khoản: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public UserCreateResponse createFirstAdmin(UserCreateRequest request) {
        logger.info("Tạo tài khoản ADMIN đầu tiên: {}", request.getPhoneNumber());
        
        try {
            // Tự động tạo default roles nếu chưa tồn tại
            createDefaultRolesIfNotExist();
            
            // Kiểm tra xem đã có tài khoản ADMIN nào chưa
            Role adminRole = roleRepository.findByRoleName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Vai trò ADMIN không tồn tại"));
            
            long adminCount = userRepository.countByRole(adminRole);
            if (adminCount > 0) {
                return UserCreateResponse.builder()
                        .success(false)
                        .message("Đã tồn tại tài khoản ADMIN trong hệ thống. Vui lòng sử dụng tài khoản ADMIN hiện có để tạo tài khoản mới.")
                        .build();
            }
            
            // Kiểm tra tên đăng nhập đã tồn tại chưa
            if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                return UserCreateResponse.builder()
                        .success(false)
                        .message("Tên đăng nhập/Số điện thoại đã được sử dụng")
                        .build();
            }
            
            // Kiểm tra email đã tồn tại chưa
            if (request.getEmail() != null && !request.getEmail().isEmpty() 
                    && userRepository.existsByEmail(request.getEmail())) {
                return UserCreateResponse.builder()
                        .success(false)
                        .message("Email đã được sử dụng")
                        .build();
            }
            
            // Tạo user mới
            User newUser = new User();
            newUser.setPhoneNumber(request.getPhoneNumber());
            newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            newUser.setFullName(request.getFullName());
            newUser.setEmail(request.getEmail());
            newUser.setRole(adminRole);
            newUser.setActive(true);
            newUser.setRegistrationDate(LocalDateTime.now());
            
            // Lưu user mới vào database
            User savedUser = userRepository.save(newUser);
            
            return UserCreateResponse.builder()
                    .success(true)
                    .message("Tạo tài khoản ADMIN đầu tiên thành công")
                    .userId(savedUser.getUserId())
                    .fullName(savedUser.getFullName())
                    .email(savedUser.getEmail())
                    .role(savedUser.getRole().getRoleName())
                    .build();
            
        } catch (Exception e) {
            logger.error("Lỗi khi tạo tài khoản ADMIN đầu tiên: {}", e.getMessage(), e);
            return UserCreateResponse.builder()
                    .success(false)
                    .message("Lỗi khi tạo tài khoản: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Tạo các roles mặc định nếu chúng chưa tồn tại
     */
    private void createDefaultRolesIfNotExist() {
        String[] defaultRoles = {"ADMIN", "DOCTOR", "PATIENT"};
        
        for (String roleName : defaultRoles) {
            if (!roleRepository.findByRoleName(roleName).isPresent()) {
                Role role = new Role();
                role.setRoleName(roleName);
                roleRepository.save(role);
                logger.info("Đã tạo role mặc định: {}", roleName);
            }
        }
    }

    @Override
    public ClerkUserSyncResponse syncClerkUser(ClerkUserSyncRequest request) {
        Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);
        logger.info("Syncing user from Clerk. ClerkUserId: {}, Email: {}", request.getClerkUserId(), request.getEmail());
        
        try {
            // Tự động tạo default roles nếu chưa tồn tại
            createDefaultRolesIfNotExist();
            
            // Kiểm tra xem user đã tồn tại chưa dựa trên Clerk ID
            Optional<User> existingUser = userRepository.findByClerkUserId(request.getClerkUserId());
            
            if (existingUser.isPresent()) {
                // User đã tồn tại, cập nhật thông tin
                User user = existingUser.get();
                logger.info("Found existing user with ID: {}, updating information", user.getUserId());
                
                user.setEmail(request.getEmail());
                user.setFullName((request.getFirstName() + " " + request.getLastName()).trim());
                user.setPhoneNumber(request.getPhoneNumber());
                user.setImageUrl(request.getImageUrl());
                
                User savedUser = userRepository.save(user);
                logger.info("User updated successfully. UserId: {}", savedUser.getUserId());
                
                return ClerkUserSyncResponse.builder()
                        .success(true)
                        .message("Cập nhật thông tin người dùng thành công")
                        .userId(savedUser.getUserId())
                        .fullName(savedUser.getFullName())
                        .email(savedUser.getEmail())
                        .isNewUser(false)
                        .build();
            } else {
                // Kiểm tra xem có user nào với email này không
                Optional<User> userWithEmail = userRepository.findByEmail(request.getEmail());
                
                if (userWithEmail.isPresent()) {
                    // Đã có user với email này, cập nhật ClerkUserId cho user này
                    User user = userWithEmail.get();
                    logger.info("Found existing user with email: {}, updating with ClerkUserId", request.getEmail());
                    
                    user.setClerkUserId(request.getClerkUserId());
                    user.setFullName((request.getFirstName() + " " + request.getLastName()).trim());
                    user.setPhoneNumber(request.getPhoneNumber());
                    user.setImageUrl(request.getImageUrl());
                    
                    User savedUser = userRepository.save(user);
                    logger.info("Updated existing user with ClerkUserId. UserId: {}", savedUser.getUserId());
                    
                    return ClerkUserSyncResponse.builder()
                            .success(true)
                            .message("Liên kết tài khoản hiện có với Clerk thành công")
                            .userId(savedUser.getUserId())
                            .fullName(savedUser.getFullName())
                            .email(savedUser.getEmail())
                            .isNewUser(false)
                            .build();
                } else {
                    // Tạo user mới
                    logger.info("No existing user found for ClerkUserId or email, creating new user");
                    User newUser = new User();
                    newUser.setClerkUserId(request.getClerkUserId());
                    newUser.setEmail(request.getEmail());
                    newUser.setFullName((request.getFirstName() + " " + request.getLastName()).trim());
                    newUser.setPhoneNumber(request.getPhoneNumber());
                    newUser.setImageUrl(request.getImageUrl());
                    newUser.setRegistrationDate(LocalDateTime.now());
                    newUser.setActive(true);
                    
                    // Gán vai trò "PATIENT" mặc định
                    Role patientRole = roleRepository.findByRoleName("PATIENT")
                            .orElseThrow(() -> new RuntimeException("Vai trò PATIENT không tồn tại"));
                    logger.info("Assigning PATIENT role (ID: {}) to new user", patientRole.getRoleId());
                    newUser.setRole(patientRole);
                    
                    User savedUser = userRepository.save(newUser);
                    logger.info("New user created successfully. UserId: {}", savedUser.getUserId());
                    
                    return ClerkUserSyncResponse.builder()
                            .success(true)
                            .message("Tạo tài khoản mới thành công")
                            .userId(savedUser.getUserId())
                            .fullName(savedUser.getFullName())
                            .email(savedUser.getEmail())
                            .isNewUser(true)
                            .build();
                }
            }
        } catch (Exception e) {
            logger.error("Error syncing user from Clerk: {}", e.getMessage(), e);
            return ClerkUserSyncResponse.builder()
                    .success(false)
                    .message("Đồng bộ thông tin người dùng thất bại: " + e.getMessage())
                    .build();
        }
    }
} 