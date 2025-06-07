package com.luanvan.luanvanbackend.services;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeFile(MultipartFile file, String uploadPath);
    Resource loadFileAsResource(String fileName, String uploadPath);
    void deleteFile(String fileName, String uploadPath);
    boolean isAllowedImageFile(String fileName);
    boolean isAllowedDocumentFile(String fileName);
} 