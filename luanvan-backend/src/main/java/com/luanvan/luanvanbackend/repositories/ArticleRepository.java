package com.luanvan.luanvanbackend.repositories;

import com.luanvan.luanvanbackend.entities.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    // Tìm bài viết theo trạng thái
    List<Article> findByStatus(Article.ArticleStatus status);
    Page<Article> findByStatus(Article.ArticleStatus status, Pageable pageable);
    
    // Tìm bài viết theo tác giả
    List<Article> findByAuthorUserId(Long authorId);
    Page<Article> findByAuthorUserId(Long authorId, Pageable pageable);
    
    // Tìm bài viết theo tiêu đề (không phân biệt chữ hoa/thường)
    List<Article> findByTitleContainingIgnoreCase(String title);
    Page<Article> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    
    // Tìm bài viết theo danh mục
    List<Article> findByCategory(String category);
    Page<Article> findByCategory(String category, Pageable pageable);
    
    // Tìm bài viết theo khoảng thời gian xuất bản
    List<Article> findByPublishedDateBetween(LocalDateTime start, LocalDateTime end);
    
    // Tìm bài viết đã xuất bản theo tác giả
    List<Article> findByAuthorUserIdAndStatus(Long authorId, Article.ArticleStatus status);
    
    // Đếm số bài viết theo trạng thái
    long countByStatus(Article.ArticleStatus status);
} 