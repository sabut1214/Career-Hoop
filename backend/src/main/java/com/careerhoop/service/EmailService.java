package com.careerhoop.service;

import com.careerhoop.entity.College;
import com.careerhoop.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for sending emails.
 * Handles password reset OTP emails and other email notifications.
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Email sender address (from field).
     * Configurable via application.properties: app.mail.from
     * Defaults to noreply@careerhoop.com if not configured.
     */
    @Value("${app.mail.from:noreply@careerhoop.com}")
    private String fromAddress;

    /**
     * Sends a password reset OTP email to the user.
     * 
     * Security note: The raw OTP is included in the email body.
     * This is the only place where the raw OTP exists (it's hashed in the database).
     * 
     * @param email Recipient email address
     * @param otp The 5-digit OTP code (plain text, only used in email)
     */
    public void sendPasswordResetEmail(String email, String otp) {
        if (mailSender == null) {
            logger.error("JavaMailSender is not configured. Please configure email settings in application.properties");
            throw new IllegalStateException("Email service is not configured. Please contact administrator.");
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Reset Your CareerHoop Password - OTP");
            message.setText(buildEmailContent(otp));
            message.setFrom(fromAddress);

            mailSender.send(message);
            // Log success but never log the raw OTP
            logger.info("Password reset OTP email sent successfully to: {}", email);
        } catch (MailException e) {
            logger.error("Failed to send password reset email to: {}", email, e);
            throw new RuntimeException("Failed to send email. Please check email configuration.", e);
        }
    }

    private String buildEmailContent(String otp) {
        return "Hello,\n\n" +
                "You requested to reset your password for your CareerHoop account.\n\n" +
                "Your password reset OTP is: " + otp + "\n\n" +
                "This OTP will expire in 1 hour.\n\n" +
                "If you did not request a password reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "CareerHoop Team";
    }

    /**
     * Sends a confirmation email when a college is saved.
     */
    public void sendCollegeSavedConfirmation(User user, College college) {
        if (mailSender == null) {
            logger.warn("JavaMailSender is not configured. Skipping email notification.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("College Saved: " + college.getName());
            message.setText(buildCollegeSavedContent(user.getName(), college));
            message.setFrom(fromAddress);

            mailSender.send(message);
            logger.info("College saved confirmation email sent to: {}", user.getEmail());
        } catch (MailException e) {
            logger.error("Failed to send college saved confirmation email to: {}", user.getEmail(), e);
        }
    }

    /**
     * Sends a reminder email about college comparisons.
     */
    public void sendCollegeComparisonReminder(User user, List<College> colleges) {
        if (mailSender == null) {
            logger.warn("JavaMailSender is not configured. Skipping email notification.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Complete Your College Comparison");
            message.setText(buildComparisonReminderContent(user.getName(), colleges));
            message.setFrom(fromAddress);

            mailSender.send(message);
            logger.info("College comparison reminder email sent to: {}", user.getEmail());
        } catch (MailException e) {
            logger.error("Failed to send comparison reminder email to: {}", user.getEmail(), e);
        }
    }

    /**
     * Sends new college recommendations to the user.
     */
    public void sendNewCollegeRecommendation(User user, List<College> colleges) {
        if (mailSender == null) {
            logger.warn("JavaMailSender is not configured. Skipping email notification.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("New College Recommendations for You");
            message.setText(buildRecommendationContent(user.getName(), colleges));
            message.setFrom(fromAddress);

            mailSender.send(message);
            logger.info("College recommendation email sent to: {}", user.getEmail());
        } catch (MailException e) {
            logger.error("Failed to send recommendation email to: {}", user.getEmail(), e);
        }
    }

    /**
     * Sends a weekly digest of saved colleges and recommendations.
     */
    public void sendWeeklyDigest(User user, List<College> savedColleges, List<College> recommendations) {
        if (mailSender == null) {
            logger.warn("JavaMailSender is not configured. Skipping email notification.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Your Weekly CareerHoop Digest");
            message.setText(buildWeeklyDigestContent(user.getName(), savedColleges, recommendations));
            message.setFrom(fromAddress);

            mailSender.send(message);
            logger.info("Weekly digest email sent to: {}", user.getEmail());
        } catch (MailException e) {
            logger.error("Failed to send weekly digest email to: {}", user.getEmail(), e);
        }
    }

    private String buildCollegeSavedContent(String userName, College college) {
        return "Hello " + userName + ",\n\n" +
                "You've successfully saved " + college.getName() + " to your favorites!\n\n" +
                "College Details:\n" +
                "Name: " + college.getName() + "\n" +
                (college.getLocation() != null ? "Location: " + college.getLocation() + "\n" : "") +
                (college.getAffiliation() != null ? "Affiliation: " + college.getAffiliation() + "\n" : "") +
                "\nYou can view all your saved colleges and compare them on your dashboard.\n\n" +
                "Best regards,\n" +
                "CareerHoop Team";
    }

    private String buildComparisonReminderContent(String userName, List<College> colleges) {
        StringBuilder content = new StringBuilder();
        content.append("Hello ").append(userName).append(",\n\n");
        content.append("You have ").append(colleges.size()).append(" college(s) ready for comparison:\n\n");
        
        for (int i = 0; i < colleges.size(); i++) {
            College college = colleges.get(i);
            content.append(i + 1).append(". ").append(college.getName());
            if (college.getLocation() != null) {
                content.append(" - ").append(college.getLocation());
            }
            content.append("\n");
        }
        
        content.append("\nVisit your comparison page to see a side-by-side comparison of these colleges.\n\n");
        content.append("Best regards,\n");
        content.append("CareerHoop Team");
        
        return content.toString();
    }

    private String buildRecommendationContent(String userName, List<College> colleges) {
        StringBuilder content = new StringBuilder();
        content.append("Hello ").append(userName).append(",\n\n");
        content.append("We found ").append(colleges.size()).append(" new college recommendation(s) that match your profile:\n\n");
        
        for (int i = 0; i < Math.min(colleges.size(), 5); i++) {
            College college = colleges.get(i);
            content.append(i + 1).append(". ").append(college.getName());
            if (college.getLocation() != null) {
                content.append(" (").append(college.getLocation()).append(")");
            }
            content.append("\n");
        }
        
        if (colleges.size() > 5) {
            content.append("\n... and ").append(colleges.size() - 5).append(" more!\n");
        }
        
        content.append("\nLog in to your account to see all recommendations and save your favorites.\n\n");
        content.append("Best regards,\n");
        content.append("CareerHoop Team");
        
        return content.toString();
    }

    private String buildWeeklyDigestContent(String userName, List<College> savedColleges, List<College> recommendations) {
        StringBuilder content = new StringBuilder();
        content.append("Hello ").append(userName).append(",\n\n");
        content.append("Here's your weekly CareerHoop digest:\n\n");
        
        if (savedColleges != null && !savedColleges.isEmpty()) {
            content.append("Your Saved Colleges (").append(savedColleges.size()).append("):\n");
            for (int i = 0; i < Math.min(savedColleges.size(), 3); i++) {
                College college = savedColleges.get(i);
                content.append("- ").append(college.getName()).append("\n");
            }
            if (savedColleges.size() > 3) {
                content.append("... and ").append(savedColleges.size() - 3).append(" more\n");
            }
            content.append("\n");
        }
        
        if (recommendations != null && !recommendations.isEmpty()) {
            content.append("New Recommendations (").append(recommendations.size()).append("):\n");
            for (int i = 0; i < Math.min(recommendations.size(), 3); i++) {
                College college = recommendations.get(i);
                content.append("- ").append(college.getName());
                if (college.getLocation() != null) {
                    content.append(" (").append(college.getLocation()).append(")");
                }
                content.append("\n");
            }
            if (recommendations.size() > 3) {
                content.append("... and ").append(recommendations.size() - 3).append(" more\n");
            }
        }
        
        content.append("\nLog in to explore more colleges and continue your career journey!\n\n");
        content.append("Best regards,\n");
        content.append("CareerHoop Team");
        
        return content.toString();
    }
}

