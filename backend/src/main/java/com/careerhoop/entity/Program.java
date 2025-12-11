package com.careerhoop.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "programs")
public class Program {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String university;

    @Column(name = "program_name", nullable = false)
    private String programName;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String duration;

    private String eligibility;

    private String fees;

    @Column(name = "program_url")
    private String programUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

