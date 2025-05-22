package com.luanvan.luanvanbackend.security;

import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

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
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getPhoneNumber())
                .password(user.getPasswordHash())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().getRoleName())))
                .build();
    }
}