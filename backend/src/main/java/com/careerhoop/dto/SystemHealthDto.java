package com.careerhoop.dto;

public record SystemHealthDto(
        String databaseStatus, // "HEALTHY", "WARNING", "CRITICAL"
        long apiResponseTimeMs,
        long activeUsers24h,
        double errorRate,
        String overallStatus // "HEALTHY", "WARNING", "CRITICAL"
) {
}

