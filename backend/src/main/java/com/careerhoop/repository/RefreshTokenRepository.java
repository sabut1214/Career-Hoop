package com.careerhoop.repository;

import com.careerhoop.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    /**
     * Find refresh token by hashed token value.
     * Used for token validation during refresh operations.
     */
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /**
     * Find all refresh tokens for a specific user.
     * Used for token revocation and cleanup.
     */
    List<RefreshToken> findByUserId(UUID userId);

    /**
     * Find all non-revoked refresh tokens for a user.
     * Used to check active sessions.
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user.id = :userId AND rt.revoked = false AND rt.expiresAt > :now")
    List<RefreshToken> findActiveTokensByUserId(@Param("userId") UUID userId, @Param("now") LocalDateTime now);

    /**
     * Delete all refresh tokens for a specific user.
     * Used when revoking all tokens for a user (e.g., on password change).
     */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.user.id = :userId")
    void deleteByUserId(@Param("userId") UUID userId);

    /**
     * Delete all expired refresh tokens.
     * Used for cleanup of old tokens.
     */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :expiryTime")
    void deleteByExpiresAtBefore(@Param("expiryTime") LocalDateTime expiryTime);

    /**
     * Delete all revoked refresh tokens that expired before the given time.
     * Used for cleanup of old revoked tokens.
     */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.revoked = true AND rt.expiresAt < :expiryTime")
    void deleteRevokedTokensBefore(@Param("expiryTime") LocalDateTime expiryTime);
}

