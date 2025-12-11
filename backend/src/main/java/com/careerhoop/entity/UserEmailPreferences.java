package com.careerhoop.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "user_email_preferences")
public class UserEmailPreferences {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", unique = true, nullable = false)
    private UUID userId;

    @Column(name = "college_updates", nullable = false)
    private Boolean collegeUpdates = true;

    @Column(name = "weekly_digest", nullable = false)
    private Boolean weeklyDigest = true;

    @Column(name = "recommendations", nullable = false)
    private Boolean recommendations = true;

    @Column(name = "comparison_reminders", nullable = false)
    private Boolean comparisonReminders = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

