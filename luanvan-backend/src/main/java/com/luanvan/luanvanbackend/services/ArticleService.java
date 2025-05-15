package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.ArticleDTO;
import com.luanvan.luanvanbackend.entities.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ArticleService {
    
    /**
     * Lấy thông tin bài viết theo ID
     * @param articleId ID của bài viết
     * @return Thông tin bài viết
     */
    Article getArticleById(Long articleId);
    
    /**
     * Lấy danh sách bài viết theo trạng thái
     * @param status Trạng thái bài viết
     * @return Danh sách bài viết
     */
    List<Article> getArticlesByStatus(String status);
    
    /**
     * Lấy danh sách bài viết theo trạng thái có phân trang
     * @param status Trạng thái bài viết
     * @param pageable Thông tin phân trang
     * @return Danh sách bài viết có phân trang
     */
    Page<Article> getArticlesByStatus(String status, Pageable pageable);
    
    /**
     * Lấy danh sách bài viết theo tác giả
     * @param authorId ID của tác giả
     * @return Danh sách bài viết
     */
    List<Article> getArticlesByAuthor(Long authorId);
    
    /**
     * Lấy danh sách bài viết theo tác giả có phân trang
     * @param authorId ID của tác giả
     * @param pageable Thông tin phân trang
     * @return Danh sách bài viết có phân trang
     */
    Page<Article> getArticlesByAuthor(Long authorId, Pageable pageable);
    
    /**
     * Tìm kiếm bài viết theo tiêu đề
     * @param title Từ khóa tìm kiếm
     * @param pageable Thông tin phân trang
     * @return Danh sách bài viết có phân trang
     */
    Page<Article> searchArticlesByTitle(String title, Pageable pageable);
    
    /**
     * Lấy tất cả bài viết đã xuất bản
     * @param pageable Thông tin phân trang
     * @return Danh sách bài viết có phân trang
     */
    Page<Article> getAllPublishedArticles(Pageable pageable);
    
    /**
     * Tạo bài viết mới
     * @param authorId ID của tác giả
     * @param articleDTO Thông tin bài viết
     * @return Bài viết đã được tạo
     */
    Article createArticle(Long authorId, ArticleDTO articleDTO);
    
    /**
     * Cập nhật thông tin bài viết
     * @param articleId ID của bài viết
     * @param articleDTO Thông tin cập nhật
     * @return Bài viết sau khi cập nhật
     */
    Article updateArticle(Long articleId, ArticleDTO articleDTO);
    
    /**
     * Xuất bản bài viết
     * @param articleId ID của bài viết
     * @return Bài viết sau khi xuất bản
     */
    Article publishArticle(Long articleId);
    
    /**
     * Lưu bài viết dưới dạng bản nháp
     * @param articleId ID của bài viết
     * @return Bài viết sau khi lưu
     */
    Article saveAsDraft(Long articleId);
    
    /**
     * Lưu trữ bài viết (ẩn khỏi danh sách công khai)
     * @param articleId ID của bài viết
     * @return Bài viết sau khi lưu trữ
     */
    Article archiveArticle(Long articleId);
    
    /**
     * Xóa bài viết
     * @param articleId ID của bài viết
     * @return true nếu xóa thành công
     */
    boolean deleteArticle(Long articleId);
} 