package com.luanvan.luanvanbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.context.annotation.Bean;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
@EnableJpaRepositories(basePackages = "com.luanvan.luanvanbackend.repositories")
@EnableTransactionManagement
public class JpaConfig {

    @PersistenceContext
    private EntityManager entityManager;
    
    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @Bean
    public PlatformTransactionManager transactionManager() {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(entityManagerFactory);
        
        // Tối ưu transaction settings
        transactionManager.setGlobalRollbackOnParticipationFailure(false);
        transactionManager.setFailEarlyOnGlobalRollbackOnly(true);
        
        return transactionManager;
    }
    
    // Bean để inject EntityManager khi cần custom queries
    @Bean
    public EntityManager entityManager() {
        return entityManager;
    }
} 