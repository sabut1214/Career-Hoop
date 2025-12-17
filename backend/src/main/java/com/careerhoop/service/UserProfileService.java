package com.careerhoop.service;

import com.careerhoop.dto.UpdateUserProfileRequest;
import com.careerhoop.dto.UserResponse;
import com.careerhoop.entity.User;
import com.careerhoop.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class UserProfileService {

    private static final Logger log = LoggerFactory.getLogger(UserProfileService.class);

    /**
     * Whitelist of trusted domains for profile picture URLs to prevent SSRF attacks.
     * Only URLs from these domains (or their subdomains) are allowed.
     */
    private static final List<String> ALLOWED_PROFILE_PICTURE_DOMAINS = Arrays.asList(
        "imgur.com",
        "i.imgur.com",
        "cloudinary.com",
        "res.cloudinary.com",
        "s3.amazonaws.com",
        "github.com",
        "githubusercontent.com",
        "raw.githubusercontent.com",
        "cdn.jsdelivr.net",
        "unpkg.com"
        // Add your own trusted CDN/domain here
    );

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public UserResponse getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse updateUserProfile(UUID userId, UpdateUserProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.name() != null) {
            if (!hasText(request.name())) {
                throw new IllegalArgumentException("Name cannot be blank.");
            }
            user.setName(request.name().trim());
        }

        if (request.phoneNumber() != null) {
            user.setPhoneNumber(sanitizePhone(request.phoneNumber()));
        }

        if (request.location() != null) {
            user.setLocation(sanitizeText(request.location(), 255, "Location"));
        }

        if (request.schoolName() != null) {
            user.setSchoolName(sanitizeText(request.schoolName(), 255, "School name"));
        }

        if (request.dateOfBirth() != null) {
            if (hasText(request.dateOfBirth())) {
                user.setDateOfBirth(parseDate(request.dateOfBirth().trim()));
            } else {
                user.setDateOfBirth(null);
            }
        }

        if (request.gpa() != null) {
            user.setGpa(validateGpa(request.gpa()));
        }

        // Log received profilePicture for debugging
        log.info("Update profile request - profilePicture received: {}", 
            request.profilePicture() != null 
                ? (request.profilePicture().length() > 100 
                    ? request.profilePicture().substring(0, 100) + "... (length: " + request.profilePicture().length() + ")" 
                    : request.profilePicture())
                : "null");

        if (request.profilePicture() != null) {
            String pictureValue = request.profilePicture();
            log.info("Processing profilePicture - value is null: {}, isEmpty: {}", 
                pictureValue == null, 
                pictureValue != null && pictureValue.trim().isEmpty());
            
            // Allow empty string to remove profile picture
            if (pictureValue == null || pictureValue.trim().isEmpty()) {
                log.info("Setting profilePicture to null (empty or null value)");
                user.setProfilePicture(null);
            } else {
                // Validate base64 image or URL (basic check)
                String picture = pictureValue.trim();
                log.info("Processing profilePicture - length: {}, startsWith data:image/: {}", 
                    picture.length(), 
                    picture.startsWith("data:image/"));
                
                if (picture.length() > 10 * 1024 * 1024) { // Max 10MB for base64
                    log.warn("Profile picture too large: {} bytes", picture.length());
                    throw new IllegalArgumentException("Profile picture is too large. Maximum size is 10MB.");
                }
                // Only save if it's a valid base64 data URL or URL
                if (picture.startsWith("data:image/")) {
                    // Validate that it's actually an image data URL
                    String[] parts = picture.split(",");
                    if (parts.length == 2 && parts[0].matches("data:image/(jpeg|jpg|png|gif|webp);base64")) {
                        log.info("Setting profilePicture - valid image data URL, length: {}", picture.length());
                        user.setProfilePicture(picture);
                    } else {
                        log.warn("Invalid image data URL format");
                        throw new IllegalArgumentException("Profile picture must be a valid image (JPEG, PNG, GIF, or WebP)");
                    }
                } else if (picture.startsWith("http://") || picture.startsWith("https://")) {
                    // Validate URL format and domain whitelist to prevent SSRF attacks
                    validateProfilePictureUrl(picture);
                    log.info("Setting profilePicture - valid URL, length: {}", picture.length());
                    user.setProfilePicture(picture);
                } else {
                    // Reject base64 without data URL prefix for security
                    log.warn("Profile picture provided without proper data URL prefix");
                    throw new IllegalArgumentException("Profile picture must be a valid image data URL or HTTP(S) URL");
                }
            }
        } else {
            log.info("profilePicture is null in request, skipping update");
        }

        // Privacy settings
        if (request.showGpa() != null) {
            user.setShowGpa(request.showGpa());
        }
        if (request.showSavedColleges() != null) {
            user.setShowSavedColleges(request.showSavedColleges());
        }
        if (request.showSavedCareers() != null) {
            user.setShowSavedCareers(request.showSavedCareers());
        }

        // Academic details
        if (request.gradeLevel() != null) {
            user.setGradeLevel(sanitizeText(request.gradeLevel(), 50, "Grade level"));
        }
        if (request.stream() != null) {
            user.setStream(sanitizeText(request.stream(), 50, "Stream"));
        }
        if (request.subjects() != null) {
            // Handle empty list - clear subjects
            if (request.subjects().isEmpty()) {
                user.setSubjects(null);
            } else {
                try {
                    String subjectsJson = objectMapper.writeValueAsString(request.subjects());
                    user.setSubjects(subjectsJson);
                } catch (JsonProcessingException e) {
                    log.error("Failed to serialize subjects to JSON", e);
                    throw new IllegalArgumentException("Invalid subjects format");
                }
            }
        }

        // Social links
        if (request.linkedinUrl() != null) {
            user.setLinkedinUrl(validateUrl(request.linkedinUrl(), "LinkedIn"));
        }
        if (request.githubUrl() != null) {
            user.setGithubUrl(validateUrl(request.githubUrl(), "GitHub"));
        }
        if (request.portfolioUrl() != null) {
            user.setPortfolioUrl(validateUrl(request.portfolioUrl(), "Portfolio"));
        }
        
        log.info("User profilePicture before save: {}", 
            user.getProfilePicture() != null 
                ? (user.getProfilePicture().length() > 100 
                    ? user.getProfilePicture().substring(0, 100) + "... (length: " + user.getProfilePicture().length() + ")" 
                    : user.getProfilePicture())
                : "null");

        User saved = userRepository.save(user);
        log.info("User saved - profilePicture after save: {}", 
            saved.getProfilePicture() != null 
                ? (saved.getProfilePicture().length() > 100 
                    ? saved.getProfilePicture().substring(0, 100) + "... (length: " + saved.getProfilePicture().length() + ")" 
                    : saved.getProfilePicture())
                : "null");
        
        UserResponse response = UserResponse.fromEntity(saved);
        log.info("UserResponse - profilePicture in response: {}", 
            response.getProfilePicture() != null 
                ? (response.getProfilePicture().length() > 100 
                    ? response.getProfilePicture().substring(0, 100) + "... (length: " + response.getProfilePicture().length() + ")" 
                    : response.getProfilePicture())
                : "null");
        
        return response;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String sanitizePhone(String value) {
        String sanitized = sanitizeText(value, 32, "Phone number");
        if (sanitized == null) {
            return null;
        }
        if (!sanitized.matches("^[0-9+()\\-\\s]{7,20}$")) {
            throw new IllegalArgumentException("Phone number format is invalid.");
        }
        return sanitized;
    }

    private String sanitizeText(String value, int maxLength, String fieldName) {
        if (!hasText(value)) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.length() > maxLength) {
            throw new IllegalArgumentException(fieldName + " must be at most " + maxLength + " characters long.");
        }
        return trimmed;
    }

    private Double validateGpa(Double value) {
        if (value == null || Double.isNaN(value)) {
            throw new IllegalArgumentException("GPA must be a valid number.");
        }
        double rounded = Math.round(value * 100.0) / 100.0;
        if (rounded < 0.0 || rounded > 10.0) {
            throw new IllegalArgumentException("GPA must be between 0.0 and 10.0.");
        }
        return rounded;
    }

    private LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Invalid date format. Use ISO format (yyyy-MM-dd).");
        }
    }

    private String validateUrl(String url, String fieldName) {
        if (!hasText(url)) {
            return null;
        }
        String trimmed = url.trim();
        if (trimmed.length() > 255) {
            throw new IllegalArgumentException(fieldName + " URL must be at most 255 characters long.");
        }
        // Basic URL validation
        try {
            new URL(trimmed);
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException(fieldName + " URL is invalid: " + e.getMessage());
        }
        return trimmed;
    }

    /**
     * Validates that a profile picture URL is from a trusted domain to prevent SSRF attacks.
     * Only allows URLs from domains in the ALLOWED_PROFILE_PICTURE_DOMAINS whitelist.
     * 
     * @param urlString The URL string to validate
     * @throws IllegalArgumentException if the URL is invalid or from an untrusted domain
     */
    private void validateProfilePictureUrl(String urlString) {
        try {
            URL url = new URL(urlString);
            String host = url.getHost().toLowerCase();
            
            // Check if host matches any allowed domain or is a subdomain of an allowed domain
            boolean isAllowed = ALLOWED_PROFILE_PICTURE_DOMAINS.stream()
                .anyMatch(allowedDomain -> {
                    String allowedDomainLower = allowedDomain.toLowerCase();
                    // Exact match or subdomain match (e.g., subdomain.imgur.com matches imgur.com)
                    return host.equals(allowedDomainLower) || host.endsWith("." + allowedDomainLower);
                });
            
            if (!isAllowed) {
                log.warn("Profile picture URL from untrusted domain: {} (allowed domains: {})", 
                    host, ALLOWED_PROFILE_PICTURE_DOMAINS);
                throw new IllegalArgumentException(
                    "Profile picture URL must be from a trusted domain. " +
                    "Allowed domains: " + String.join(", ", ALLOWED_PROFILE_PICTURE_DOMAINS)
                );
            }
            
            // Additional security: Reject localhost and private IP addresses
            if (host.equals("localhost") || host.equals("127.0.0.1") || 
                host.startsWith("192.168.") || host.startsWith("10.") || 
                host.startsWith("172.16.") || host.startsWith("172.17.") ||
                host.startsWith("172.18.") || host.startsWith("172.19.") ||
                host.startsWith("172.20.") || host.startsWith("172.21.") ||
                host.startsWith("172.22.") || host.startsWith("172.23.") ||
                host.startsWith("172.24.") || host.startsWith("172.25.") ||
                host.startsWith("172.26.") || host.startsWith("172.27.") ||
                host.startsWith("172.28.") || host.startsWith("172.29.") ||
                host.startsWith("172.30.") || host.startsWith("172.31.")) {
                log.warn("Profile picture URL points to localhost or private IP: {}", host);
                throw new IllegalArgumentException("Profile picture URL cannot point to localhost or private IP addresses");
            }
            
        } catch (MalformedURLException e) {
            log.warn("Invalid profile picture URL format: {}", urlString);
            throw new IllegalArgumentException("Invalid profile picture URL format: " + e.getMessage());
        }
    }
}


