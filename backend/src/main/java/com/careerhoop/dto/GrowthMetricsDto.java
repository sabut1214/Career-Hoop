package com.careerhoop.dto;

public record GrowthMetricsDto(
        String entityType, // "students", "careers", "colleges", "trainings", "mentors", "scholarships"
        long currentCount,
        long previousCount,
        double growthPercentage,
        String growthDirection // "UP", "DOWN", "STABLE"
) {
}

