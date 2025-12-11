package com.careerhoop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for OTP verification endpoint.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpResponse {
    /**
     * Whether the OTP is valid.
     */
    private boolean valid;
    
    /**
     * Optional error message (null if valid is true).
     */
    private String message;
}

