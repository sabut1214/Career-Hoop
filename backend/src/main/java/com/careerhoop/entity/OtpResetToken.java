package com.careerhoop.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity for storing password reset OTP tokens.
 * OTPs are stored as hashes (not plain text) for security.
 * Tracks failed attempts and expiry to prevent brute force attacks.
 */
@Data
@Entity
@Table(name = "otp_reset_tokens", indexes = {
    @Index(name = "idx_otp_email_created", columnList = "email,created_at")
})
public class OtpResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Email address for which this OTP was generated.
     * Indexed for efficient lookups.
     */
    @Column(nullable = false, length = 255)
    private String email;

    /**
     * Hashed OTP value (not plain text).
     * Uses the same password encoder as user passwords for consistency.
     */
    @Column(name = "otp_hash", nullable = false, length = 255)
    private String otpHash;

    /**
     * Expiry timestamp. OTP becomes invalid after this time.
     * Default: 1 hour from creation.
     */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /**
     * Creation timestamp. Used to find the latest OTP for an email.
     */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    /**
     * Whether this OTP has been used successfully.
     * Once used, it cannot be reused.
     */
    @Column(nullable = false)
    private boolean used = false;

    /**
     * Number of failed verification attempts.
     * OTP is invalidated after MAX_FAILED_ATTEMPTS (typically 5).
     */
    @Column(name = "failed_attempts", nullable = false)
    private int failedAttempts = 0;

    /**
     * Maximum allowed failed attempts before OTP is invalidated.
     * This is a constant, not stored in DB.
     */
    public static final int MAX_FAILED_ATTEMPTS = 5;
}

