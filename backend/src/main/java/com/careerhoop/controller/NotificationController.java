package com.careerhoop.controller;

import com.careerhoop.dto.EmailPreferencesRequest;
import com.careerhoop.dto.EmailPreferencesResponse;
import com.careerhoop.entity.User;
import com.careerhoop.entity.UserEmailPreferences;
import com.careerhoop.repository.UserEmailPreferencesRepository;
import com.careerhoop.repository.UserRepository;
import com.careerhoop.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users/{userId}/notifications")
@CrossOrigin
public class NotificationController {

    @Autowired
    private UserEmailPreferencesRepository preferencesRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/email-preferences")
    public ResponseEntity<EmailPreferencesResponse> getEmailPreferences(
            @PathVariable UUID userId,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole
    ) {
        // Basic access control
        if (requesterId == null || !requesterId.equals(userId)) {
            return ResponseEntity.badRequest().build();
        }

        UserEmailPreferences preferences = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Create default preferences if none exist
                    UserEmailPreferences defaultPrefs = new UserEmailPreferences();
                    defaultPrefs.setUserId(userId);
                    defaultPrefs.setCollegeUpdates(true);
                    defaultPrefs.setWeeklyDigest(true);
                    defaultPrefs.setRecommendations(true);
                    defaultPrefs.setComparisonReminders(true);
                    return preferencesRepository.save(defaultPrefs);
                });

        return ResponseEntity.ok(EmailPreferencesResponse.fromEntity(preferences));
    }

    @PutMapping("/email-preferences")
    public ResponseEntity<EmailPreferencesResponse> updateEmailPreferences(
            @PathVariable UUID userId,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole,
            @RequestBody EmailPreferencesRequest request
    ) {
        // Basic access control
        if (requesterId == null || !requesterId.equals(userId)) {
            return ResponseEntity.badRequest().build();
        }

        UserEmailPreferences preferences = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserEmailPreferences newPrefs = new UserEmailPreferences();
                    newPrefs.setUserId(userId);
                    return newPrefs;
                });

        if (request.collegeUpdates() != null) {
            preferences.setCollegeUpdates(request.collegeUpdates());
        }
        if (request.weeklyDigest() != null) {
            preferences.setWeeklyDigest(request.weeklyDigest());
        }
        if (request.recommendations() != null) {
            preferences.setRecommendations(request.recommendations());
        }
        if (request.comparisonReminders() != null) {
            preferences.setComparisonReminders(request.comparisonReminders());
        }

        UserEmailPreferences saved = preferencesRepository.save(preferences);
        return ResponseEntity.ok(EmailPreferencesResponse.fromEntity(saved));
    }

    @PostMapping("/test")
    public ResponseEntity<String> sendTestEmail(
            @PathVariable UUID userId,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId
    ) {
        // Basic access control
        if (requesterId == null || !requesterId.equals(userId)) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOpt.get();
            emailService.sendPasswordResetEmail(user.getEmail(), "TEST123");
            return ResponseEntity.ok("Test email sent successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send test email: " + e.getMessage());
        }
    }
}

