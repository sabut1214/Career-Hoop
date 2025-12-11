package com.careerhoop.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "universities")
public class University {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String country;

    @Column(name = "num_colleges")
    private Integer numColleges;

    @Column(name = "num_programs")
    private Integer numPrograms;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "programs_url")
    private String programsUrl;

    @Column(name = "colleges_url")
    private String collegesUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

