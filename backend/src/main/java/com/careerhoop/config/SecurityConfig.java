package com.careerhoop.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private RateLimitingFilter rateLimitingFilter;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174}")
    private String corsAllowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Disable CSRF for local development to avoid 403 errors on POST/PUT/DELETE
                .csrf(csrf -> csrf.disable())
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
                        .contentTypeOptions(contentType -> contentType.disable())
                        .xssProtection(xss -> xss.disable())
                        .referrerPolicy(referrer -> referrer.policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                )
                .authorizeHttpRequests(auth -> auth
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
                                "/api/data-import/**",
                                "/api/recommendations",
                                "/api/recommendations/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                // Add rate limiting filter before authentication
                .addFilterBefore(rateLimitingFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Parse allowed origins from environment variable or use defaults
        List<String> allowedOrigins = Arrays.asList(corsAllowedOrigins.split(","));
        configuration.setAllowedOrigins(allowedOrigins);
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // Allow all headers including custom headers like X-User-Role and X-User-Id
        configuration.setAllowedHeaders(Arrays.asList(
            "Content-Type", 
            "Authorization", 
            "X-Requested-With",
            "X-User-Role",
            "X-User-Id"
        ));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        // Expose custom headers
        configuration.setExposedHeaders(Arrays.asList("X-User-Role", "X-User-Id"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
