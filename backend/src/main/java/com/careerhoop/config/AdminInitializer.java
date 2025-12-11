package com.careerhoop.config;

import com.careerhoop.entity.User;
import com.careerhoop.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Ensures a dedicated administrator account exists using credentials from configuration.
 * Reads from environment variables first (APP_ADMIN_EMAIL / APP_ADMIN_PASSWORD),
 * falls back to application.properties values if not set.
 */
@Component
public class AdminInitializer implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(AdminInitializer.class);

    private static final String ADMIN_EMAIL_ENV = "APP_ADMIN_EMAIL";
    private static final String ADMIN_PASSWORD_ENV = "APP_ADMIN_PASSWORD";

    @Autowired
    private UserRepository userRepository;

    @Value("${app.admin.email:}")
    private String defaultAdminEmail;

    @Value("${app.admin.password:}")
    private String defaultAdminPassword;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    @Transactional
    public void run(String... args) {
        final String adminEmail = isBlank(System.getenv(ADMIN_EMAIL_ENV))
                ? defaultAdminEmail
                : System.getenv(ADMIN_EMAIL_ENV);

        final String adminPassword = isBlank(System.getenv(ADMIN_PASSWORD_ENV))
                ? defaultAdminPassword
                : System.getenv(ADMIN_PASSWORD_ENV);

        if (isBlank(adminEmail) || isBlank(adminPassword)) {
            LOGGER.warn(
                    "Admin credentials are not configured. Set {} and {} environment variables to bootstrap the admin user.",
                    ADMIN_EMAIL_ENV,
                    ADMIN_PASSWORD_ENV
            );
            return;
        }

        User adminUser = userRepository.findByEmail(adminEmail).orElseGet(() -> {
            User newAdmin = new User();
            newAdmin.setName("Administrator");
            newAdmin.setEmail(adminEmail);
            return newAdmin;
        });

        boolean isNew = adminUser.getId() == null;
        boolean requiresUpdate = isNew;

        if (!"admin".equals(adminUser.getRole())) {
            adminUser.setRole("admin");
            requiresUpdate = true;
        }

        String storedHash = adminUser.getPasswordHash();
        if (storedHash == null || !passwordEncoder.matches(adminPassword, storedHash)) {
            adminUser.setPasswordHash(passwordEncoder.encode(adminPassword));
            requiresUpdate = true;
        }

        if (!requiresUpdate) {
            LOGGER.info("Admin user already up to date: {}", adminEmail);
            return;
        }

        userRepository.save(adminUser);
        LOGGER.info("Admin user {} with email {}", isNew ? "created" : "updated", adminEmail);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}

