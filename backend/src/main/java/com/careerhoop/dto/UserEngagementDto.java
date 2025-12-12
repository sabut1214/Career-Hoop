package com.careerhoop.dto;

import java.util.Map;

public record UserEngagementDto(
        long activeUsers24h,
        long activeUsers7d,
        long activeUsers30d,
        Map<String, Long> topFeatures, // feature name -> count
        double retentionRate,
        long averageSessionDurationMinutes
) {
}

