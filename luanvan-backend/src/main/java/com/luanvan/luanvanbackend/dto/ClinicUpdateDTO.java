package com.luanvan.luanvanbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClinicUpdateDTO {
    
    @Size(min = 2, max = 200, message = "Tên phòng khám phải từ 2-200 ký tự")
    private String name;
    
    @Size(min = 10, max = 500, message = "Địa chỉ phải từ 10-500 ký tự")
    private String address;
    
    @Pattern(regexp = "^[0-9+\\-\\s()]{10,15}$", message = "Số điện thoại không hợp lệ")
    private String phoneNumber;
    
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự")
    private String description;
    
    @Size(max = 200, message = "Giờ làm việc không được vượt quá 200 ký tự")
    private String workingHours;
    
    @Size(max = 2000, message = "Lịch sử không được vượt quá 2000 ký tự")
    private String history;
    
    @Size(max = 1000, message = "Tầm nhìn không được vượt quá 1000 ký tự")
    private String vision;
    
    @Size(max = 1000, message = "Sứ mệnh không được vượt quá 1000 ký tự")
    private String mission;
    
    @Size(max = 1000, message = "Giá trị cốt lõi không được vượt quá 1000 ký tự")
    private String coreValues;
    
    @Size(max = 2000, message = "Mô tả cơ sở vật chất không được vượt quá 2000 ký tự")
    private String facilitiesDescription;
    
    @Size(max = 2000, message = "Mô tả thiết bị không được vượt quá 2000 ký tự")
    private String equipmentDescription;
} 