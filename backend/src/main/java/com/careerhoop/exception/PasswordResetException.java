package com.careerhoop.exception;

/**
 * Exception thrown when password reset operation fails.
 * Used for any password reset related errors (OTP issues, validation failures, etc.).
 */
public class PasswordResetException extends RuntimeException {
    
    public PasswordResetException(String message) {
        super(message);
    }
    
    public PasswordResetException(String message, Throwable cause) {
        super(message, cause);
    }
}

