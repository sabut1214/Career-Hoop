package com.careerhoop.service;

import com.careerhoop.entity.College;
import com.careerhoop.entity.EmailNotification;
import com.careerhoop.entity.User;
import com.careerhoop.entity.UserEmailPreferences;
import com.careerhoop.repository.EmailNotificationRepository;
import com.careerhoop.repository.SavedCollegeRepository;
import com.careerhoop.repository.UserEmailPreferencesRepository;
import com.careerhoop.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserEmailPreferencesRepository preferencesRepository;

    @Autowired
    private EmailNotificationRepository notificationRepository;

    @Autowired
    private SavedCollegeRepository savedCollegeRepository;

    /**
     * Checks if user has enabled a specific notification type.
     */
    private boolean isNotificationEnabled(UUID userId, String notificationType) {
        UserEmailPreferences preferences = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Create default preferences if none exist
                    UserEmailPreferences defaultPrefs = new UserEmailPreferences();
                    defaultPrefs.setUserId(userId);
                    return preferencesRepository.save(defaultPrefs);
                });

        return switch (notificationType) {
            case "college_saved" -> preferences.getCollegeUpdates();
            case "comparison_reminder" -> preferences.getComparisonReminders();
            case "recommendation" -> preferences.getRecommendations();
            case "weekly_digest" -> preferences.getWeeklyDigest();
            default -> false;
        };
    }

    /**
     * Records a sent notification.
     */
    private void recordNotification(UUID userId, String type, String subject, String status) {
        EmailNotification notification = new EmailNotification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setSubject(subject);
        notification.setStatus(status);
        notification.setSentAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    /**
     * Sends college saved confirmation if enabled.
     */
    @Transactional
    public void sendCollegeSavedNotification(User user, College college) {
        if (!isNotificationEnabled(user.getId(), "college_saved")) {
            logger.debug("College saved notifications disabled for user: {}", user.getId());
            return;
        }

        try {
            emailService.sendCollegeSavedConfirmation(user, college);
            recordNotification(user.getId(), "college_saved", "College Saved: " + college.getName(), "sent");
        } catch (Exception e) {
            logger.error("Failed to send college saved notification", e);
            recordNotification(user.getId(), "college_saved", "College Saved: " + college.getName(), "failed");
        }
    }

    /**
     * Sends comparison reminder if enabled.
     */
    @Transactional
    public void sendComparisonReminder(User user, List<College> colleges) {
        if (!isNotificationEnabled(user.getId(), "comparison_reminder")) {
            logger.debug("Comparison reminder notifications disabled for user: {}", user.getId());
            return;
        }

        try {
            emailService.sendCollegeComparisonReminder(user, colleges);
            recordNotification(user.getId(), "comparison_reminder", "Complete Your College Comparison", "sent");
        } catch (Exception e) {
            logger.error("Failed to send comparison reminder", e);
            recordNotification(user.getId(), "comparison_reminder", "Complete Your College Comparison", "failed");
        }
    }

    /**
     * Sends new recommendations if enabled.
     */
    @Transactional
    public void sendRecommendations(User user, List<College> colleges) {
        if (!isNotificationEnabled(user.getId(), "recommendation")) {
            logger.debug("Recommendation notifications disabled for user: {}", user.getId());
            return;
        }

        try {
            emailService.sendNewCollegeRecommendation(user, colleges);
            recordNotification(user.getId(), "recommendation", "New College Recommendations for You", "sent");
        } catch (Exception e) {
            logger.error("Failed to send recommendations", e);
            recordNotification(user.getId(), "recommendation", "New College Recommendations for You", "failed");
        }
    }

    /**
     * Scheduled job to send weekly digest every Monday at 9 AM.
     */
    @Scheduled(cron = "0 0 9 * * MON")
    @Transactional
    public void sendWeeklyDigest() {
        logger.info("Starting weekly digest job");
        
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (!isNotificationEnabled(user.getId(), "weekly_digest")) {
                continue;
            }

            try {
                // Get user's saved colleges
                List<com.careerhoop.entity.SavedCollege> savedColleges = 
                    savedCollegeRepository.findByUserIdOrderBySavedAtDesc(user.getId());
                List<College> savedCollegeList = savedColleges.stream()
                    .map(sc -> sc.getCollege())
                    .toList();

                // For now, use saved colleges as recommendations (can be enhanced later)
                emailService.sendWeeklyDigest(user, savedCollegeList, savedCollegeList);
                recordNotification(user.getId(), "weekly_digest", "Your Weekly CareerHoop Digest", "sent");
            } catch (Exception e) {
                logger.error("Failed to send weekly digest to user: {}", user.getId(), e);
                recordNotification(user.getId(), "weekly_digest", "Your Weekly CareerHoop Digest", "failed");
            }
        }
        
        logger.info("Weekly digest job completed");
    }
}

