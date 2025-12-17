package com.careerhoop.service;

import com.careerhoop.dto.AuthResponse;
import com.careerhoop.dto.LoginRequest;
import com.careerhoop.dto.PasswordResetResponse;
import com.careerhoop.dto.RegisterRequest;
import com.careerhoop.dto.UserResponse;
import com.careerhoop.entity.OtpResetToken;
import com.careerhoop.entity.User;
import com.careerhoop.exception.PasswordResetException;
import com.careerhoop.repository.OtpResetTokenRepository;
import com.careerhoop.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpResetTokenRepository otpResetTokenRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    // OTP configuration constants
    private static final int OTP_MIN_VALUE = 10000;
    private static final int OTP_MAX_VALUE = 99999;
    private static final int OTP_EXPIRY_MINUTES = 10; // Reduced from 1 hour for better security
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        logger.debug("Register request received for email: {}", maskEmail(request.getEmail()));
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        // Explicitly allow any password length - BCrypt will handle encoding
        String password = request.getPassword();
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }
        
        // Log password length for debugging
        byte[] passwordBytes = password.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        logger.debug("Password length: {} characters, {} bytes", password.length(), passwordBytes.length);
        
        // No byte length validation - allow any length
        // BCrypt has a 72-byte limit but truncates silently, which is acceptable
        
        try {
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            logger.debug("Encoding password with BCrypt...");
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setRole("student");

            User saved = userRepository.save(user);
            logger.info("User registered successfully: {}", maskEmail(request.getEmail()));

            // Generate tokens
            String accessToken = jwtService.generateAccessToken(saved.getId(), saved.getEmail(), saved.getRole());
            String refreshToken = refreshTokenService.generateRefreshToken(saved);

            AuthResponse response = new AuthResponse();
            response.setToken(accessToken);
            response.setRefreshToken(refreshToken);
            response.setUser(UserResponse.fromEntity(saved));
            return response;
        } catch (IllegalArgumentException e) {
            logger.error("IllegalArgumentException during registration: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error during registration: {}", e.getMessage(), e);
            throw new IllegalArgumentException("Registration failed: " + e.getMessage(), e);
        }
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    logger.warn("Login attempt failed - user not found: {}", maskEmail(request.getEmail()));
                    return new IllegalArgumentException("Invalid credentials");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            logger.warn("Login attempt failed - invalid password for user: {}", maskEmail(request.getEmail()));
            throw new IllegalArgumentException("Invalid credentials");
        }

        // Generate tokens
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = refreshTokenService.generateRefreshToken(user);

        logger.info("User logged in successfully: {}", maskEmail(user.getEmail()));

        AuthResponse response = new AuthResponse();
        response.setToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setUser(UserResponse.fromEntity(user));
        return response;
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        // Validate refresh token from database (includes JWT validation and DB check)
        com.careerhoop.entity.RefreshToken tokenEntity = refreshTokenService.validateRefreshToken(refreshToken);
        if (tokenEntity == null) {
            logger.warn("Token refresh failed - invalid or expired refresh token");
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        User user = tokenEntity.getUser();
        if (user == null) {
            logger.error("Token refresh failed - user not found for token");
            throw new IllegalArgumentException("Invalid refresh token: user not found");
        }

        // Rotate refresh token (revoke old, generate new)
        String newRefreshToken = refreshTokenService.rotateRefreshToken(refreshToken, user);

        // Generate new access token
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());

        logger.debug("Token refreshed successfully for user: {}", user.getId());

        AuthResponse response = new AuthResponse();
        response.setToken(accessToken);
        response.setRefreshToken(newRefreshToken);
        response.setUser(UserResponse.fromEntity(user));
        return response;
    }

    /**
     * Generates and sends a password reset OTP to the user's email.
     * 
     * Security considerations:
     * - Does not reveal if email exists (prevents user enumeration)
     * - OTP is hashed before storage (not stored in plain text)
     * - Previous OTPs for the email are invalidated
     * - Raw OTP is never logged
     * 
     * @param email The user's email address
     * @return Generic success message (does not indicate if email exists)
     */
    @Transactional
    public PasswordResetResponse generateAndSendPasswordResetOtp(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        
        // Normalize email (trim and lowercase)
        String normalizedEmail = email.trim().toLowerCase();
        
        // Basic email format validation
        if (!normalizedEmail.contains("@") || normalizedEmail.indexOf("@") == 0 || 
            normalizedEmail.indexOf("@") == normalizedEmail.length() - 1) {
            throw new IllegalArgumentException("Invalid email format");
        }
        
        // Look up user - but don't reveal if email exists
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);
        
        // Security: Always return success message, even if email doesn't exist
        // This prevents user enumeration attacks
        if (userOpt.isEmpty()) {
            // Log at info level (not error) with masked email for monitoring
            logger.info("Password reset OTP requested for email [{}] - user not found", maskEmail(normalizedEmail));
            return new PasswordResetResponse("If an account exists for this email, a reset code has been sent.");
        }

        User user = userOpt.get();
        
        // Generate 5-digit OTP (10000-99999)
        String rawOtp = generateOTP();
        
        // Hash the OTP before storage (same encoder as passwords for consistency)
        String otpHash = passwordEncoder.encode(rawOtp);
        
        // Invalidate any previous OTPs for this email
        LocalDateTime now = LocalDateTime.now();
        otpResetTokenRepository.invalidatePreviousTokens(normalizedEmail, now);
        
        // Create new OTP token entity
        OtpResetToken otpToken = new OtpResetToken();
        otpToken.setEmail(normalizedEmail);
        otpToken.setOtpHash(otpHash);
        otpToken.setExpiresAt(now.plusMinutes(OTP_EXPIRY_MINUTES));
        otpToken.setUsed(false);
        otpToken.setFailedAttempts(0);
        
        otpResetTokenRepository.save(otpToken);
        
        // Send email with raw OTP (only place where raw OTP exists)
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), rawOtp);
            // Log success with masked email (never log raw OTP)
            logger.info("Password reset OTP generated and sent to email [{}]", maskEmail(normalizedEmail));
        } catch (Exception e) {
            logger.error("Failed to send password reset OTP email to [{}]", maskEmail(normalizedEmail), e);
            // Don't reveal email sending failure to client (security best practice)
            // Still return success message to prevent user enumeration
        }

        return new PasswordResetResponse("If an account exists for this email, a reset code has been sent.");
    }

    /**
     * Verifies a password reset OTP.
     * 
     * Security checks:
     * - Validates OTP exists and is not used
     * - Checks expiry time
     * - Enforces max failed attempts (prevents brute force)
     * - Compares provided OTP with hashed stored OTP
     * - Increments failed attempts on mismatch
     * 
     * @param email The user's email address
     * @param otp The plain text OTP provided by user
     * @return true if OTP is valid, false otherwise
     */
    @Transactional
    public boolean verifyPasswordResetOtp(String email, String otp) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (otp == null || otp.trim().isEmpty() || !otp.matches("\\d{5}")) {
            throw new IllegalArgumentException("OTP must be a 5-digit number");
        }

        String normalizedEmail = email.trim().toLowerCase();
        LocalDateTime now = LocalDateTime.now();
        
        // Find the latest active OTP for this email
        Optional<OtpResetToken> tokenOpt = otpResetTokenRepository.findLatestActiveByEmail(
            normalizedEmail, 
            now, 
            OtpResetToken.MAX_FAILED_ATTEMPTS
        );
        
        if (tokenOpt.isEmpty()) {
            logger.warn("Password reset OTP verification failed for email [{}] - no active token found", maskEmail(normalizedEmail));
            return false;
        }

        OtpResetToken token = tokenOpt.get();
        
        // Check if already used
        if (token.isUsed()) {
            logger.warn("Password reset OTP verification failed for email [{}] - token already used", maskEmail(normalizedEmail));
            return false;
        }
        
        // Check if expired
        if (token.getExpiresAt().isBefore(now)) {
            logger.warn("Password reset OTP verification failed for email [{}] - token expired", maskEmail(normalizedEmail));
            return false;
        }
        
        // Check failed attempts limit
        if (token.getFailedAttempts() >= OtpResetToken.MAX_FAILED_ATTEMPTS) {
            logger.warn("Password reset OTP verification failed for email [{}] - max attempts exceeded", maskEmail(normalizedEmail));
            return false;
        }
        
        // Compare provided OTP (plain text) with stored hash
        boolean matches = passwordEncoder.matches(otp, token.getOtpHash());
        
        if (!matches) {
            // Increment failed attempts
            token.setFailedAttempts(token.getFailedAttempts() + 1);
            otpResetTokenRepository.save(token);
            
            logger.warn("Password reset OTP verification failed for email [{}] - invalid code (attempts: {})", 
                maskEmail(normalizedEmail), token.getFailedAttempts());
            return false;
        }
        
        // OTP is valid - but don't mark as used yet
        // It will be marked used during password reset for additional security
        logger.info("Password reset OTP verified successfully for email [{}]", maskEmail(normalizedEmail));
        return true;
    }

    /**
     * Resets user password using email and OTP.
     * 
     * Security flow:
     * 1. Re-validates OTP (even if verified earlier)
     * 2. Checks all security constraints (expiry, attempts, used status)
     * 3. Updates user password
     * 4. Marks OTP as used to prevent reuse
     * 
     * @param email The user's email address
     * @param otp The plain text OTP
     * @param newPassword The new password (must meet validation requirements)
     * @throws PasswordResetException if OTP is invalid, expired, or password validation fails
     */
    @Transactional
    public void resetPasswordWithOtp(String email, String otp, String newPassword) {
        if (email == null || email.trim().isEmpty()) {
            throw new PasswordResetException("Email is required");
        }

        if (otp == null || otp.trim().isEmpty() || !otp.matches("\\d{5}")) {
            throw new PasswordResetException("OTP must be a 5-digit number");
        }

        // Validate password strength
        if (newPassword == null || newPassword.length() < 8) {
            throw new PasswordResetException("Password must be at least 8 characters long");
        }
        
        String normalizedEmail = email.trim().toLowerCase();
        LocalDateTime now = LocalDateTime.now();
        
        // Find the latest active OTP for this email
        Optional<OtpResetToken> tokenOpt = otpResetTokenRepository.findLatestActiveByEmail(
            normalizedEmail, 
            now, 
            OtpResetToken.MAX_FAILED_ATTEMPTS
        );
        
        if (tokenOpt.isEmpty()) {
            logger.warn("Password reset failed for email [{}] - no active OTP token", maskEmail(normalizedEmail));
            throw new PasswordResetException("Unable to reset password, please request a new code.");
        }

        OtpResetToken token = tokenOpt.get();
        
        // Re-validate all security checks
        if (token.isUsed()) {
            logger.warn("Password reset failed for email [{}] - OTP already used", maskEmail(normalizedEmail));
            throw new PasswordResetException("Unable to reset password, please request a new code.");
        }
        
        if (token.getExpiresAt().isBefore(now)) {
            logger.warn("Password reset failed for email [{}] - OTP expired", maskEmail(normalizedEmail));
            throw new PasswordResetException("Unable to reset password, please request a new code.");
        }
        
        if (token.getFailedAttempts() >= OtpResetToken.MAX_FAILED_ATTEMPTS) {
            logger.warn("Password reset failed for email [{}] - max attempts exceeded", maskEmail(normalizedEmail));
            throw new PasswordResetException("Unable to reset password, please request a new code.");
        }
        
        // Verify OTP hash matches
        if (!passwordEncoder.matches(otp, token.getOtpHash())) {
            // Increment failed attempts
            token.setFailedAttempts(token.getFailedAttempts() + 1);
            otpResetTokenRepository.save(token);
            
            logger.warn("Password reset failed for email [{}] - invalid OTP (attempts: {})", 
                maskEmail(normalizedEmail), token.getFailedAttempts());
            throw new PasswordResetException("Unable to reset password, please request a new code.");
        }
        
        // OTP is valid - proceed with password reset
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);
        if (userOpt.isEmpty()) {
            logger.error("Password reset failed for email [{}] - user not found after OTP validation", maskEmail(normalizedEmail));
            throw new PasswordResetException("Unable to reset password, please request a new code.");
        }
        
        User user = userOpt.get();
        
        // Encode and update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Mark OTP as used to prevent reuse
        token.setUsed(true);
        otpResetTokenRepository.save(token);
        
        logger.info("Password reset successfully for email [{}]", maskEmail(normalizedEmail));
    }

    /**
     * Generates a secure 5-digit OTP in the range 10000-99999.
     * Uses SecureRandom for cryptographically secure random number generation.
     * 
     * @return 5-digit OTP as string
     */
    private String generateOTP() {
        SecureRandom random = new SecureRandom();
        int otp = OTP_MIN_VALUE + random.nextInt(OTP_MAX_VALUE - OTP_MIN_VALUE + 1);
        return String.valueOf(otp);
    }
    
    /**
     * Masks email address for logging (privacy protection).
     * Example: user@example.com -> u***@e***.com
     * 
     * @param email The email to mask
     * @return Masked email string
     */
    private String maskEmail(String email) {
        if (email == null || email.length() < 3) {
            return "***";
        }
        int atIndex = email.indexOf('@');
        if (atIndex <= 0) {
            return email.charAt(0) + "***";
        }
        String localPart = email.substring(0, atIndex);
        String domain = email.substring(atIndex + 1);
        
        String maskedLocal = localPart.length() > 1 
            ? localPart.charAt(0) + "***" 
            : "***";
        String maskedDomain = domain.length() > 1 
            ? domain.charAt(0) + "***" 
            : "***";
        
        return maskedLocal + "@" + maskedDomain;
    }
    
    /**
     * Legacy method for backward compatibility.
     * Delegates to generateAndSendPasswordResetOtp.
     * 
     * @deprecated Use generateAndSendPasswordResetOtp instead
     */
    @Deprecated
    @Transactional
    public PasswordResetResponse forgotPassword(String email) {
        return generateAndSendPasswordResetOtp(email);
    }

    /**
     * Changes user password after verifying current password.
     * 
     * @param userId The user's ID
     * @param currentPassword The user's current password
     * @param newPassword The new password to set
     * @throws IllegalArgumentException if user not found, current password incorrect, or new password invalid
     */
    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        
        if (currentPassword == null || currentPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Current password is required");
        }
        
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("New password is required");
        }
        
        if (newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters long");
        }
        
        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        
        // Check if new password is same as current password
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }
        
        // Hash and update password
        String newPasswordHash = passwordEncoder.encode(newPassword);
        user.setPasswordHash(newPasswordHash);
        userRepository.save(user);
        
        logger.info("Password changed successfully for user: {}", user.getEmail());
        
        // Revoke all refresh tokens to force re-login for security
        refreshTokenService.revokeAllUserTokens(userId);
        logger.info("Revoked all refresh tokens for user after password change: {}", user.getId());
    }
}

