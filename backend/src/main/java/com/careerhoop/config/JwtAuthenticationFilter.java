package com.careerhoop.config;

import com.careerhoop.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        // Allow OPTIONS requests to pass through for CORS preflight
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String jwt = null;

        // Try to get token from Authorization header first (for backward compatibility)
        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
        } else {
            // Try to get token from cookie (cookie-based auth)
            if (request.getCookies() != null) {
                logger.debug("Cookies present in request: {}", 
                    java.util.Arrays.toString(java.util.Arrays.stream(request.getCookies())
                        .map(c -> c.getName())
                        .toArray()));
                for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                    if ("accessToken".equals(cookie.getName())) {
                        jwt = cookie.getValue();
                        logger.debug("Found accessToken cookie, length: {}", jwt != null ? jwt.length() : 0);
                        break;
                    }
                }
            } else {
                logger.debug("No cookies in request for {} {}", request.getMethod(), request.getRequestURI());
            }
        }

        if (jwt != null) {
            try {
                if (jwtService.validateAccessToken(jwt)) {
                    UUID userId = jwtService.extractUserId(jwt);
                    String role = jwtService.extractRole(jwt);

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.info("Authentication set for user {} (role: {}) on {} request: {}", userId, role, request.getMethod(), request.getRequestURI());
                } else {
                    logger.warn("JWT token validation failed for {} request: {} - token may be expired", request.getMethod(), request.getRequestURI());
                }
            } catch (Exception e) {
                // Token is invalid or expired - log for debugging
                logger.warn("JWT token processing failed for {} request {}: {} - {}", request.getMethod(), request.getRequestURI(), e.getClass().getSimpleName(), e.getMessage());
            }
        } else {
            logger.warn("No JWT token found in {} request: {} - cookies: {}", request.getMethod(), request.getRequestURI(), 
                request.getCookies() != null ? java.util.Arrays.toString(java.util.Arrays.stream(request.getCookies())
                    .map(c -> c.getName()).toArray()) : "null");
        }

        filterChain.doFilter(request, response);
    }
}

