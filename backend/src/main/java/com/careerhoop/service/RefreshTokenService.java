package com.careerhoop.service;

import com.careerhoop.entity.RefreshToken;
import com.careerhoop.entity.User;
import com.careerhoop.repository.RefreshTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private static final Logger logger = LoggerFactory.getLogger(RefreshTokenService.class);

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private JwtService jwtService;

    @Value("${jwt.refresh-token-expiration}")
    private Long refreshTokenExpiration;

    /**
     * Generates a new refresh token for a user and stores it in the database.
     * The token is hashed before storage for security.
     *
     * @param user The user for whom to generate the token
     * @return The plain text refresh token (to be sent to client)
     */
    @Transactional
    public String generateRefreshToken(User user) {
        // Generate JWT refresh token
        String token = jwtService.generateRefreshToken(user.getId());

        // Hash the token using SHA-256 (no 72-byte limit like BCrypt)
        String tokenHash = hashToken(token);

        // Calculate expiration time
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000);

        // Create and save refresh token entity
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setUser(user);
        refreshToken.setExpiresAt(expiresAt);
        refreshToken.setRevoked(false);

        refreshTokenRepository.save(refreshToken);

        logger.debug("Generated refresh token for user: {}", user.getId());
        return token;
    }

    /**
     * Hashes a token using SHA-256.
     * This is used instead of BCrypt because JWT tokens can be longer than 72 bytes.
     *
     * @param token The token to hash
     * @return The SHA-256 hash of the token
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            logger.error("SHA-256 algorithm not available", e);
            throw new RuntimeException("Failed to hash token", e);
        }
    }

    /**
     * Validates a refresh token by checking:
     * 1. Token is valid JWT
     * 2. Token exists in database
     * 3. Token is not revoked
     * 4. Token is not expired
     *
     * @param token The plain text refresh token to validate
     * @return The RefreshToken entity if valid, null otherwise
     */
    @Transactional
    public RefreshToken validateRefreshToken(String token) {
        // First validate JWT structure and expiration
        if (!jwtService.validateRefreshToken(token)) {
            logger.debug("Refresh token failed JWT validation");
            return null;
        }

        // Extract user ID from token
        UUID userId;
        try {
            userId = jwtService.extractUserId(token);
        } catch (Exception e) {
            logger.debug("Failed to extract user ID from refresh token: {}", e.getMessage());
            return null;
        }

        // Hash the provided token to compare with stored hash
        String tokenHash = hashToken(token);

        // Find all active tokens for this user
        List<RefreshToken> userTokens = refreshTokenRepository.findActiveTokensByUserId(userId, LocalDateTime.now());

        // Check each token hash against the provided token hash
        for (RefreshToken refreshToken : userTokens) {
            if (tokenHash.equals(refreshToken.getTokenHash())) {
                // Token found and valid
                if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                    logger.debug("Refresh token expired");
                    return null;
                }

                // Update last used timestamp
                refreshToken.setLastUsedAt(LocalDateTime.now());
                refreshTokenRepository.save(refreshToken);

                return refreshToken;
            }
        }

        logger.debug("Refresh token not found in database for user: {}", userId);
        return null;
    }

    /**
     * Rotates a refresh token: revokes the old token and generates a new one.
     * This is called during token refresh to implement token rotation security best practice.
     *
     * @param oldToken The old refresh token to revoke
     * @param user The user for whom to generate the new token
     * @return The new plain text refresh token
     * @throws IllegalArgumentException if the old token is invalid
     */
    @Transactional
    public String rotateRefreshToken(String oldToken, User user) {
        // Validate and find the old token
        RefreshToken oldRefreshToken = validateRefreshToken(oldToken);
        if (oldRefreshToken == null) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        // Revoke the old token
        oldRefreshToken.setRevoked(true);
        refreshTokenRepository.save(oldRefreshToken);

        logger.debug("Rotated refresh token for user: {}", user.getId());

        // Generate and return new token
        return generateRefreshToken(user);
    }

    /**
     * Revokes a specific refresh token.
     *
     * @param token The refresh token to revoke
     */
    @Transactional
    public void revokeToken(String token) {
        RefreshToken refreshToken = validateRefreshToken(token);
        if (refreshToken != null) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            logger.info("Revoked refresh token for user: {}", refreshToken.getUser().getId());
        }
    }

    /**
     * Revokes all refresh tokens for a specific user.
     * Used when user logs out or changes password.
     *
     * @param userId The user ID whose tokens should be revoked
     */
    @Transactional
    public void revokeAllUserTokens(UUID userId) {
        List<RefreshToken> tokens = refreshTokenRepository.findByUserId(userId);
        for (RefreshToken token : tokens) {
            if (!token.getRevoked()) {
                token.setRevoked(true);
            }
        }
        if (!tokens.isEmpty()) {
            refreshTokenRepository.saveAll(tokens);
        }
        logger.info("Revoked all refresh tokens for user: {}", userId);
    }

    /**
     * Cleans up expired and revoked tokens.
     * Should be called periodically (e.g., via scheduled task).
     *
     * @param beforeTime Delete tokens expired before this time
     */
    @Transactional
    public void cleanupExpiredTokens(LocalDateTime beforeTime) {
        refreshTokenRepository.deleteRevokedTokensBefore(beforeTime);
        refreshTokenRepository.deleteByExpiresAtBefore(beforeTime);
        logger.debug("Cleaned up expired refresh tokens");
    }
}

