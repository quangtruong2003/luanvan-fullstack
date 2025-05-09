package com.luanvan.luanvanbackend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "articles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Article {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long articleId;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;
    
    private LocalDateTime publishedDate;
    private LocalDateTime lastModifiedDate;
    private String imageURL;
    
    private String category;
    
    @Enumerated(EnumType.STRING)
    private ArticleStatus status;
    
    public enum ArticleStatus {
        DRAFT, PUBLISHED, ARCHIVED
    }
}
