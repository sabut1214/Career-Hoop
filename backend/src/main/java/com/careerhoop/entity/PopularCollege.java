package com.careerhoop.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "popular_colleges")
public class PopularCollege {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String category;

    @Column(name = "category_slug")
    private String categorySlug;

    private String program;

    private String affiliation;

    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "detail_url")
    private String detailUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

