package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.exception.FileStorageException;
import com.luanvan.luanvanbackend.services.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Value("${app.upload.allowed-extensions.images}")
    private String allowedImageExtensions;

    @Value("${app.upload.allowed-extensions.documents}")
    private String allowedDocumentExtensions;

    @Override
    public String storeFile(MultipartFile file, String uploadPath) {
        // Normalize file name
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        
        try {
            // Check if the file's name contains invalid characters
            if (originalFileName.contains("..")) {
                throw new FileStorageException("Sorry! Filename contains invalid path sequence " + originalFileName);
            }

            // Generate unique file name
            String fileExtension = getFileExtension(originalFileName);
            String newFileName = UUID.randomUUID().toString() + "." + fileExtension;

            // Create upload directory if not exists
            Path targetLocation = Paths.get(uploadDir, uploadPath);
            Files.createDirectories(targetLocation);

            // Copy file to the target location
            Path targetFilePath = targetLocation.resolve(newFileName);
            Files.copy(file.getInputStream(), targetFilePath, StandardCopyOption.REPLACE_EXISTING);

            return newFileName;
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    @Override
    public Resource loadFileAsResource(String fileName, String uploadPath) {
        try {
            Path filePath = Paths.get(uploadDir, uploadPath).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return resource;
            } else {
                throw new FileStorageException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new FileStorageException("File not found " + fileName, ex);
        }
    }

    @Override
    public void deleteFile(String fileName, String uploadPath) {
        try {
            Path filePath = Paths.get(uploadDir, uploadPath).resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new FileStorageException("Could not delete file " + fileName, ex);
        }
    }

    @Override
    public boolean isAllowedImageFile(String fileName) {
        String fileExtension = getFileExtension(fileName).toLowerCase();
        List<String> allowedExtensions = Arrays.asList(allowedImageExtensions.split(","));
        return allowedExtensions.contains(fileExtension);
    }

    @Override
    public boolean isAllowedDocumentFile(String fileName) {
        String fileExtension = getFileExtension(fileName).toLowerCase();
        List<String> allowedExtensions = Arrays.asList(allowedDocumentExtensions.split(","));
        return allowedExtensions.contains(fileExtension);
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }
} 