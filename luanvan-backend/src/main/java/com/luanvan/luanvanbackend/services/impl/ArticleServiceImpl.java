package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.ArticleDTO;
import com.luanvan.luanvanbackend.entities.Article;
import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.repositories.ArticleRepository;
import com.luanvan.luanvanbackend.repositories.UserRepository;
import com.luanvan.luanvanbackend.services.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ArticleServiceImpl implements ArticleService {

    @Autowired
    private ArticleRepository articleRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Override
    public Article getArticleById(Long articleId) {
        return articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + articleId));
    }

    @Override
    public List<Article> getArticlesByStatus(String status) {
        try {
            Article.ArticleStatus articleStatus = 
                    Article.ArticleStatus.valueOf(status.toUpperCase());
            return articleRepository.findByStatus(articleStatus);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + status);
        }
    }

    @Override
    public Page<Article> getArticlesByStatus(String status, Pageable pageable) {
        try {
            Article.ArticleStatus articleStatus = 
                    Article.ArticleStatus.valueOf(status.toUpperCase());
            return articleRepository.findByStatus(articleStatus, pageable);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + status);
        }
    }

    @Override
    public List<Article> getArticlesByAuthor(Long authorId) {
        // Kiểm tra tác giả có tồn tại hay không
        if (!userRepository.existsById(authorId)) {
            throw new RuntimeException("Không tìm thấy người dùng với ID: " + authorId);
        }
        
        return articleRepository.findByAuthorUserId(authorId);
    }

    @Override
    public Page<Article> getArticlesByAuthor(Long authorId, Pageable pageable) {
        // Kiểm tra tác giả có tồn tại hay không
        if (!userRepository.existsById(authorId)) {
            throw new RuntimeException("Không tìm thấy người dùng với ID: " + authorId);
        }
        
        return articleRepository.findByAuthorUserId(authorId, pageable);
    }

    @Override
    public Page<Article> searchArticlesByTitle(String title, Pageable pageable) {
        return articleRepository.findByTitleContainingIgnoreCase(title, pageable);
    }

    @Override
    public Page<Article> getAllPublishedArticles(Pageable pageable) {
        return articleRepository.findByStatus(Article.ArticleStatus.PUBLISHED, pageable);
    }

    @Override
    @Transactional
    public Article createArticle(Long authorId, ArticleDTO articleDTO) {
        // Kiểm tra tác giả có tồn tại hay không
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + authorId));
        
        // Tạo bài viết mới
        Article article = new Article();
        article.setTitle(articleDTO.getTitle());
        article.setContent(articleDTO.getContent());
        article.setAuthor(author);
        article.setPublishedDate(LocalDateTime.now());
        article.setLastModifiedDate(LocalDateTime.now());
        article.setImageURL(articleDTO.getImageURL());
        article.setCategory(articleDTO.getCategory());
        
        // Xử lý trạng thái
        Article.ArticleStatus status;
        if (articleDTO.getStatus() != null) {
            try {
                status = Article.ArticleStatus.valueOf(articleDTO.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                status = Article.ArticleStatus.DRAFT; // Mặc định là bản nháp
            }
        } else {
            status = Article.ArticleStatus.DRAFT;
        }
        article.setStatus(status);
        
        return articleRepository.save(article);
    }

    @Override
    @Transactional
    public Article updateArticle(Long articleId, ArticleDTO articleDTO) {
        Article article = getArticleById(articleId);
        
        // Cập nhật thông tin
        if (articleDTO.getTitle() != null) {
            article.setTitle(articleDTO.getTitle());
        }
        
        if (articleDTO.getContent() != null) {
            article.setContent(articleDTO.getContent());
        }
        
        if (articleDTO.getImageURL() != null) {
            article.setImageURL(articleDTO.getImageURL());
        }
        
        if (articleDTO.getCategory() != null) {
            article.setCategory(articleDTO.getCategory());
        }
        
        // Cập nhật trạng thái nếu có
        if (articleDTO.getStatus() != null) {
            try {
                Article.ArticleStatus status = Article.ArticleStatus.valueOf(articleDTO.getStatus().toUpperCase());
                article.setStatus(status);
                
                // Nếu xuất bản, cập nhật ngày xuất bản
                if (status == Article.ArticleStatus.PUBLISHED && 
                        (article.getPublishedDate() == null || article.getStatus() != Article.ArticleStatus.PUBLISHED)) {
                    article.setPublishedDate(LocalDateTime.now());
                }
            } catch (IllegalArgumentException e) {
                // Giữ nguyên trạng thái cũ nếu không hợp lệ
            }
        }
        
        // Cập nhật ngày chỉnh sửa
        article.setLastModifiedDate(LocalDateTime.now());
        
        return articleRepository.save(article);
    }

    @Override
    @Transactional
    public Article publishArticle(Long articleId) {
        Article article = getArticleById(articleId);
        
        // Kiểm tra trạng thái hiện tại
        if (article.getStatus() == Article.ArticleStatus.PUBLISHED) {
            // Đã xuất bản rồi, không cần thay đổi
            return article;
        }
        
        // Cập nhật trạng thái
        article.setStatus(Article.ArticleStatus.PUBLISHED);
        article.setPublishedDate(LocalDateTime.now());
        article.setLastModifiedDate(LocalDateTime.now());
        
        return articleRepository.save(article);
    }

    @Override
    @Transactional
    public Article saveAsDraft(Long articleId) {
        Article article = getArticleById(articleId);
        
        // Cập nhật trạng thái
        article.setStatus(Article.ArticleStatus.DRAFT);
        article.setLastModifiedDate(LocalDateTime.now());
        
        return articleRepository.save(article);
    }

    @Override
    @Transactional
    public Article archiveArticle(Long articleId) {
        Article article = getArticleById(articleId);
        
        // Cập nhật trạng thái
        article.setStatus(Article.ArticleStatus.ARCHIVED);
        article.setLastModifiedDate(LocalDateTime.now());
        
        return articleRepository.save(article);
    }

    @Override
    @Transactional
    public boolean deleteArticle(Long articleId) {
        Article article = getArticleById(articleId);
        
        articleRepository.delete(article);
        return true;
    }
} 