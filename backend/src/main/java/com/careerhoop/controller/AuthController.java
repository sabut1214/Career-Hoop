package com.careerhoop.controller;

import com.careerhoop.dto.AuthResponse;
import com.careerhoop.dto.ForgotPasswordRequest;
import com.careerhoop.dto.LoginRequest;
import com.careerhoop.dto.PasswordResetResponse;
import com.careerhoop.dto.RefreshTokenRequest;
import com.careerhoop.dto.RegisterRequest;
import com.careerhoop.dto.ResetPasswordRequest;
import com.careerhoop.dto.VerifyOtpRequest;
import com.careerhoop.dto.VerifyOtpResponse;
import com.careerhoop.exception.PasswordResetException;
import com.careerhoop.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshTokenRequest request) {
        try {
            AuthResponse response = authService.refreshToken(request.getRefreshToken());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
        }
    }

    /**
     * POST /api/forgot-password
     * 
     * Generates and sends a password reset OTP to the user's email.
     * Always returns a generic success message to prevent user enumeration.
     * 
     * TODO: Add rate limiting per IP/email to prevent abuse
     * 
     * @param request ForgotPasswordRequest containing email
     * @return Generic success message
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<PasswordResetResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            PasswordResetResponse response = authService.generateAndSendPasswordResetOtp(request.getEmail());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            // Return generic message even for validation errors to prevent information leakage
            PasswordResetResponse errorResponse = new PasswordResetResponse("If an account exists for this email, a reset code has been sent.");
            return ResponseEntity.ok(errorResponse);
        } catch (Exception ex) {
            // Log error but return generic success message
            PasswordResetResponse errorResponse = new PasswordResetResponse("If an account exists for this email, a reset code has been sent.");
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * POST /api/verify-otp
     * 
     * Verifies a password reset OTP.
     * Returns validation result without revealing specific failure reasons.
     * 
     * TODO: Add rate limiting per IP/email to prevent brute force attacks
     * 
     * @param request VerifyOtpRequest containing email and otp
     * @return Verification result with valid flag
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<VerifyOtpResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            boolean isValid = authService.verifyPasswordResetOtp(request.getEmail(), request.getOtp());
            if (isValid) {
                return ResponseEntity.ok(new VerifyOtpResponse(true, null));
            } else {
                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(new VerifyOtpResponse(false, "Invalid or expired code."));
            }
        } catch (IllegalArgumentException ex) {
            // Validation errors (e.g., invalid format)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new VerifyOtpResponse(false, ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(new VerifyOtpResponse(false, "Invalid or expired code."));
        }
    }

    /**
     * POST /api/reset-password
     * 
     * Resets user password using email and OTP.
     * Re-validates OTP before allowing password change.
     * 
     * @param request ResetPasswordRequest containing email, otp, and newPassword
     * @return Success message
     */
    @PostMapping("/reset-password")
    public ResponseEntity<PasswordResetResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPasswordWithOtp(request.getEmail(), request.getOtp(), request.getNewPassword());
            PasswordResetResponse response = new PasswordResetResponse("Password reset successfully.");
            return ResponseEntity.ok(response);
        } catch (PasswordResetException ex) {
            // Generic error message to prevent information leakage
            PasswordResetResponse errorResponse = new PasswordResetResponse("Unable to reset password, please request a new code.");
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(errorResponse);
        } catch (IllegalArgumentException ex) {
            // Validation errors (e.g., password too short)
            PasswordResetResponse errorResponse = new PasswordResetResponse(ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception ex) {
            // Generic error for unexpected exceptions
            PasswordResetResponse errorResponse = new PasswordResetResponse("Unable to reset password, please request a new code.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}


