package com.careerhoop.exception;

/**
 * Exception thrown when OTP verification fails or OTP is invalid.
 * Used to provide generic error messages without leaking sensitive information.
 */
public class InvalidOtpException extends RuntimeException {
    
    public InvalidOtpException(String message) {
        super(message);
    }
    
    public InvalidOtpException(String message, Throwable cause) {
        super(message, cause);
    }
}

