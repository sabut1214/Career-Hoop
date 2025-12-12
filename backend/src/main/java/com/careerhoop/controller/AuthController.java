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
import com.careerhoop.config.CookieConfig;
import com.careerhoop.service.AuthService;
import com.careerhoop.service.RefreshTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private CookieConfig cookieConfig;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse httpResponse) {
        try {
            AuthResponse response = authService.register(request);
            setAuthCookies(httpResponse, response.getToken(), response.getRefreshToken());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse httpResponse) {
        try {
            AuthResponse response = authService.login(request);
            setAuthCookies(httpResponse, response.getToken(), response.getRefreshToken());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @RequestBody(required = false) RefreshTokenRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        try {
            // Try to get refresh token from cookie first, then request body
            String refreshToken = null;
            if (httpRequest.getCookies() != null) {
                for (Cookie cookie : httpRequest.getCookies()) {
                    if ("refreshToken".equals(cookie.getName())) {
                        refreshToken = cookie.getValue();
                        break;
                    }
                }
            }
            if (refreshToken == null && request != null) {
                refreshToken = request.getRefreshToken();
            }
            if (refreshToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token required");
            }

            AuthResponse response = authService.refreshToken(refreshToken);
            setAuthCookies(httpResponse, response.getToken(), response.getRefreshToken());
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

    /**
     * POST /api/logout
     * 
     * Logs out the user by revoking their refresh token.
     * Supports both cookie-based and body-based token extraction.
     * 
     * @param request HTTP request (may contain refresh token in cookie or body)
     * @param response HTTP response (to clear cookies)
     * @return Success message
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestBody(required = false) RefreshTokenRequest refreshTokenRequest) {
        try {
            String refreshToken = null;

            // Try to get refresh token from cookie first
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("refreshToken".equals(cookie.getName())) {
                        refreshToken = cookie.getValue();
                        break;
                    }
                }
            }

            // Fallback to request body if not in cookie
            if (refreshToken == null && refreshTokenRequest != null) {
                refreshToken = refreshTokenRequest.getRefreshToken();
            }

            // Revoke token if found
            if (refreshToken != null && !refreshToken.isEmpty()) {
                refreshTokenService.revokeToken(refreshToken);
            }

            // Clear cookies
            Cookie accessTokenCookie = new Cookie("accessToken", null);
            accessTokenCookie.setHttpOnly(true);
            accessTokenCookie.setSecure(true);
            accessTokenCookie.setPath("/");
            accessTokenCookie.setMaxAge(0);
            response.addCookie(accessTokenCookie);

            Cookie refreshTokenCookie = new Cookie("refreshToken", null);
            refreshTokenCookie.setHttpOnly(true);
            refreshTokenCookie.setSecure(true);
            refreshTokenCookie.setPath("/");
            refreshTokenCookie.setMaxAge(0);
            response.addCookie(refreshTokenCookie);

            return ResponseEntity.ok(new PasswordResetResponse("Logged out successfully"));
        } catch (Exception ex) {
            // Even if there's an error, return success to prevent information leakage
            return ResponseEntity.ok(new PasswordResetResponse("Logged out successfully"));
        }
    }

    /**
     * Sets httpOnly cookies for access and refresh tokens.
     */
    private void setAuthCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        // Access token cookie
        Cookie accessTokenCookie = new Cookie("accessToken", accessToken);
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(cookieConfig.isCookieSecure());
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(cookieConfig.getCookieMaxAge());
        if ("Strict".equals(cookieConfig.getCookieSameSite()) || "Lax".equals(cookieConfig.getCookieSameSite())) {
            // Note: SameSite attribute needs to be set via response header in newer Spring versions
            // This is a limitation - we'll set it via response header if needed
        }
        response.addCookie(accessTokenCookie);

        // Refresh token cookie
        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(cookieConfig.isCookieSecure());
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(cookieConfig.getCookieMaxAge());
        response.addCookie(refreshTokenCookie);
    }
}


