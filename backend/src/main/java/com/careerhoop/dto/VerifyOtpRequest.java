package com.careerhoop.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * Request DTO for OTP verification endpoint.
 */
@Data
public class VerifyOtpRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "OTP is required")
    @Pattern(regexp = "\\d{5}", message = "OTP must be a 5-digit number")
    private String otp;
}

