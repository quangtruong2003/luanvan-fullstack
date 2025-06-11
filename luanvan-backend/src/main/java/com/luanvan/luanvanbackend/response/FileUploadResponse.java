package com.luanvan.luanvanbackend.response;

public class FileUploadResponse {
    private String fileName;
    private String fileDownloadUri;
    private String fileType;
    private long size;

    public FileUploadResponse() {}

    public FileUploadResponse(String fileName, String fileDownloadUri, String fileType, long size) {
        this.fileName = fileName;
        this.fileDownloadUri = fileDownloadUri;
        this.fileType = fileType;
        this.size = size;
    }

    public static Builder builder() {
        return new Builder();
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileDownloadUri() {
        return fileDownloadUri;
    }

    public void setFileDownloadUri(String fileDownloadUri) {
        this.fileDownloadUri = fileDownloadUri;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public static class Builder {
        private String fileName;
        private String fileDownloadUri;
        private String fileType;
        private long size;

        public Builder fileName(String fileName) {
            this.fileName = fileName;
            return this;
        }

        public Builder fileDownloadUri(String fileDownloadUri) {
            this.fileDownloadUri = fileDownloadUri;
            return this;
        }

        public Builder fileType(String fileType) {
            this.fileType = fileType;
            return this;
        }

        public Builder size(long size) {
            this.size = size;
            return this;
        }

        public FileUploadResponse build() {
            return new FileUploadResponse(fileName, fileDownloadUri, fileType, size);
        }
    }
} 