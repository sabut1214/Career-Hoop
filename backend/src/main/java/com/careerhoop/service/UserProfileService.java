package com.careerhoop.service;

import com.careerhoop.dto.UpdateUserProfileRequest;
import com.careerhoop.dto.UserResponse;
import com.careerhoop.entity.User;
import com.careerhoop.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.UUID;

@Service
public class UserProfileService {

    private static final Logger log = LoggerFactory.getLogger(UserProfileService.class);

    @Autowired
    private UserRepository userRepository;

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
                if (picture.startsWith("data:image/") || picture.startsWith("http://") || picture.startsWith("https://")) {
                    log.info("Setting profilePicture - valid format, length: {}", picture.length());
                    user.setProfilePicture(picture);
                } else {
                    // If it's just base64 without prefix, assume it's image data
                    log.info("Setting profilePicture - no prefix, assuming image data, length: {}", picture.length());
                    user.setProfilePicture(picture);
                }
            }
        } else {
            log.info("profilePicture is null in request, skipping update");
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
}


