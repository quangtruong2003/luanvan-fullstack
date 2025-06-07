package com.luanvan.luanvanbackend.controllers;

import com.luanvan.luanvanbackend.exception.FileStorageException;
import com.luanvan.luanvanbackend.response.FileUploadResponse;
import com.luanvan.luanvanbackend.services.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "File Management", description = "APIs for file upload and download")
@SecurityRequirement(name = "bearerAuth")
public class FileController {

    private final FileStorageService fileStorageService;

    @Value("${app.upload.path.profile-pictures}")
    private String profilePicturesPath;

    @Value("${app.upload.path.articles}")
    private String articlesPath;

    @Value("${app.upload.path.clinics}")
    private String clinicsPath;

    @PostMapping("/upload/profile-picture")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT', 'ADMIN')")
    @Operation(summary = "Upload profile picture")
    public ResponseEntity<FileUploadResponse> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        if (!fileStorageService.isAllowedImageFile(file.getOriginalFilename())) {
            throw new FileStorageException("Only image files are allowed for profile pictures");
        }

        String fileName = fileStorageService.storeFile(file, profilePicturesPath);
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/files/download/profile-pictures/")
                .path(fileName)
                .toUriString();

        return ResponseEntity.ok(FileUploadResponse.builder()
                .fileName(fileName)
                .fileDownloadUri(fileDownloadUri)
                .fileType(file.getContentType())
                .size(file.getSize())
                .build());
    }

    @PostMapping("/upload/article-image")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Upload article image")
    public ResponseEntity<FileUploadResponse> uploadArticleImage(@RequestParam("file") MultipartFile file) {
        if (!fileStorageService.isAllowedImageFile(file.getOriginalFilename())) {
            throw new FileStorageException("Only image files are allowed for articles");
        }

        String fileName = fileStorageService.storeFile(file, articlesPath);
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/files/download/articles/")
                .path(fileName)
                .toUriString();

        return ResponseEntity.ok(FileUploadResponse.builder()
                .fileName(fileName)
                .fileDownloadUri(fileDownloadUri)
                .fileType(file.getContentType())
                .size(file.getSize())
                .build());
    }

    @PostMapping("/upload/clinic-logo")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload clinic logo")
    public ResponseEntity<FileUploadResponse> uploadClinicLogo(@RequestParam("file") MultipartFile file) {
        if (!fileStorageService.isAllowedImageFile(file.getOriginalFilename())) {
            throw new FileStorageException("Only image files are allowed for clinic logos");
        }

        String fileName = fileStorageService.storeFile(file, clinicsPath);
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/files/download/clinics/")
                .path(fileName)
                .toUriString();

        return ResponseEntity.ok(FileUploadResponse.builder()
                .fileName(fileName)
                .fileDownloadUri(fileDownloadUri)
                .fileType(file.getContentType())
                .size(file.getSize())
                .build());
    }

    @GetMapping("/download/profile-pictures/{fileName:.+}")
    @Operation(summary = "Download profile picture")
    public ResponseEntity<Resource> downloadProfilePicture(@PathVariable String fileName, HttpServletRequest request) {
        return downloadFile(fileName, profilePicturesPath, request);
    }

    @GetMapping("/download/articles/{fileName:.+}")
    @Operation(summary = "Download article image")
    public ResponseEntity<Resource> downloadArticleImage(@PathVariable String fileName, HttpServletRequest request) {
        return downloadFile(fileName, articlesPath, request);
    }

    @GetMapping("/download/clinics/{fileName:.+}")
    @Operation(summary = "Download clinic logo")
    public ResponseEntity<Resource> downloadClinicLogo(@PathVariable String fileName, HttpServletRequest request) {
        return downloadFile(fileName, clinicsPath, request);
    }

    @DeleteMapping("/delete/profile-pictures/{fileName:.+}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT', 'ADMIN')")
    @Operation(summary = "Delete profile picture")
    public ResponseEntity<?> deleteProfilePicture(@PathVariable String fileName) {
        fileStorageService.deleteFile(fileName, profilePicturesPath);
        return ResponseEntity.ok().body("File deleted successfully");
    }

    @DeleteMapping("/delete/articles/{fileName:.+}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Delete article image")
    public ResponseEntity<?> deleteArticleImage(@PathVariable String fileName) {
        fileStorageService.deleteFile(fileName, articlesPath);
        return ResponseEntity.ok().body("File deleted successfully");
    }

    @DeleteMapping("/delete/clinics/{fileName:.+}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete clinic logo")
    public ResponseEntity<?> deleteClinicLogo(@PathVariable String fileName) {
        fileStorageService.deleteFile(fileName, clinicsPath);
        return ResponseEntity.ok().body("File deleted successfully");
    }

    private ResponseEntity<Resource> downloadFile(String fileName, String path, HttpServletRequest request) {
        Resource resource = fileStorageService.loadFileAsResource(fileName, path);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // Could not determine file type
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
} 