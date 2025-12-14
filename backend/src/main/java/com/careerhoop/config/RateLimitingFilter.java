package com.careerhoop.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
@Order(1)
public class RateLimitingFilter extends OncePerRequestFilter {

    // In-memory cache for rate limit buckets per IP/identifier
    // Key: identifier, Value: BucketWithTimestamp
    private final Map<String, BucketWithTimestamp> cache = new ConcurrentHashMap<>();
    
    // Cache entry with timestamp for TTL-based eviction
    private static class BucketWithTimestamp {
        final Bucket bucket;
        volatile long lastAccessed;
        
        BucketWithTimestamp(Bucket bucket) {
            this.bucket = bucket;
            this.lastAccessed = System.currentTimeMillis();
        }
        
        void updateLastAccessed() {
            this.lastAccessed = System.currentTimeMillis();
        }
    }
    
    // TTL for cache entries: 1 hour (entries older than this will be evicted)
    private static final long CACHE_TTL_MS = TimeUnit.HOURS.toMillis(1);
    
    // Scheduled executor for cache cleanup
    private final ScheduledExecutorService cleanupExecutor = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "rate-limit-cache-cleanup");
        t.setDaemon(true);
        return t;
    });
    
    public RateLimitingFilter() {
        // Schedule periodic cache cleanup every 30 minutes
        cleanupExecutor.scheduleAtFixedRate(this::cleanupExpiredEntries, 30, 30, TimeUnit.MINUTES);
    }
    
    /**
     * Removes cache entries that haven't been accessed recently.
     * Uses iterator to avoid full map iteration overhead.
     */
    private void cleanupExpiredEntries() {
        long now = System.currentTimeMillis();
        long expiredThreshold = now - CACHE_TTL_MS;
        
        // Use iterator for more efficient removal
        var iterator = cache.entrySet().iterator();
        while (iterator.hasNext()) {
            var entry = iterator.next();
            if (entry.getValue().lastAccessed < expiredThreshold) {
                iterator.remove();
            }
        }
    }

    // Rate limit configurations
    private static final int LOGIN_LIMIT = 5;
    private static final Duration LOGIN_WINDOW = Duration.ofMinutes(15);

    private static final int REGISTER_LIMIT = 3;
    private static final Duration REGISTER_WINDOW = Duration.ofHours(1);

    private static final int PASSWORD_RESET_LIMIT = 3;
    private static final Duration PASSWORD_RESET_WINDOW = Duration.ofHours(1);

    private static final int REFRESH_LIMIT = 10;
    private static final Duration REFRESH_WINDOW = Duration.ofMinutes(1);

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

        String path = request.getRequestURI();
        String identifier = getIdentifier(request, path);

        // Only apply rate limiting to specific endpoints
        if (shouldRateLimit(path)) {
            Bucket bucket = resolveBucket(identifier, path);
            
            if (!bucket.tryConsume(1)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Determines if the given path should be rate limited.
     */
    private boolean shouldRateLimit(String path) {
        return path.equals("/api/login") ||
               path.equals("/api/register") ||
               path.equals("/api/forgot-password") ||
               path.equals("/api/reset-password") ||
               path.equals("/api/refresh");
    }

    /**
     * Gets the identifier for rate limiting (IP address or email for password reset).
     */
    private String getIdentifier(HttpServletRequest request, String path) {
        // For password reset endpoints, try to extract email from request
        if (path.equals("/api/forgot-password") || path.equals("/api/reset-password")) {
            // Note: In a production system, you might want to parse the request body
            // For now, we'll use IP address as identifier
            // TODO: Consider extracting email from request body for more precise rate limiting
        }
        
        // Use IP address as identifier
        String ipAddress = getClientIpAddress(request);
        return ipAddress;
    }

    /**
     * Gets the client IP address from the request.
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // X-Forwarded-For can contain multiple IPs, take the first one
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    /**
     * Resolves or creates a bucket for the given identifier and path.
     */
    private Bucket resolveBucket(String identifier, String path) {
        String key = identifier + ":" + path;
        
        BucketWithTimestamp entry = cache.computeIfAbsent(key, k -> {
            Bandwidth limit = getBandwidthForPath(path);
            Bucket bucket = Bucket.builder()
                    .addLimit(limit)
                    .build();
            return new BucketWithTimestamp(bucket);
        });
        
        // Update last accessed time to prevent premature eviction
        entry.updateLastAccessed();
        
        return entry.bucket;
    }

    /**
     * Gets the bandwidth configuration for a specific path.
     */
    private Bandwidth getBandwidthForPath(String path) {
        if (path.equals("/api/login")) {
            return Bandwidth.builder()
                    .capacity(LOGIN_LIMIT)
                    .refillIntervally(LOGIN_LIMIT, LOGIN_WINDOW)
                    .build();
        } else if (path.equals("/api/register")) {
            return Bandwidth.builder()
                    .capacity(REGISTER_LIMIT)
                    .refillIntervally(REGISTER_LIMIT, REGISTER_WINDOW)
                    .build();
        } else if (path.equals("/api/forgot-password") || path.equals("/api/reset-password")) {
            return Bandwidth.builder()
                    .capacity(PASSWORD_RESET_LIMIT)
                    .refillIntervally(PASSWORD_RESET_LIMIT, PASSWORD_RESET_WINDOW)
                    .build();
        } else if (path.equals("/api/refresh")) {
            return Bandwidth.builder()
                    .capacity(REFRESH_LIMIT)
                    .refillIntervally(REFRESH_LIMIT, REFRESH_WINDOW)
                    .build();
        }
        
        // Default: no limit (shouldn't reach here)
        return Bandwidth.builder()
                .capacity(1000)
                .refillIntervally(1000, Duration.ofHours(1))
                .build();
    }
}

