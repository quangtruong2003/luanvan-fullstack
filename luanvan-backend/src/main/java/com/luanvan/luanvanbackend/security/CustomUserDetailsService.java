package com.luanvan.luanvanbackend.security;

import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String phoneNumber) throws UsernameNotFoundException {
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với số điện thoại: " + phoneNumber));
        
        // Kiểm tra tài khoản đã được kích hoạt chưa
        if (!user.isActive()) {
            throw new UsernameNotFoundException("Tài khoản chưa được kích hoạt");
        }
        
        return UserPrincipal.create(user);
    }
}