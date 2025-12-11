package com.careerhoop.repository;

import com.careerhoop.entity.OtpResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for OtpResetToken entity.
 * Provides methods to find and manage OTP tokens for password reset.
 */
@Repository
public interface OtpResetTokenRepository extends JpaRepository<OtpResetToken, UUID> {

    /**
     * Finds the most recent (latest) OTP token for a given email.
     * Used to get the active OTP when verifying or resetting password.
     *
     * @param email The email address
     * @return Optional containing the latest OTP token, or empty if none exists
     */
    Optional<OtpResetToken> findTopByEmailOrderByCreatedAtDesc(String email);

    /**
     * Finds the latest active (not used, not expired) OTP token for an email.
     * An OTP is considered active if:
     * - used = false
     * - expiresAt > current time
     * - failedAttempts < MAX_FAILED_ATTEMPTS
     *
     * @param email The email address
     * @param now Current timestamp for expiry check
     * @return Optional containing the latest active OTP token
     */
    @Query("SELECT o FROM OtpResetToken o WHERE o.email = :email " +
           "AND o.used = false " +
           "AND o.expiresAt > :now " +
           "AND o.failedAttempts < :maxAttempts " +
           "ORDER BY o.createdAt DESC")
    Optional<OtpResetToken> findLatestActiveByEmail(
            @Param("email") String email,
            @Param("now") LocalDateTime now,
            @Param("maxAttempts") int maxAttempts
    );

    /**
     * Marks all previous (older) OTP tokens for an email as used.
     * This invalidates old OTPs when a new one is generated.
     *
     * @param email The email address
     * @param beforeTime Only mark tokens created before this time
     * @return Number of tokens marked as used
     */
    @Modifying
    @Query("UPDATE OtpResetToken o SET o.used = true WHERE o.email = :email AND o.createdAt < :beforeTime")
    int invalidatePreviousTokens(@Param("email") String email, @Param("beforeTime") LocalDateTime beforeTime);

    /**
     * Deletes expired OTP tokens older than the specified time.
     * Can be used for cleanup jobs.
     *
     * @param beforeTime Delete tokens created before this time
     * @return Number of tokens deleted
     */
    @Modifying
    @Query("DELETE FROM OtpResetToken o WHERE o.createdAt < :beforeTime")
    int deleteExpiredTokens(@Param("beforeTime") LocalDateTime beforeTime);
}

