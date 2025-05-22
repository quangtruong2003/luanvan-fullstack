package com.luanvan.luanvanbackend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import lombok.RequiredArgsConstructor;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@RequiredArgsConstructor
public class JwtUtils {
    private final String secret;
    private final long expiration;
    
    // Tạo token từ thông tin người dùng
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }
    
    // Tạo token từ thông tin người dùng với các claims bổ sung
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return createToken(extraClaims, userDetails.getUsername());
    }
    
    // Tạo token với claims và subject
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }
    
    // Lấy key để ký token
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    // Lấy tất cả claims từ token
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith((Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret))))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    // Trích xuất một claim cụ thể từ token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    // Lấy username từ token
    public String getUsernameFromToken(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    // Lấy thời điểm hết hạn từ token
    public Date getExpirationDateFromToken(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    // Kiểm tra token đã hết hạn chưa
    private boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }
    
    // Kiểm tra token có hợp lệ không (chỉ kiểm tra hết hạn)
    public boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
    
    // Kiểm tra token có hợp lệ cho một UserDetails cụ thể
    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
} 