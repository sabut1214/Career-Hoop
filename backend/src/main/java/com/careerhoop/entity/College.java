package com.careerhoop.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "colleges")
public class College {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String name;

    @Column(columnDefinition = "TEXT")
    private String location;

    @Column(columnDefinition = "TEXT")
    private String affiliation;

    @Column(name = "established_year")
    private Integer establishedYear;

    @Column(columnDefinition = "TEXT")
    private String contact; // Stored as JSON string

    @Column(name = "detail_url", columnDefinition = "TEXT")
    private String detailUrl;

    @Column(columnDefinition = "TEXT")
    private String overview;

    @Column(columnDefinition = "TEXT")
    private String programs; // Stored as JSON string (array of program objects)

    @Column(columnDefinition = "TEXT")
    private String facilities;

    @Column(name = "why_choose", columnDefinition = "TEXT")
    private String whyChoose;

    @Column(name = "principal_message", columnDefinition = "TEXT")
    private String principalMessage;

    @Column(name = "extra_information", columnDefinition = "TEXT")
    private String extraInformation;

    @Column(name = "map_embed_url", columnDefinition = "TEXT")
    private String mapEmbedUrl;

    // Additional fields for UI compatibility
    private String type;

    private Double rating;

    @Column(name = "fees_range", columnDefinition = "TEXT")
    private String feesRange;

    @Column(name = "courses_offered", columnDefinition = "TEXT")
    private String coursesOffered; // Changed from array to string for flexibility

    @Column(columnDefinition = "TEXT")
    private String website;

    @Column(columnDefinition = "TEXT")
    private String students; // Number of students or student count

    @Column(columnDefinition = "TEXT")
    private String tuition; // Tuition fees

    @Column(name = "acceptance_rate", columnDefinition = "TEXT")
    private String acceptanceRate; // Acceptance rate percentage

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}