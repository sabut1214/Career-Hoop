package com.careerhoop.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String role; // "student" or "admin"

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "location")
    private String location;

    @Column(name = "school_name")
    private String schoolName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gpa")
    private Double gpa;

    @Column(name = "profile_picture", columnDefinition = "TEXT")
    private String profilePicture; // Base64 encoded image or URL

    // Privacy settings
    @Column(name = "show_gpa")
    private Boolean showGpa = true;

    @Column(name = "show_saved_colleges")
    private Boolean showSavedColleges = true;

    @Column(name = "show_saved_careers")
    private Boolean showSavedCareers = true;

    // Academic details
    @Column(name = "grade_level")
    private String gradeLevel;

    @Column(name = "stream")
    private String stream;

    @Column(name = "subjects", columnDefinition = "TEXT")
    private String subjects; // JSON array stored as TEXT

    // Social links
    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * @deprecated Legacy password reset token fields.
     * Password reset now uses OtpResetToken entity.
     * These fields are kept for backward compatibility during migration.
     * TODO: Remove these fields after migration is complete and data is cleaned up.
     */
    @Deprecated
    @Column(name = "password_reset_token")
    private String passwordResetToken;

    /**
     * @deprecated Legacy password reset token expiry field.
     * See passwordResetToken for details.
     */
    @Deprecated
    @Column(name = "password_reset_token_expiry")
    private LocalDateTime passwordResetTokenExpiry;
}


