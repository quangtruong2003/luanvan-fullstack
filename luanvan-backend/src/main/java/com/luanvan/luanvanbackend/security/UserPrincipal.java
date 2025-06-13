package com.luanvan.luanvanbackend.security;

import com.luanvan.luanvanbackend.entities.User;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Data
@RequiredArgsConstructor
public class UserPrincipal implements UserDetails {
    private final Long userId;
    private final String phoneNumber;
    private final String passwordHash;
    private final String roleName;
    private final boolean isActive;
    private final String fullName;
    private final String email;

    public static UserPrincipal create(User user) {
        return new UserPrincipal(
                user.getUserId(),
                user.getPhoneNumber(),
                user.getPasswordHash() != null ? user.getPasswordHash() : "CLERK_MANAGED_AUTH",
                user.getRole().getRoleName(),
                user.isActive(),
                user.getFullName(),
                user.getEmail()
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + roleName));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return phoneNumber;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }
} 