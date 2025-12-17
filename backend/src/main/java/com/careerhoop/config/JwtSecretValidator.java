package com.careerhoop.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Validates JWT secret configuration on application startup.
 * Prevents using default/weak secrets in production environments.
 */
@Component
public class JwtSecretValidator {

    private static final Logger logger = LoggerFactory.getLogger(JwtSecretValidator.class);
    private static final String DEFAULT_SECRET = "your-256-bit-secret-key-change-this-in-production-to-a-secure-random-string";
    private static final int MIN_SECRET_LENGTH = 32; // Minimum 256 bits when base64 encoded

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${spring.profiles.active:}")
    private String activeProfile;

    private final Environment environment;

    public JwtSecretValidator(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void validateJwtSecret() {
        boolean isProduction = isProductionEnvironment();
        
        // Check if default secret is being used
        if (DEFAULT_SECRET.equals(jwtSecret)) {
            String errorMessage = String.format(
                "CRITICAL SECURITY ISSUE: Default JWT secret is being used! " +
                "This is insecure and must be changed. " +
                "Generate a secure secret using: openssl rand -base64 32 " +
                "Then set it as environment variable: JWT_SECRET=<generated-secret>"
            );
            
            if (isProduction) {
                logger.error(errorMessage);
                throw new IllegalStateException(
                    "Application cannot start in production with default JWT secret. " +
                    "Please set JWT_SECRET environment variable with a secure random string."
                );
            } else {
                logger.warn(errorMessage);
                logger.warn("This is allowed in development, but MUST be changed before deploying to production!");
            }
        }
        
        // Check secret length and strength
        if (jwtSecret.length() < MIN_SECRET_LENGTH) {
            String errorMessage = String.format(
                "JWT secret is too short (minimum %d characters required for 256-bit security). " +
                "Current length: %d. Generate a secure secret using: openssl rand -base64 32",
                MIN_SECRET_LENGTH, jwtSecret.length()
            );
            
            if (isProduction) {
                logger.error(errorMessage);
                throw new IllegalStateException(
                    "JWT secret does not meet minimum security requirements. " +
                    "Please set JWT_SECRET environment variable with at least " + MIN_SECRET_LENGTH + " characters."
                );
            } else {
                logger.warn(errorMessage);
            }
        }
        
        // Check if secret appears to be weak (all same character, sequential, etc.)
        if (isWeakSecret(jwtSecret)) {
            String errorMessage = "JWT secret appears to be weak (repetitive or sequential pattern detected). " +
                                "Please use a cryptographically secure random secret.";
            
            if (isProduction) {
                logger.error(errorMessage);
                throw new IllegalStateException(
                    "JWT secret does not meet security requirements. " +
                    "Please set JWT_SECRET environment variable with a secure random string."
                );
            } else {
                logger.warn(errorMessage);
            }
        }
        
        if (!isProduction && !DEFAULT_SECRET.equals(jwtSecret)) {
            logger.info("JWT secret is configured (development mode)");
        } else if (isProduction) {
            logger.info("JWT secret validation passed (production mode)");
        }
    }

    /**
     * Determines if the application is running in a production environment.
     */
    private boolean isProductionEnvironment() {
        // Check for production profile
        if (activeProfile != null && (activeProfile.contains("prod") || activeProfile.contains("production"))) {
            return true;
        }
        
        // Check for common production indicators
        String env = environment.getProperty("ENV");
        if (env != null && (env.equalsIgnoreCase("prod") || env.equalsIgnoreCase("production"))) {
            return true;
        }
        
        // Check if JWT_SECRET is explicitly set (indicates production-like setup)
        String jwtSecretEnv = environment.getProperty("JWT_SECRET");
        if (jwtSecretEnv != null && !jwtSecretEnv.isEmpty() && !DEFAULT_SECRET.equals(jwtSecretEnv)) {
            // If JWT_SECRET is set and not default, assume production-like environment
            return true;
        }
        
        return false;
    }

    /**
     * Checks if the secret appears to be weak (repetitive patterns, sequential, etc.).
     */
    private boolean isWeakSecret(String secret) {
        if (secret == null || secret.length() < MIN_SECRET_LENGTH) {
            return true;
        }
        
        // Check for all same character
        char firstChar = secret.charAt(0);
        boolean allSame = true;
        for (char c : secret.toCharArray()) {
            if (c != firstChar) {
                allSame = false;
                break;
            }
        }
        if (allSame) {
            return true;
        }
        
        // Check for simple sequential patterns (basic check)
        // This is a simple heuristic - in practice, use proper entropy checking
        int uniqueChars = (int) secret.chars().distinct().count();
        if (uniqueChars < 4) {
            return true; // Too few unique characters
        }
        
        return false;
    }
}

