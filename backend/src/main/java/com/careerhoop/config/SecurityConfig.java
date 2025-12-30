package com.careerhoop.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private RateLimitingFilter rateLimitingFilter;


    @Value("${app.cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174}")
    private String corsAllowedOrigins;

    @Value("${app.csrf.enabled:true}")
    private boolean csrfEnabled;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // CSRF protection with environment-based toggle
                .csrf(csrf -> {
                    if (csrfEnabled) {
                        // Enable CSRF with cookie-based token storage
                        CookieCsrfTokenRepository tokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
                        tokenRepository.setCookiePath("/");
                        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
                        requestHandler.setCsrfRequestAttributeName("_csrf");
                        
                        csrf.csrfTokenRepository(tokenRepository)
                             .csrfTokenRequestHandler(requestHandler)
                             // Ignore CSRF for stateless auth endpoints, public file upload endpoints, and public CRUD endpoints
                             .ignoringRequestMatchers(
                                "/api/login",
                                "/api/register",
                                "/api/refresh",
                                "/api/health",
                                "/api/grades/ocr",
                                "/api/students",
                                "/api/students/**",
                                "/api/careers",
                                "/api/careers/**",
                                "/api/colleges",
                                "/api/colleges/**",
                                "/api/trainings",
                                "/api/trainings/**",
                                "/api/scholarships",
                                "/api/scholarships/**",
                                "/api/mentors",
                                "/api/mentors/**",
                                "/api/programs",
                                "/api/programs/**",
                                "/api/universities",
                                "/api/universities/**",
                                "/api/recommendations",
                                "/api/recommendations/**",
                                // Saved items and profile endpoints use JWT auth and should not require CSRF
                                "/api/users",
                                "/api/users/**",
                                // Payment callbacks are redirected from eSewa and should not require CSRF
                                "/api/payments",
                                "/api/payments/**"
                             );
                    } else {
                        csrf.disable();
                    }
                })
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Add security headers
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives("default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'")
                        )
                        .httpStrictTransportSecurity(hsts -> hsts
                                .maxAgeInSeconds(31536000)
                        )
                        .frameOptions(frame -> frame.deny())
                        .contentTypeOptions(contentType -> {})
                        .xssProtection(xss -> xss.disable())
                        .referrerPolicy(referrer -> referrer.policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                )
                .authorizeHttpRequests(auth -> auth
                        // Public read-only endpoints (GET only)
                        .requestMatchers(HttpMethod.GET,
                                "/api/careers",
                                "/api/careers/**",
                                "/api/colleges",
                                "/api/colleges/**",
                                "/api/trainings",
                                "/api/trainings/**"
                        ).permitAll()
                        .requestMatchers(
                                "/api/login",
                                "/api/register",
                                "/api/refresh",
                                "/api/health",
                                "/api/grades/ocr",
                                "/api/forgot-password",
                                "/api/verify-otp",
                                "/api/reset-password",
                                "/api/students",
                                "/api/students/**",
                                "/api/scholarships",
                                "/api/scholarships/**",
                                "/api/mentors",
                                "/api/mentors/**",
                                "/api/programs",
                                "/api/programs/**",
                                "/api/universities",
                                "/api/universities/**",
                                // Free users can still request college recommendations (names are masked)
                                "/api/recommendations/colleges",
                                // Payment gateway callbacks
                                "/api/payments/esewa/success",
                                "/api/payments/esewa/failure"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                // Add rate limiting filter before authentication
                .addFilterBefore(rateLimitingFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                ;
        return http.build();
    }

    @Value("${spring.profiles.active:}")
    private String activeProfile;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Validate CORS configuration for production
        boolean isProduction = isProductionEnvironment();
        
        if (isProduction) {
            // In production, CORS origins must be explicitly configured
            if (corsAllowedOrigins == null || corsAllowedOrigins.trim().isEmpty() || 
                corsAllowedOrigins.contains("localhost") || corsAllowedOrigins.contains("127.0.0.1")) {
                throw new IllegalStateException(
                    "CORS configuration error: In production, APP_CORS_ALLOWED_ORIGINS must be set " +
                    "and cannot contain localhost or 127.0.0.1. " +
                    "Please set APP_CORS_ALLOWED_ORIGINS environment variable with your production domain(s)."
                );
            }
        }
        
        // Parse allowed origins from environment variable or use defaults
        List<String> allowedOrigins = Arrays.asList(corsAllowedOrigins.split(","));
        
        // Trim whitespace from each origin
        allowedOrigins = allowedOrigins.stream()
            .map(String::trim)
            .filter(origin -> !origin.isEmpty())
            .toList();
        
        if (allowedOrigins.isEmpty()) {
            throw new IllegalStateException(
                "CORS configuration error: No allowed origins configured. " +
                "Please set APP_CORS_ALLOWED_ORIGINS environment variable."
            );
        }
        
        configuration.setAllowedOrigins(allowedOrigins);
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // Allow all headers including custom headers like X-User-Role and X-User-Id
        configuration.setAllowedHeaders(Arrays.asList(
            "Content-Type", 
            "Authorization", 
            "X-Requested-With",
            "X-User-Role",
            "X-User-Id",
            "X-CSRF-TOKEN"
        ));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        // Expose custom headers
        configuration.setExposedHeaders(Arrays.asList("X-User-Role", "X-User-Id"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
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
        String env = System.getenv("ENV");
        if (env != null && (env.equalsIgnoreCase("prod") || env.equalsIgnoreCase("production"))) {
            return true;
        }
        
        // Check if CORS origins are explicitly set and don't contain localhost (indicates production-like setup)
        if (corsAllowedOrigins != null && 
            !corsAllowedOrigins.contains("localhost") && 
            !corsAllowedOrigins.contains("127.0.0.1") &&
            corsAllowedOrigins.startsWith("https://")) {
            return true;
        }
        
        return false;
    }
}
