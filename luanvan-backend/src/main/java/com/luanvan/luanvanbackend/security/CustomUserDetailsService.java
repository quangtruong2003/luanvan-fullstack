package com.luanvan.luanvanbackend.security;

import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = findUser(identifier);
        
        // Kiểm tra tài khoản đã được kích hoạt chưa
        if (!user.isActive()) {
            throw new UsernameNotFoundException("Tài khoản chưa được kích hoạt");
        }
        
        return UserPrincipal.create(user);
    }
    
    private User findUser(String identifier) throws UsernameNotFoundException {
        // Thử tìm theo email trước (admin/doctor)
        Optional<User> userByEmail = userRepository.findByEmail(identifier);
        if (userByEmail.isPresent()) {
            return userByEmail.get();
        }
        
        // Nếu không tìm thấy, thử tìm theo phone number (patient)
        Optional<User> userByPhone = userRepository.findByPhoneNumber(identifier);
        if (userByPhone.isPresent()) {
            return userByPhone.get();
        }
        
        // Thử tìm theo Clerk User ID (for JWT validation of Clerk users)
        Optional<User> userByClerkId = userRepository.findByClerkUserId(identifier);
        if (userByClerkId.isPresent()) {
            return userByClerkId.get();
        }
        
        throw new UsernameNotFoundException("Không tìm thấy người dùng với thông tin: " + identifier);
    }
}