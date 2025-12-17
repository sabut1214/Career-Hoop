package com.careerhoop.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Validates database configuration on application startup.
 * Prevents unsafe database schema auto-update in production environments.
 */
@Component
public class DatabaseConfigValidator {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfigValidator.class);
    private static final String UNSAFE_DDL_AUTO = "update";
    private static final String UNSAFE_DDL_AUTO_CREATE = "create";
    private static final String UNSAFE_DDL_AUTO_CREATE_DROP = "create-drop";

    @Value("${spring.jpa.hibernate.ddl-auto}")
    private String ddlAuto;

    @Value("${spring.profiles.active:}")
    private String activeProfile;

    private final Environment environment;

    public DatabaseConfigValidator(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void validateDatabaseConfig() {
        boolean isProduction = isProductionEnvironment();
        
        // Check for unsafe ddl-auto values in production
        if (isProduction) {
            if (UNSAFE_DDL_AUTO.equals(ddlAuto) || 
                UNSAFE_DDL_AUTO_CREATE.equals(ddlAuto) || 
                UNSAFE_DDL_AUTO_CREATE_DROP.equals(ddlAuto)) {
                String errorMessage = String.format(
                    "CRITICAL SECURITY ISSUE: Unsafe JPA ddl-auto setting detected in production! " +
                    "Current value: '%s'. " +
                    "This can cause data loss or unexpected schema changes. " +
                    "Set JPA_DDL_AUTO=validate in production environment. " +
                    "Use Flyway migrations for schema changes instead.",
                    ddlAuto
                );
                
                logger.error(errorMessage);
                throw new IllegalStateException(
                    "Application cannot start in production with unsafe ddl-auto setting. " +
                    "Please set JPA_DDL_AUTO=validate environment variable."
                );
            }
            
            if (!"validate".equals(ddlAuto)) {
                logger.warn(
                    "JPA ddl-auto is set to '{}' in production. " +
                    "Consider using 'validate' for maximum safety. " +
                    "Use Flyway migrations for schema changes.",
                    ddlAuto
                );
            } else {
                logger.info("JPA ddl-auto validation passed (production mode with 'validate')");
            }
        } else {
            if (UNSAFE_DDL_AUTO.equals(ddlAuto)) {
                logger.warn(
                    "JPA ddl-auto is set to 'update' (development mode). " +
                    "This is allowed in development but MUST be changed to 'validate' before deploying to production!"
                );
            }
        }
    }

    /**
     * Determines if the application is running in a production environment.
     */
    private boolean isProductionEnvironment() {
        // Check for production profile
        if (activeProfile != null && (activeProfile.contains("prod") || activeProfile.contains("production"))) {
            return true;
        }
        
        // Check environment variable
        String env = environment.getProperty("ENV");
        if (env != null && (env.equalsIgnoreCase("prod") || env.equalsIgnoreCase("production"))) {
            return true;
        }
        
        // Check if JPA_DDL_AUTO is explicitly set to validate (indicates production-like setup)
        String jpaDdlAuto = environment.getProperty("JPA_DDL_AUTO");
        if (jpaDdlAuto != null && "validate".equals(jpaDdlAuto)) {
            return true;
        }
        
        return false;
    }
}

