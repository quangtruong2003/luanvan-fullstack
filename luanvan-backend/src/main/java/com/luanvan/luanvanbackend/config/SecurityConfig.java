package com.luanvan.luanvanbackend.config;

import com.luanvan.luanvanbackend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;
    
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(authz -> authz
                        // Error handling
                        .requestMatchers("/error").permitAll()
                        // CORS preflight requests
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        // Authentication endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        // Public endpoints
                        .requestMatchers("/api/public/**").permitAll()
                        // Payment callbacks (must be accessible without auth)
                        .requestMatchers("/api/payments/momo/callback").permitAll()
                        .requestMatchers("/api/payments/vnpay/callback").permitAll()
                        .requestMatchers("/api/payments/momo/return").permitAll()
                        .requestMatchers("/api/payments/vnpay/return").permitAll()
                        // File downloads (public access)
                        .requestMatchers("/api/files/download/**").permitAll()
                        // Public read-only endpoints for doctors and specialties
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/doctors").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/doctors/*").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/doctors/user/*").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/doctors/search").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/doctors/specialty/*").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/doctors/experience/*").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/doctors/*/specialties").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/specialties").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/specialties/*").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/specialties/all").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/specialties/clinic/*").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/specialties/search").permitAll()
                        // Public read-only endpoints for clinics
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/clinics").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/clinics/*").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/clinics/search").permitAll()
                        // Public read-only endpoints for availability
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/availability/slots").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/availability/slots/*").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/availability/slots/doctor/*").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/availability/slots/doctor/*/date/*").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/availability/slots/doctor/*/range").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/availability/slots/specialty/*/date/*").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/availability/shifts").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/availability/shifts/*").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/availability/shifts/clinic/*").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/availability/shifts/day/*").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/availability/shifts/default").permitAll()
                        // Admin availability endpoints (will be protected by @PreAuthorize)
                        .requestMatchers("/api/availability/admin/**").authenticated()
                        .requestMatchers("/api/availability/slots/clinic/*").authenticated()
                        // Documentation
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/swagger-resources/**").permitAll()
                        .requestMatchers("/webjars/**").permitAll()
                        // Actuator (monitoring)
                        .requestMatchers("/actuator/**").permitAll()
                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Sử dụng biến môi trường để cấu hình CORS origins
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        configuration.setAllowedOrigins(origins);
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
} 