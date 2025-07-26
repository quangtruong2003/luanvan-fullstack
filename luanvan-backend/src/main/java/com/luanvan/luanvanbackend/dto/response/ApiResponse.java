package com.luanvan.luanvanbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Class wrapper chuẩn hóa response từ API
 * @param <T> Kiểu dữ liệu của data trả về
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
} 