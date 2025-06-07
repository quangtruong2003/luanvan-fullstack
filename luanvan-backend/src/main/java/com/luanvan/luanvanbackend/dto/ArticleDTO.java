package com.luanvan.luanvanbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleDTO {
    
    @NotBlank(message = "Tiêu đề bài viết không được để trống")
    @Size(min = 5, max = 200, message = "Tiêu đề phải từ 5-200 ký tự")
    private String title;
    
    @NotBlank(message = "Nội dung bài viết không được để trống")
    @Size(min = 50, max = 10000, message = "Nội dung phải từ 50-10000 ký tự")
    private String content;
    
    @Size(max = 500, message = "URL hình ảnh không được vượt quá 500 ký tự")
    private String imageURL;
    
    @Size(max = 50, message = "Danh mục không được vượt quá 50 ký tự")
    private String category;
    
    @Pattern(regexp = "^(DRAFT|PUBLISHED|ARCHIVED)$", message = "Trạng thái phải là DRAFT, PUBLISHED hoặc ARCHIVED")
    private String status;
} 