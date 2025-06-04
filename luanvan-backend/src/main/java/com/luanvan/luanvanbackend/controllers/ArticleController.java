package com.luanvan.luanvanbackend.controllers;

import com.luanvan.luanvanbackend.dto.ArticleDTO;
import com.luanvan.luanvanbackend.entities.Article;
import com.luanvan.luanvanbackend.services.ArticleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    /**
     * Lấy thông tin bài viết theo ID (public)
     */
    @GetMapping("/{articleId}")
    public ResponseEntity<Article> getArticleById(@PathVariable Long articleId) {
        Article article = articleService.getArticleById(articleId);
        return ResponseEntity.ok(article);
    }

    /**
     * Lấy tất cả bài viết đã xuất bản (public)
     */
    @GetMapping("/published")
    public ResponseEntity<Page<Article>> getAllPublishedArticles(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<Article> articles = articleService.getAllPublishedArticles(pageable);
        return ResponseEntity.ok(articles);
    }

    /**
     * Tìm kiếm bài viết theo tiêu đề (public)
     */
    @GetMapping("/search")
    public ResponseEntity<Page<Article>> searchArticlesByTitle(
            @RequestParam String title,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<Article> articles = articleService.searchArticlesByTitle(title, pageable);
        return ResponseEntity.ok(articles);
    }

    /**
     * Lấy danh sách bài viết theo trạng thái (chỉ Admin và Doctor)
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<Page<Article>> getArticlesByStatus(
            @PathVariable String status,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<Article> articles = articleService.getArticlesByStatus(status, pageable);
        return ResponseEntity.ok(articles);
    }

    /**
     * Lấy danh sách bài viết của tác giả (Admin hoặc chính tác giả đó)
     */
    @GetMapping("/author/{authorId}")
    @PreAuthorize("hasRole('ADMIN') or #authorId == authentication.principal.userId")
    public ResponseEntity<Page<Article>> getArticlesByAuthor(
            @PathVariable Long authorId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<Article> articles = articleService.getArticlesByAuthor(authorId, pageable);
        return ResponseEntity.ok(articles);
    }

    /**
     * Tạo bài viết mới (Admin hoặc Doctor)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<Article> createArticle(
            @RequestParam Long authorId,
            @Valid @RequestBody ArticleDTO articleDTO) {
        Article article = articleService.createArticle(authorId, articleDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(article);
    }

    /**
     * Cập nhật thông tin bài viết (Admin hoặc tác giả)
     */
    @PutMapping("/{articleId}")
    @PreAuthorize("hasRole('ADMIN') or @articleService.getArticleById(#articleId).author.userId == authentication.principal.userId")
    public ResponseEntity<Article> updateArticle(
            @PathVariable Long articleId,
            @Valid @RequestBody ArticleDTO articleDTO) {
        Article article = articleService.updateArticle(articleId, articleDTO);
        return ResponseEntity.ok(article);
    }

    /**
     * Xuất bản bài viết (Admin hoặc tác giả)
     */
    @PutMapping("/{articleId}/publish")
    @PreAuthorize("hasRole('ADMIN') or @articleService.getArticleById(#articleId).author.userId == authentication.principal.userId")
    public ResponseEntity<Article> publishArticle(@PathVariable Long articleId) {
        Article article = articleService.publishArticle(articleId);
        return ResponseEntity.ok(article);
    }

    /**
     * Lưu bài viết dưới dạng bản nháp (Admin hoặc tác giả)
     */
    @PutMapping("/{articleId}/draft")
    @PreAuthorize("hasRole('ADMIN') or @articleService.getArticleById(#articleId).author.userId == authentication.principal.userId")
    public ResponseEntity<Article> saveAsDraft(@PathVariable Long articleId) {
        Article article = articleService.saveAsDraft(articleId);
        return ResponseEntity.ok(article);
    }

    /**
     * Lưu trữ bài viết (Admin hoặc tác giả)
     */
    @PutMapping("/{articleId}/archive")
    @PreAuthorize("hasRole('ADMIN') or @articleService.getArticleById(#articleId).author.userId == authentication.principal.userId")
    public ResponseEntity<Article> archiveArticle(@PathVariable Long articleId) {
        Article article = articleService.archiveArticle(articleId);
        return ResponseEntity.ok(article);
    }

    /**
     * Xóa bài viết (chỉ Admin)
     */
    @DeleteMapping("/{articleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteArticle(@PathVariable Long articleId) {
        boolean success = articleService.deleteArticle(articleId);
        if (success) {
            return ResponseEntity.ok("Đã xóa bài viết thành công");
        } else {
            return ResponseEntity.badRequest().body("Không thể xóa bài viết");
        }
    }
} 