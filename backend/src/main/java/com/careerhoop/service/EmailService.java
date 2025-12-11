package com.careerhoop.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

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
}

