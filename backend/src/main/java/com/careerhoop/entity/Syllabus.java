package com.careerhoop.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "syllabus")
public class Syllabus {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "program_code", nullable = false)
    private String programCode;

    @Column(name = "program_name", nullable = false)
    private String programName;

    @Column(name = "syllabus_url")
    private String syllabusUrl;

    // Store subjects as JSON string
    @Column(columnDefinition = "TEXT")
    private String subjects; // JSON string of subjects array

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

